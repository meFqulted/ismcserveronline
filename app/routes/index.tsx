import { Flex, Heading, Stack, chakra, VStack, Text, Image } from "@chakra-ui/react";
import { type ActionArgs, redirect, type MetaFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import type { LoaderArgs } from "@remix-run/node";
import { getCookieWithoutDocument } from "~/components/utils/func/cookiesFunc";
import BotInfo from "~/components/layout/index/BotInfo";
import HowToUse from "~/components/layout/index/HowToUse";
import SampleServers from "~/components/layout/index/SampleServers/SampleServers";
import { db } from "~/components/utils/db.server";
import { validateServer } from "~/components/server/validateServer";
import ServerSearch from "~/components/layout/index/ServerSearch";
import { Ad } from "~/components/ads/Ad";

export async function action({ request }: ActionArgs) {
	const formData = await request.formData();
	const bedrock = getCookieWithoutDocument("bedrock", request.headers.get("cookie") ?? "") === "true" ? true : false;
	const server = formData.get("server")?.toString().toLowerCase();

	if (!server) {
		return null;
	}

	const error = validateServer(server);
	if (error) return json({ error });

	return redirect(`/${bedrock ? "bedrock/" : ""}${server}`);
}

export const meta: MetaFunction = () => {
	return {
		title: "Minecraft server status | IsMcServer.online"
	};
};

export async function loader({ request }: LoaderArgs) {
	const cookies = request.headers.get("Cookie");
	const bedrock = getCookieWithoutDocument("bedrock", cookies ?? "");

	const sampleServers = await new Promise((resolve) => {
		resolve(
			db.sampleServer.findMany({
				select: {
					bedrock: true,
					server: true,
					favicon: true
				},
				orderBy: {
					add_date: "desc"
				},
				// get only servers that end dates are below current date or that doesnt have end date
				where: {
					OR: [
						{
							end_date: {
								lt: new Date(),
								equals: null
							}
						},
						{
							end_date: {
								equals: null
							}
						}
					]
				}
			})
		);
	});

	return json({ bedrock: bedrock == "true" ? true : false, sampleServers });
}

export default function Index() {
	const lastBedrock = useRef({});
	const lastSampleServers = useRef({});

	const { bedrock, sampleServers } = useLoaderData() ?? {
		bedrock: lastBedrock.current,
		sampleServers: lastSampleServers.current
	};

	useEffect(() => {
		if (bedrock) lastBedrock.current = bedrock;
		if (sampleServers) lastSampleServers.current = sampleServers;
	}, [bedrock, sampleServers]);

	const [bedrockChecked, setBedrockChecked] = useState<boolean>(bedrock ? bedrock : false);
	const [serverValue, setServerValue] = useState<string>("");

	return (
		<Flex flexDir={"column"} maxW="1200px" mx="auto" w="100%" mt={"75px"} px="4">
			<Stack spacing={10} direction={{ base: "column", md: "row" }}>
				<VStack spacing={"50px"} w={{ base: "100%", md: "50%" }} mt={"50px"} flexDir="column">
					<Heading as={"h1"} fontSize="3xl">
						<chakra.span color={"orange"}>Real</chakra.span>
						-time
						<chakra.span color={"green"}> Minecraft </chakra.span>
						server
						<chakra.span color={"pink.400"}> status </chakra.span>
						and
						<chakra.span color={"purple.500"}> data </chakra.span>
						checker
					</Heading>

					<ServerSearch
						bedrockChecked={bedrockChecked}
						serverValue={serverValue}
						setBedrockChecked={setBedrockChecked}
						setServerValue={setServerValue}
					/>

					<Text fontWeight={600} color="textSec" maxW={"423px"} alignSelf="start">
						Get information about your favourite Minecraft server for Java or Bedrock edition!
					</Text>
				</VStack>

				<Flex w={{ base: "100%", md: "50%" }}>
					<Image
						src="/webp/ismcserveronlineimg.webp"
						display={"block"}
						alt="image"
						width={"100%"}
						height={"100%"}
						sx={{ imageRendering: "pixelated", aspectRatio: "4/3" }}
					/>
				</Flex>
			</Stack>

			<Ad />

			<SampleServers setServerValue={setServerValue} setBedrock={setBedrockChecked} />

			<BotInfo />

			<Ad />

			<HowToUse />

			<Ad />
		</Flex>
	);
}
