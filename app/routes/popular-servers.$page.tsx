import { db } from "@/.server/db/db";
import useAnimationLoaderData from "@/hooks/useAnimationLoaderData";
import ServerList from "@/layout/routes/popularServers/ServerList";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { typedjson } from "remix-typedjson";

export async function loader({ params }: LoaderFunctionArgs) {
	const page = Number(params.page);
	if (page === 1) {
		throw redirect("/popular-servers");
	}

	const [count, servers] = await Promise.all([
		db.server.count(),
		db.server.findMany({
			take: 10,
			skip: (page - 1) * 10,
			select: {
				id: true,
				server: true,
				favicon: true
			}
		})
	]);

	if (!servers.length) {
		const lastPage = Number((count / 10).toFixed(0));
		throw redirect(`/popular-servers/${lastPage}`);
	}

	return typedjson({ servers, page, count });
}

export default function $page() {
	const { servers, page, count } = useAnimationLoaderData<typeof loader>();

	return (
		<>
			<ServerList servers={[]} page={page} count={count} />
		</>
	);
}
