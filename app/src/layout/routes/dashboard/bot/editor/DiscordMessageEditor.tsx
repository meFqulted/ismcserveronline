import MessageEditor from "@/layout/routes/dashboard/bot/editor/MessageEditor";
import Placeholders from "@/layout/routes/dashboard/bot/editor/Placeholders";
import Preview from "@/layout/routes/dashboard/bot/editor/Preview";
import { Flex } from "@chakra-ui/react";
import { useState } from "react";

export type DiscordMessageType = "livecheck" | "alert";

export interface DiscordMessage {
	type: DiscordMessageType;
	content: string;
	embed: {
		author: {
			name: string | null;
			url: string | null;
			icon_url: string | null;
		};
		title: string | null;
		description: string | null;
		url: string | null;
		color: number | null;
		image: {
			url: string | null;
		};
		thumbnail: {
			url: string | null;
		};
		footer: {
			text: string | null;
			icon_url: string | null;
		} | null;
		fields: {
			name: string | null;
			value: string | null;
			inline: boolean | null;
			isOpen?: boolean;
		}[];
	};
}

interface Props {
	type: DiscordMessageType;
	message: DiscordMessage;
}

// This was fucking hell, but still better than svelte :)
export default function DiscordMessageEditor({ type, message: initialMessage }: Props) {
	const [message, setMessage] = useState<DiscordMessage>(initialMessage);

	return (
		<Flex
			flexDir={{
				base: "column",
				md: "row"
			}}
			w="100%"
			gap={4}
		>
			<Placeholders type={type} />

			<MessageEditor message={message} setMessage={setMessage} />

			<Flex
				bg="alpha"
				border={"1px solid"}
				borderColor={"alpha300"}
				w={{
					base: "100%",
					md: "60%"
				}}
				p={3}
				overflowX={"auto"}
				h={"min"}
				rounded={"lg"}
			>
				<Preview message={message} />
			</Flex>
		</Flex>
	);
}
