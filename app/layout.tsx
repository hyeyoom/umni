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
    title: "움니 - 수학적 계산과 단위 변환 도구",
    description: "수학적 계산과 단위 변환을 쉽게 할 수 있는 인터프리터 기반 도구입니다.",
    keywords: ["계산기", "단위변환", "수학", "프로그래밍", "인터프리터"],
    openGraph: {
        title: "움니 - 수학적 계산과 단위 변환 도구",
        description: "수학적 계산과 단위 변환을 쉽게 할 수 있는 인터프리터 기반 도구입니다.",
        url: process.env.NEXT_PUBLIC_SITE_URL,
        siteName: "움니",
        locale: "ko_KR",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "움니 - 수학적 계산과 단위 변환 도구",
        description: "수학적 계산과 단위 변환을 쉽게 할 수 있는 인터프리터 기반 도구입니다.",
    },
    verification: {
        google: "Google Search Console에서 받은 인증 코드",
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
