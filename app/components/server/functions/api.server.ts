import { BedrockServer, MinecraftServer, MinecraftServerWoQuery } from "~/components/types/minecraftServer";
import serverConfig from "../serverConfig.server";
import { requireEnv } from "./env.server";

async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getServerInfo<T extends boolean = false, K extends boolean = false>(
	address: string,
	query?: T,
	bedrock?: K
): Promise<T extends true ? MinecraftServer : K extends true ? BedrockServer : MinecraftServerWoQuery> {
	if (query && bedrock) throw new Error("Cannot query bedrock servers.");

	const str = `${serverConfig.api}/${bedrock ? "bedrock/" : query ? "/query" : ""}${address}`;

	return fetch(str, {
		headers: {
			Authorization: requireEnv("API_TOKEN")
		}
	}).then((res) => res.json());
}
