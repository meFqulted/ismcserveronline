import Link from "@/layout/global/Link";
import { Badge, Button, Flex, HStack, Icon, Image, Tag, Text } from "@chakra-ui/react";
import { memo } from "react";
import { BiUser } from "react-icons/bi";
import { FaChevronUp } from "react-icons/fa";
import { SearchServer } from "~/routes/search";

interface Props {
	server: SearchServer;
	index: number;
	length: number;
}

export default memo(function ServerCard({ server, index, length }: Props) {
	return (
		<Flex
			w="100%"
			bg="alpha"
			roundedTop={index === 0 ? "xl" : undefined}
			roundedBottom={index === length - 1 ? "xl" : undefined}
			p={4}
			gap={4}
		>
			<Flex
				w="100%"
				flexDir={{
					base: "column",
					md: "row"
				}}
				gap={4}
			>
				<Flex gap={4} w="100%">
					<Image
						src={server.favicon ?? "/mc-icon.png"}
						boxSize={24}
						sx={{
							imageRendering: "pixelated"
						}}
						rounded="md"
					/>

					<Flex flexDir={"column"} gap={1} overflow={"hidden"} w="100%">
						<Flex w="100%" justifyContent={"space-between"}>
							<Flex flexDir={"column"} gap={1}>
								<Link to={`/${server.bedrock ? "bedrock/" : ""}${server.server}`} fontSize="lg" fontWeight="bold">
									{server.server}{" "}
									{server.owner_id && (
										<Badge colorScheme={"green"} ml={1}>
											Verified
										</Badge>
									)}
									{server.prime && (
										<Badge colorScheme={"purple"} ml={1}>
											Prime
										</Badge>
									)}
								</Link>
								<HStack spacing={1}>
									<Icon as={BiUser} color={"brand"} />
									<Text fontSize={"sm"}>
										{server.players.online}/{server.players.max}
									</Text>
								</HStack>
							</Flex>

							<HStack
								display={{
									base: "none",
									md: "flex"
								}}
							>
								<Button as={Link} to={`/${server.server}`} variant={"solid"}>
									View
								</Button>
								<Button
									as={Link}
									to={`/${server.server}/vote`}
									variant={"solid"}
									leftIcon={<Icon as={FaChevronUp} />}
								>
									Vote ({server._count.Vote})
								</Button>
							</HStack>
						</Flex>

						<HStack spacing={1} overflow={"hidden"} w="100%" overflowX={"hidden"}>
							{server.Tags.map((tag) => (
								<Tag
									key={tag.name}
									fontSize={"sm"}
									flexWrap={"nowrap"}
									w="fit-content"
									flexShrink={0}
									whiteSpace={"none"}
									display={"inline-flex"}
									sx={{
										textWrap: "nowrap"
									}}
								>
									{tag.name}
								</Tag>
							))}
						</HStack>
					</Flex>
				</Flex>

				<HStack
					display={{
						base: "flex",
						md: "none"
					}}
					justifyContent={"flex-end"}
					w="100%"
				>
					<Button as={Link} to={`/${server.server}`} variant={"solid"}>
						View
					</Button>
					<Button as={Link} to={`/${server.server}/vote`} variant={"solid"} leftIcon={<Icon as={FaChevronUp} />}>
						Vote ({server._count.Vote})
					</Button>
				</HStack>
			</Flex>
		</Flex>
	);
});