import { createClient } from '@supabase/supabase-js';
import type { Product } from '@/types/database';

// Explicit development fixtures only. These mirror supabase/seed.sql and are used when
// credentials are absent so the storefront can be explored before connecting a project.
export const sampleProducts: Product[] = [
 { id:'dev-elden-ring',name:'Elden Ring',slug:'elden-ring',short_description:'یک ماجراجویی حماسی در سرزمین‌های میانه.',description:'در این ماجراجویی نقش‌آفرینی فانتزی، سرزمین‌های میانه را کاوش کنید. این تصویر جلد، طرح گرافیکی اختصاصی FIRE GAMES برای پیش‌نمایش است و اثر هنری رسمی بازی نیست.',platform:'PC',category:'اکشن',genre:'نقش‌آفرینی',price_toman:2450000,original_price_toman:null,image_url:'/games/elden-ring.svg',gallery:[],developer:'FromSoftware',publisher:'Bandai Namco',release_date:'2022-02-25',edition:'Standard',availability:'in_stock',featured:true,published:true,created_at:'2026-10-01',updated_at:'2026-10-01' },
 { id:'dev-god-of-war',name:'God of War Ragnarök',slug:'god-of-war-ragnarok',short_description:'سفری اسطوره‌ای در نه قلمرو.',description:'کریتوس و آترئوس در جهانی اساطیری، با انتخاب‌ها و چالش‌های تازه روبه‌رو می‌شوند. این تصویر جلد، طرح گرافیکی اختصاصی FIRE GAMES برای پیش‌نمایش است و اثر هنری رسمی بازی نیست.',platform:'PS5',category:'ماجراجویی',genre:'اکشن ماجراجویی',price_toman:3800000,original_price_toman:null,image_url:'/games/god-of-war.svg',gallery:[],developer:'Santa Monica Studio',publisher:'Sony Interactive Entertainment',release_date:'2022-11-09',edition:'Standard',availability:'in_stock',featured:true,published:true,created_at:'2026-10-01',updated_at:'2026-10-01' },
 { id:'dev-fc26',name:'EA SPORTS FC 26',slug:'ea-sports-fc-26',short_description:'فصل تازه‌ای از فوتبال را تجربه کن.',description:'با فصل جدید فوتبال، تیم محبوب خودت را بساز و وارد مسابقه شو. این تصویر جلد، طرح گرافیکی اختصاصی FIRE GAMES برای پیش‌نمایش است و اثر هنری رسمی بازی نیست.',platform:'PS5',category:'ورزشی',genre:'ورزشی',price_toman:4200000,original_price_toman:null,image_url:'/games/fc-26.svg',gallery:[],developer:'EA Sports',publisher:'Electronic Arts',release_date:'2025-09-26',edition:'Standard',availability:'in_stock',featured:true,published:true,created_at:'2026-10-01',updated_at:'2026-10-01' },
 { id:'dev-cyberpunk',name:'Cyberpunk 2077',slug:'cyberpunk-2077',short_description:'در نایت‌سیتی، افسانه‌ی خودت را بساز.',description:'در کلان‌شهر آینده‌نگر نایت‌سیتی، مسیر خودت را انتخاب کن. قیمت نمونه‌ی seed برای توسعه است و تخفیف تا زمان ایجاد کمپین فعال نمایش داده نمی‌شود. این تصویر جلد، طرح گرافیکی اختصاصی FIRE GAMES برای پیش‌نمایش است و اثر هنری رسمی بازی نیست.',platform:'PC',category:'اکشن',genre:'نقش‌آفرینی',price_toman:1900000,original_price_toman:null,image_url:'/games/cyberpunk.svg',gallery:[],developer:'CD PROJEKT RED',publisher:'CD PROJEKT RED',release_date:'2020-12-10',edition:'Standard',availability:'in_stock',featured:false,published:true,created_at:'2026-10-01',updated_at:'2026-10-01' }
];
const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
export async function getProducts(): Promise<Product[]> {
 if (!configured) return sampleProducts;
 const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
 const { data, error } = await supabase.from('products').select('*').eq('published', true).order('featured', {ascending:false}).order('created_at',{ascending:false});
 if (error) { console.error('Product query failed', error.message); return []; }
 const products=(data ?? []) as Product[];
 const now=new Date().toISOString();
 const {data:discounts}=await supabase.from('discounts').select('product_id,sale_price_toman').eq('active',true).lte('starts_at',now).gt('ends_at',now);
 const active=new Map((discounts||[]).map(d=>[d.product_id,Number(d.sale_price_toman)]));
 return products.map(product=>{const sale=active.get(product.id);return sale!==undefined?{...product,original_price_toman:product.price_toman,price_toman:sale}:product});
}
export async function getProduct(slug:string):Promise<Product|null>{ return (await getProducts()).find(p=>p.slug===slug) ?? null; }
export function toman(value:number){return new Intl.NumberFormat('fa-IR').format(value);}
export const isSupabaseConfigured = configured;
export async function getStorefrontSettings(){if(!configured)return {description:'تمرکز ما ساخت تجربه‌ای ساده و دوست‌داشتنی برای گیمرهاست.',support_email:'',promo_message:''};const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);const {data}=await sb.from('store_settings').select('value').eq('key','storefront').eq('public_visible',true).maybeSingle();return {description:String(data?.value?.description||''),support_email:String(data?.value?.support_email||''),promo_message:String(data?.value?.promo_message||'')};}
