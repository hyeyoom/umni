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
    title: "iNum - Smart Calculator for Everyone",
    description: "A programmer-friendly calculator that anyone can use. Convert units, write functions, and calculate with ease.",
    keywords: ["calculator", "unit converter", "developer tools", "programming", "math"],
    openGraph: {
        title: "iNum - Smart Calculator for Everyone",
        description: "A programmer-friendly calculator that anyone can use. Convert units, write functions, and calculate with ease.",
        url: process.env.NEXT_PUBLIC_SITE_URL,
        siteName: "iNum",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "iNum - Smart Calculator for Everyone",
        description: "A programmer-friendly calculator that anyone can use. Convert units, write functions, and calculate with ease.",
    },
    verification: {
        google: "iWmaFInJnmbUgp-og6FwJxMepqJkuWHaNIKr5kkjlCo",
    },
    alternates: {
        canonical: process.env.NEXT_PUBLIC_SITE_URL,
    },
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
