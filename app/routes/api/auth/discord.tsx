import { type LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/components/server/auth/auth.server";

export async function loader({ request }: LoaderArgs) {
	return await authenticator.authenticate("discord", request);
}