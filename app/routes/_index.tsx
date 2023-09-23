import { Divider, VStack } from "@chakra-ui/react";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Ad, adType } from "~/components/ads/Yes";
import BotInfo from "~/components/layout/index/BotInfo";
import HowToUse from "~/components/layout/index/HowToUse";
import Main from "~/components/layout/index/Main";
import SampleServers from "~/components/layout/index/SampleServers/SampleServers";
import WARWF from "~/components/layout/index/WARWF";
import { db } from "~/components/server/db/db.server";
import { validateServer } from "~/components/server/functions/validateServer";
import { getCookieWithoutDocument } from "~/components/utils/func/cookiesFunc";
import PopularServers from "../components/layout/index/PopularServers";

export async function action({ request }: ActionArgs) {
	const formData = await request.formData();
	const bedrock = getCookieWithoutDocument("bedrock", request.headers.get("cookie") ?? "") === "true";
	const query = getCookieWithoutDocument("query", request.headers.get("cookie") ?? "") === "true";
	const server = formData.get("server")?.toString().toLowerCase();

	if (!server) {
		return null;
	}

	const error = validateServer(server);
	if (error) return json({ error });

	return redirect(`/${bedrock ? "bedrock/" : ""}${server}${query && !bedrock ? "?query" : ""}`);
}

export const meta: MetaFunction = () => {
	return {
		title: "Minecraft server status | IsMcServer.online"
	};
};

export async function loader({ request }: LoaderArgs) {
	const cookies = request.headers.get("Cookie");
	const bedrock = getCookieWithoutDocument("bedrock", cookies ?? "") === "true";
	const query = getCookieWithoutDocument("query", cookies ?? "") === "true";

	const [sampleServers, count] = await Promise.all([
		db.sampleServer.findMany({
			select: {
				bedrock: true,
				server: true,
				favicon: true
			},
			orderBy: {
				add_date: "desc"
			},
			// get only servers that end dates are greater than now or null
			where: {
				OR: [
					{
						end_date: {
							gte: new Date()
						}
					},
					{
						end_date: {
							equals: null
						}
					}
				]
			}
		}),
		db.check.count()
	]);

	return json({ bedrock, query, sampleServers, count });
}

export default function Index() {
	const lastBedrock = useRef({});
	const lastSampleServers = useRef({});
	const lastQuery = useRef({});
	const lastCount = useRef(0);

	const { bedrock, sampleServers, query, count } = useLoaderData() ?? {
		bedrock: lastBedrock.current,
		sampleServers: lastSampleServers.current,
		query: lastQuery.current,
		count: lastCount.current
	};

	useEffect(() => {
		if (bedrock) lastBedrock.current = bedrock;
		if (sampleServers) lastSampleServers.current = sampleServers;
		if (query) lastQuery.current = query;
		if (count) lastCount.current = count;
	}, [bedrock, sampleServers, query, count]);

	const [bedrockChecked, setBedrockChecked] = useState<boolean>(bedrock ? bedrock : false);
	const [serverValue, setServerValue] = useState<string>("");

	return (
		<VStack flexDir={"column"} maxW="1200px" mx="auto" w="100%" mt={"75px"} mb={10} px="4" spacing={14}>
			<Main
				bedrockChecked={bedrockChecked}
				query={query}
				serverValue={serverValue}
				setBedrockChecked={setBedrockChecked}
				setServerValue={setServerValue}
				count={count}
			/>

			<SampleServers setServerValue={setServerValue} setBedrock={setBedrockChecked} />

			<Divider />
			<BotInfo />
			<Divider />

			<Ad type={adType.small} />

			<VStack spacing={"28"} w="100%" align={"start"}>
				<HowToUse />

				<Ad type={adType.responsive} />

				<PopularServers />

				<Ad type={adType.small} />

				{/* What are you waiting for? */}
				<WARWF />
			</VStack>

			<Ad type={adType.multiplex} />
		</VStack>
	);
}