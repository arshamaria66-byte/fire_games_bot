import type { Metadata } from 'next';
import './globals.css';
import { StoreHeader } from '@/components/store-header';
import { CartProvider } from '@/components/cart-provider';
import { StoreFooter } from '@/components/store-footer';
export const metadata: Metadata = { title:{default:'FIRE GAMES | فروشگاه بازی',template:'%s | FIRE GAMES'}, description:'بازی بعدی خودت رو اینجا پیدا کن! فروشگاه بازی‌های کامپیوتر و کنسول برای گیمرها.', metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'), openGraph:{type:'website',locale:'fa_IR',siteName:'FIRE GAMES'} };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="fa" dir="rtl" data-scroll-behavior="smooth"><body><CartProvider><StoreHeader />{children}<StoreFooter /></CartProvider></body></html>; }
