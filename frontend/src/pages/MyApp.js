import { ThemeProvider } from "../components/theme-provider"; // adjust path if needed
import "../App.css"; // or wherever your global styles are

function MyApp({ Component, pageProps }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head />
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Component {...pageProps} />
                </ThemeProvider>
            </body>
        </html>
    );
}

export default MyApp;
