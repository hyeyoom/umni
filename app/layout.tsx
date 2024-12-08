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
    title: "Your Calculator Lives in Browser",
    description: "Access powerful calculations from any browser, any device",
    keywords: [
        "online calculator",
        "browser calculator",
        "web calculator",
        "programming calculator",
        "unit converter",
        "developer tools",
        "math functions"
    ],
    icons: {
        icon: [
            { rel: 'icon', url: '/icons/icon.svg', type: 'image/svg+xml' }
        ]
    },
    manifest: '/manifest.json',
    openGraph: {
        title: "Your Calculator Lives in Browser",
        description: "Access powerful calculations from any browser, any device",
        url: process.env.NEXT_PUBLIC_SITE_URL,
        siteName: "iNum",
        locale: "en_US",
        type: "website",
        images: [{
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/og/og-image.png`,
            width: 1200,
            height: 630,
            alt: 'iNum Calculator - Your Calculator Lives in Browser'
        }]
    },
    twitter: {
        card: 'summary_large_image',
        title: "Your Calculator Lives in Browser",
        description: "Access powerful calculations from any browser, any device",
        images: [`${process.env.NEXT_PUBLIC_SITE_URL}/og/og-image.png`],
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
