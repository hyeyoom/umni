'use client';

import {usePathname, useSearchParams} from 'next/navigation';
import {useEffect} from 'react';

export default function usePageTracking() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname && window.gtag) {
            window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
                page_path: pathname + searchParams.toString(),
            });
        }
    }, [pathname, searchParams]);
}
