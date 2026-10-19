'use client';
import { createContext,useContext,useEffect,useMemo,useState } from 'react';
import type { Product } from '@/types/database';import {calculateSubtotal,isValidQuantity} from '@/lib/pricing.mjs';
type Line={product:Pick<Product,'id'|'slug'|'name'|'platform'|'price_toman'|'image_url'>;quantity:number};
type CartApi={items:Line[];count:number;subtotal:number;add:(p:Product)=>void;setQuantity:(id:string,n:number)=>void;remove:(id:string)=>void};
const CartContext=createContext<CartApi|null>(null);
export function CartProvider({children}:{children:React.ReactNode}) {const [items,setItems]=useState<Line[]>([]);const [ready,setReady]=useState(false);
 useEffect(()=>{const timer=window.setTimeout(()=>{try{const raw=localStorage.getItem('fire-games-cart');if(raw)setItems(JSON.parse(raw));}catch{}setReady(true)},0);return()=>window.clearTimeout(timer)},[]);
 useEffect(()=>{if(ready)localStorage.setItem('fire-games-cart',JSON.stringify(items));},[items,ready]);
 const api=useMemo<CartApi>(()=>({items,count:items.reduce((s,i)=>s+i.quantity,0),subtotal:calculateSubtotal(items.map(i=>({price_toman:i.product.price_toman,quantity:i.quantity}))),add:(p)=>setItems(curr=>{const found=curr.find(i=>i.product.id===p.id);return found?curr.map(i=>i.product.id===p.id?{...i,quantity:Math.min(i.quantity+1,99)}:i):[...curr,{product:{id:p.id,slug:p.slug,name:p.name,platform:p.platform,price_toman:p.price_toman,image_url:p.image_url},quantity:1}]}),setQuantity:(id,n)=>setItems(curr=>n<=0?curr.filter(i=>i.product.id!==id):isValidQuantity(Math.floor(n))?curr.map(i=>i.product.id===id?{...i,quantity:Math.floor(n)}:i):curr),remove:(id)=>setItems(curr=>curr.filter(i=>i.product.id!==id))}),[items]);
 return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}
export function useCart(){const value=useContext(CartContext);if(!value)throw new Error('useCart must be used inside CartProvider');return value;}
