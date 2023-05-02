import { ChakraBaseProvider, cookieStorageManagerSSR, localStorageManager, useConst } from "@chakra-ui/react";
import { type ActionArgs, json, redirect, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import { useLoaderData, useLocation, useOutlet } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "./components/layout/Layout";
import theme from "./components/utils/theme";
import { type LinksFunction } from "@remix-run/react/dist/routeModules";
import { getCookieWithoutDocument } from "./components/utils/func/cookiesFunc";
import { validateServer } from "./components/server/functions/validateServer";
import { GlobalContext } from "./components/utils/GlobalContext";
import { Document } from "./document";

// ----------------------------- META -----------------------------

export const meta: MetaFunction = () => ({
	title: "IsMcServer.online",
	robots: "all",
	description: "Check Minecraft server status and data by real-time.",
	keywords:
		"Minecraft server check, Server status check, Minecraft server status, Online server status, Minecraft server monitor, Server checker tool, Minecraft server checker, Real-time server status, Minecraft server status checker, Server uptime checker, Minecraft server monitor tool, Minecraft server status monitor, Real-time server monitoring, Server availability checker, Minecraft server uptime checker",
	charset: "utf-8",
	viewport: "width=device-width,initial-scale=1",
	author: ".imexoodeex#0528"
});

// ----------------------------- LINKS -----------------------------

export const links: LinksFunction = () => {
	return [
		{ rel: "preconnect", href: "https://fonts.googleapis.com" },
		{
			rel: "preconnect",
			href: "https://fonts.gstatic.com",
			crossOrigin: "anonymous"
		},
		{
			rel: "stylesheet",
			href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&&family=Outfit:wght@700;800;900&display=swap"
		}
	];
};

// ----------------------------- APP -----------------------------

export default function App() {
	const { cookies } = useLoaderData();
	const cookieManager = useConst(cookieStorageManagerSSR(cookies));
	const location = useLocation();
	const outlet = useOutlet();

	return (
		<Document>
			<ChakraBaseProvider
				resetCSS
				theme={theme}
				colorModeManager={typeof cookies === "string" ? cookieManager : localStorageManager}
			>
				<GlobalContext>
					<Layout>
						<AnimatePresence initial={false} mode="wait">
							<motion.main
								key={location.pathname}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{
									ease: [0.25, 0.1, 0.25, 1],
									duration: 0.1125
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

export const loader: LoaderFunction = async ({ request }) => {
	const url = new URL(request.url);
	const term = url.searchParams.get(process.env.NO_ADS_PARAM_NAME ?? "nope");

	const shouldRedirect: boolean = term?.toString() === process.env.NO_ADS_PARAM_VALUE;
	if (shouldRedirect) {
		return redirect(url.pathname, {
			headers: [["Set-Cookie", `no_ads=${process.env.NO_ADS_PARAM_VALUE}`]]
		});
	}

	const showAds: boolean =
		getCookieWithoutDocument("no_ads", request.headers.get("cookie") ?? "") !== process.env.NO_ADS_PARAM_VALUE;
	// ^^^ code for no ads up there uwu ^^^

	return json({ cookies: request.headers.get("cookie") ?? "", showAds });
};

// ----------------------------- ACTION -----------------------------

export async function action({ request }: ActionArgs) {
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
