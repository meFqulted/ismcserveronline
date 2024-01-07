import { ChakraBaseProvider, cookieStorageManagerSSR, useConst } from "@chakra-ui/react";
import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction, json, redirect } from "@remix-run/node";
import type { ShouldRevalidateFunctionArgs } from "@remix-run/react";
import { useLocation, useOutlet } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import Layout from "./components/layout/Layout";
import { getUser } from "./components/server/db/models/user";
import { validateServer } from "./components/server/functions/validateServer";
import { GlobalContext } from "./components/utils/GlobalContext";
import { getCookieWithoutDocument } from "./components/utils/functions/cookies";
import useTheme from "./components/utils/theme";
import { Document } from "./document";

// ----------------------------- META -----------------------------

export function meta() {
	const desc =
		"Check Minecraft server status and data by real-time (Java and Bedrock). Comment and vote for your favorite server easily.";

	return [
		{
			name: "robots",
			content: "all"
		},
		{
			name: "description",
			content: desc
		},
		// og tags
		{
			property: "og:description",
			content: desc
		},
		{
			property: "og:image",
			content: "https://ismcserver.online/webp/statusbotlogo512.webp"
		},
		{
			property: "og:url",
			content: "https://ismcserver.online/"
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "keywords",
			content:
				"Minecraft server check, Server status check, Minecraft server status, Online server status, Minecraft server monitor, Server checker tool, Minecraft server checker, Real-time server status, Minecraft server status checker, Server uptime checker, Minecraft server monitor tool, Minecraft server status monitor, Real-time server monitoring, Server availability checker, Minecraft server uptime checker"
		},
		{
			charSet: "utf-8"
		},
		{
			name: "viewport",
			content: "width=device-width,initial-scale=1"
		},
		{
			name: "author",
			content: "imexoodeex"
		}
	] as ReturnType<MetaFunction>;
}

// ----------------------------- LINKS -----------------------------

export function links() {
	return [
		{ rel: "preconnect", href: "https://fonts.googleapis.com" },
		{
			rel: "preconnect",
			href: "https://fonts.gstatic.com",
			crossOrigin: "anonymous"
		},
		{
			rel: "stylesheet",
			href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Outfit:wght@700;800;900&family=Montserrat:wght@200;300;400;500;600;700;800;900&display=swap"
		}
	];
}

// ----------------------------- APP -----------------------------

export default function App() {
	const { cookies } = useTypedLoaderData<typeof loader>();
	const cookieManager = useConst(cookieStorageManagerSSR(cookies));
	const path = useLocation().pathname;
	const outlet = useOutlet();
	const customTheme = useTheme();

	const isDash = path.startsWith("/dashboard");
	const animationKey = isDash ? "dashboard" : path;

	return (
		<Document>
			<ChakraBaseProvider resetCSS theme={customTheme} colorModeManager={cookieManager}>
				<GlobalContext>
					<Layout>
						<AnimatePresence initial={false} mode={"popLayout"}>
							<motion.main
								custom={isDash}
								key={animationKey}
								initial={{
									opacity: 0,
									scale: 0.95
								}}
								animate={{
									opacity: 1,
									scale: 1
								}}
								exit={{
									opacity: 0,
									scale: 0.95
								}}
								transition={{
									ease: [0.25, 0.1, 0.25, 1],
									duration: 0.2
								}}
								style={{
									overflow: "hidden",
									display: "block"
								}}
							>
								{outlet}
							</motion.main>
						</AnimatePresence>
					</Layout>
				</GlobalContext>
			</ChakraBaseProvider>
		</Document>
	);
}

// ----------------------------- LOADER -----------------------------

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const term = url.searchParams.get(process.env.NO_ADS_PARAM_NAME ?? "nope");

	const shouldRedirect: boolean = term?.toString() === process.env.NO_ADS_PARAM_VALUE;
	if (shouldRedirect) {
		throw redirect(url.pathname, {
			headers: [["Set-Cookie", `no_ads=${process.env.NO_ADS_PARAM_VALUE}`]]
		});
	}

	const user = await getUser(request);

	const showAds = user?.everPurchased
		? false
		: getCookieWithoutDocument("no_ads", request.headers.get("cookie") ?? "") !== process.env.NO_ADS_PARAM_VALUE;
	// ^^^ code for no ads up there uwu ^^^

	return typedjson({
		cookies: request.headers.get("cookie") ?? "",
		showAds,
		user,
		dashUrl: process.env.DASH_URL
	});
}

export function shouldRevalidate({ nextUrl }: ShouldRevalidateFunctionArgs) {
	if (nextUrl.pathname === "/login") return true;
	return false;
}

// ----------------------------- ACTION -----------------------------

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const bedrock = getCookieWithoutDocument("bedrock", request.headers.get("Cookie") ?? "");

	const server = formData.get("server")?.toString().toLowerCase();

	if (!server) {
		return null;
	}

	const error = validateServer(server);
	if (error) return json({ error });

	return redirect(`/${bedrock == "true" ? "bedrock/" : ""}${server}`);
}

// ----------------------------- ERROR -----------------------------

export { ErrorBoundary } from "./document";
