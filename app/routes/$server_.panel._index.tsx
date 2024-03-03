import { db } from "@/.server/db/db";
import { getUser } from "@/.server/db/models/user";
import { cachePrefetch } from "@/.server/functions/fetchHelpers.server";
import { csrf } from "@/.server/functions/security.server";
import { getFullFileUrl } from "@/functions/storage";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import useAnyPrime from "@/hooks/useAnyPrime";
import DragAndDropFile from "@/layout/routes/server/panel/DragAndDropFile";
import { StatBox, Tags, TemplateAlertDialog } from "@/layout/routes/server/panel/ServerPanelComponents";
import { ServerModel } from "@/types/minecraftServer";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { Divider, Flex, IconButton, Image, SimpleGrid, Text, Tooltip } from "@chakra-ui/react";
import type { LoaderFunctionArgs, MetaArgs } from "@remix-run/node";
import { MetaFunction, ShouldRevalidateFunctionArgs } from "@remix-run/react";
import dayjs from "dayjs";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";

export function meta({ data, matches, params }: MetaArgs) {
	return [
		{
			title: params.server + "'s panel | IsMcServer.online"
		},
		...matches[0].meta
	] as ReturnType<MetaFunction>;
}

export function shouldRevalidate(args: ShouldRevalidateFunctionArgs) {
	if (args.actionResult?.revalidate === true) return true;

	return false;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	csrf(request);

	const user = await getUser(request);
	invariant(user, "User is not logged in");

	const url = new URL(request.url);
	const bedrock = url.pathname.split("/")[0] === "bedrock";
	const server = await db.server.findFirst({
		where: {
			server: params.server?.toLowerCase(),
			bedrock
		},
		select: {
			id: true,
			server: true,
			bedrock: true,
			online: true,
			players: true,
			owner_id: true,
			banner: true,
			Tags: true,
			background: true,
			prime: true
		}
	});
	if (!server) throw new Response("Server not found", { status: 404 });
	if (!server.owner_id) throw new Response("Server not verified", { status: 404 });

	const lastMonth = dayjs().subtract(1, "month").startOf("month");
	const todaysDayInLastMonth = dayjs().subtract(1, "month");

	const promises = [
		db.vote.count({
			where: {
				server_id: server.id,
				created_at: {
					gte: dayjs().startOf("month").toDate()
				}
			}
		}),
		db.vote.count({
			where: {
				server_id: server.id,
				created_at: {
					gte: dayjs().startOf("month").toDate()
				}
			}
		}),
		db.check.count({
			where: {
				server_id: server.id
			}
		}),
		db.check.count({
			where: {
				server_id: server.id,
				checked_at: {
					gte: dayjs().startOf("month").toDate()
				}
			}
		}),
		db.comment.count({
			where: {
				server_id: server.id
			}
		}),
		db.vote.count({
			where: {
				server_id: server.id,
				created_at: {
					gte: lastMonth.toDate(),
					lte: todaysDayInLastMonth.toDate()
				}
			}
		}),
		db.check.count({
			where: {
				server_id: server.id,
				checked_at: {
					gte: lastMonth.toDate(),
					lte: todaysDayInLastMonth.toDate()
				}
			}
		})
	];

	// didnt want to defer it, cause too much work
	const [votes, votesInThisMonth, checks, checksInThisMonth, comments, votesInLastMonth, checksInLastMonth] = await Promise.all(
		promises
	);

	return typedjson(
		{
			server,
			votes,
			votesInThisMonth,
			checks,
			checksInThisMonth,
			comments,
			votesInLastMonth,
			checksInLastMonth
		},
		cachePrefetch(request)
	);
}

export default function ServerPanel() {
	const { server, checks, checksInThisMonth, comments, votes, votesInThisMonth, checksInLastMonth, votesInLastMonth } =
		useAnimationLoaderData<typeof loader>();

	const hasPrime = useAnyPrime(server);
	// const hasPrime = false;

	return (
		<Flex gap={10} w="100%" flexDir={"column"}>
			<Flex gap={4} w="100%" flexDir={"column"}>
				<Text fontSize={"2xl"} fontWeight={600}>
					Statistics
				</Text>

				<Flex flexDir={"column"} gap={2}>
					<Text color={"textSec"} fontSize={"lg"} fontWeight={600}>
						This month
					</Text>
					<SimpleGrid minChildWidth={"250px"} w="100%" gap={4}>
						<StatBox title={"Votes in this month"} value={votesInThisMonth} helper={votesInLastMonth} />
						<StatBox title={"Checks in this month"} value={checksInThisMonth} helper={checksInLastMonth} />
					</SimpleGrid>
				</Flex>

				<Flex flexDir={"column"} gap={2}>
					<Text color={"textSec"} fontSize={"lg"} fontWeight={600}>
						Total
					</Text>
					<SimpleGrid minChildWidth={"250px"} w="100%" gap={4}>
						<StatBox title={"Votes"} value={votes} />
						<StatBox title={"Checks"} value={checks} />
						<StatBox title={"Comments"} value={comments} />
					</SimpleGrid>
				</Flex>
			</Flex>

			<Divider />

			<Flex gap={10} w="100%" flexDir={"column"}>
				<Flex flexDir={"column"} gap={4} w={"100%"}>
					<Text fontSize={"2xl"} fontWeight={600}>
						Server Information
					</Text>

					<Flex gap={2} flexDir={{ base: "column", md: "row" }}>
						<Flex p={4} rounded="xl" border="1px solid" borderColor={"alpha300"} flexDir={"column"} w="100%" gap={1}>
							<Text fontWeight={600}>Server Status</Text>

							<Text color={server.online ? "green" : "red"} fontSize={"2xl"} fontWeight={600}>
								{server.online ? "Online" : "Offline"}
							</Text>
						</Flex>

						<Flex p={4} rounded="xl" border="1px solid" borderColor={"alpha300"} flexDir={"column"} w="100%" gap={1}>
							<Text fontWeight={600}>Current Players</Text>

							<Text color={"textSec"} fontSize={"2xl"} fontWeight={600}>
								{(server.players as any as ServerModel.Players<any>).online}
							</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex flexDir={"column"} gap={4} w={"100%"}>
					<Tags tags={server.Tags.map((tag) => tag.name)} serverId={server.id} />
				</Flex>

				<Flex flexDir={"column"} gap={2}>
					<Flex w="100%" alignItems={"center"} gap={4} justifyContent={"space-between"}>
						<Flex flexDir={"column"}>
							<Text fontSize={"lg"} fontWeight={600}>
								Banner
							</Text>
							<Text color={"textSec"}>
								Upload a banner for your server. It will be displayed on the server's page.
							</Text>
						</Flex>

						<TemplateAlertDialog />
					</Flex>

					{server.banner && (
						<Image src={getFullFileUrl(server.banner, "banner")} alt={`${server.server}'s banner`} w="100%" />
					)}
					<DragAndDropFile fileName="banner" serverId={server.id} />
				</Flex>

				<Flex flexDir={"column"} gap={2}>
					<Flex w="100%" alignItems={"center"} gap={4} justifyContent={"space-between"}>
						<Flex flexDir={"column"}>
							<Text fontSize={"lg"} fontWeight={600}>
								Background
							</Text>
							<Text color={"textSec"}>
								Upload own background for your server. It will be displayed in the Background.
							</Text>
						</Flex>

						{!hasPrime && (
							<Tooltip label="This feature requires prime subscription." hasArrow>
								<IconButton
									aria-label="Info"
									icon={
										<InfoOutlineIcon
											color="orange"
											filter={"drop-shadow(0px 0px 6px rgba(255, 119, 0, 0.5))"}
										/>
									}
									variant={"ghost"}
								/>
							</Tooltip>
						)}
					</Flex>

					{server.background && (
						<Image src={getFullFileUrl(server.background, "background")} alt={`${server.server}'s banner`} w="100%" />
					)}
					<Flex
						w="100%"
						opacity={hasPrime ? 1 : 0.5}
						flexDir={"column"}
						cursor={hasPrime ? "pointer" : "not-allowed"}
						gap={2}
					>
						<Flex pointerEvents={hasPrime ? "auto" : "none"}>
							<DragAndDropFile fileName="background" serverId={server.id} />
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	);
}