import { redirect, type LoaderArgs } from "@remix-run/node";
import { useOutlet } from "@remix-run/react";
import { getUser } from "~/components/server/db/models/getUser";
import { Divider, Heading, VStack } from "@chakra-ui/react";
import Link from "~/components/utils/Link";
import { commitSession, getSession } from "~/components/server/session.server";

export async function loader({ request }: LoaderArgs) {
	const user = await getUser(request);

	const url = new URL(request.url);
	const session = await getSession(request.headers.get("Cookie"));

	if (!user) {
		const redirectURL = url.searchParams.get("redirect");
		const guildID = url.searchParams.get("guild");

		session.set("redirect", redirectURL);
		session.set("guild", guildID);

		console.log(`session redirect: ${session.get(redirectURL ?? "")}`);

		return redirect("/login", {
			headers: {
				"set-cookie": await commitSession(session)
			}
		});
	}

	const redirectURL = session.get("redirect");
	const guildID = session.get("guild");

	if (redirectURL) {
		// session.unset("redirect");
		// session.unset("guild");

		return redirect(`/dashboard/${guildID}/${redirectURL}`, {
			headers: {
				"Set-Cookie": await commitSession(session)
			}
		});
	}

	return null;
}

export default function Dashboard() {
	const outlet = useOutlet();

	return (
		<VStack w="100%" maxW={"1200px"} mx="auto" align={"start"} mt={5} spacing={10} px={4}>
			<VStack w="100%" align={"start"}>
				<Heading fontSize={"5xl"} as={Link} to="/dashboard">
					Dashboard
				</Heading>
				<Divider />
			</VStack>
			{outlet}
		</VStack>
	);
}
