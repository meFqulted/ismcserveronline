import { Box } from "@chakra-ui/react";
import CookieConstent from "./CookieConstent";
import Footer from "./Footer";
import Header from "./Header";

export default function Layout({ children }: { children?: React.ReactNode }) {
    return (
        <>
            <Box pos={'sticky'} top={0} zIndex={1} backdropFilter={'blur(12px)'}>
                <CookieConstent />
                <Header />
            </Box>
            {children}
            <Footer />
        </>
    )
}