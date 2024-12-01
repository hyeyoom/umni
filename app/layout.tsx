import type {Metadata} from "next";
import localFont from "next/font/local";
import GoogleAnalytics from './components/GoogleAnalytics';

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "움니",
    description: "._.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics GA_TRACKING_ID={process.env.NEXT_PUBLIC_GA_ID}/>
        )}
        {children}
        </body>
        </html>
    );
}
