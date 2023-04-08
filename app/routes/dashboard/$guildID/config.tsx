import {
	Button,
	Flex,
	HStack,
	Heading,
	Icon,
	Skeleton,
	Stack,
	Text,
	VStack,
	VisuallyHiddenInput,
	Wrap,
	WrapItem
} from "@chakra-ui/react";
import { type LoaderArgs, json, fetch as nodeFetch, ActionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData, useRevalidator } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { BiColorFill, BiSave } from "react-icons/bi";
import { HiRefresh } from "react-icons/hi";
import StatusColor from "~/components/layout/dashboard/StatusColor";
import OnlineColor from "~/components/layout/dashboard/StatusColor";

export async function loader({ params }: LoaderArgs) {
	const guildID = params.guildID!;

	const config = await (
		await nodeFetch(
			`${
				process.env.NODE_ENV === "production" ? "https://bot.ismcserver.online" : "http://localhost:3004"
			}/${guildID}/config`,
			{
				method: "get",
				headers: {
					Authorization: process.env.SUPER_DUPER_API_ACCESS_TOKEN ?? ""
				}
			}
		)
	).json();

	return json({ config });
}

export async function action({ request, params }: ActionArgs) {
	const formData = await request.formData();
	const guildID = params.guildID!;

	const res = await (
		await nodeFetch(
			`${
				process.env.NODE_ENV === "production" ? "https://bot.ismcserver.online" : "http://localhost:3004"
			}/${guildID}/config/edit`,
			{
				method: "post",
				headers: {
					"Content-Type": "application/json",
					Authorization: process.env.SUPER_DUPER_API_ACCESS_TOKEN ?? ""
				},
				body: JSON.stringify(Object.fromEntries(formData))
			}
		)
	).json();

	return json(res);
}

export default function Config() {
	const lastConfig = useRef(null);
	const { config } = useLoaderData<typeof loader>() || {
		config: lastConfig.current
	};
	useEffect(() => {
		if (config) lastConfig.current = config;
	}, [config]);

	const fetcher = useFetcher();
	const { revalidate, state } = useRevalidator();

	const data = fetcher.data;
	console.log(data);

	return (
		<fetcher.Form method="post" style={{ width: "100%" }}>
			<VStack w="100%" align={"start"} spacing={7}>
				<Stack direction={{ base: "column", md: "row" }} spacing={10} w={{ base: "100%", md: "lg" }}>
					<StatusColor config={config} type="online" />
					<StatusColor config={config} type="offline" />
				</Stack>
				<VStack w="100%" align={"start"}>
					<Wrap>
						<WrapItem>
							<Button
								transform={"auto-gpu"}
								_active={{ scale: 0.9 }}
								isLoading={state === "loading"}
								onClick={revalidate}
								variant={"brand"}
							>
								<HStack>
									<Icon as={HiRefresh} />
									<Text>{"Refresh data"}</Text>
								</HStack>
							</Button>
						</WrapItem>

						<WrapItem>
							<Button
								transform={"auto-gpu"}
								isLoading={fetcher.state !== "idle"}
								type="submit"
								variant={"brand"}
								colorScheme={"green"}
								_hover={{ bg: "green.600" }}
								_active={{ bg: "green.700", scale: 0.9 }}
								bg={"green.500"}
								color={"white"}
							>
								<HStack>
									<Icon as={BiSave} />
									<Text>Update</Text>
								</HStack>
							</Button>
						</WrapItem>
					</Wrap>
					{data && (
						<Text color={data.success ? "green" : "red"} fontWeight={600}>
							{data.message}
						</Text>
					)}
				</VStack>
			</VStack>
		</fetcher.Form>
	);
}
