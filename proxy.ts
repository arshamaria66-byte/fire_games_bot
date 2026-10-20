import {createServerClient} from '@supabase/ssr';
import {NextResponse,type NextRequest} from 'next/server';

export async function proxy(request:NextRequest){
 const path=request.nextUrl.pathname;
 const adminRoute=path.startsWith('/admin')&&!path.startsWith('/admin/login');
 const accountRoute=path.startsWith('/account');
 if(!adminRoute&&!accountRoute)return NextResponse.next();
 const loginPath=adminRoute?'/admin/login':'/auth/login';
 const setupParam=adminRoute?'reason=setup':'error=setup';
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return NextResponse.redirect(new URL(`${loginPath}?${setupParam}`,request.url));
 let response=NextResponse.next({request});
 const supabase=createServerClient(url,key,{cookies:{
  getAll(){return request.cookies.getAll()},
  setAll(values){values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options))}
 }});
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.redirect(new URL(`${loginPath}?next=${encodeURIComponent(path)}`,request.url));
 if(adminRoute){
  const {data,error}=await supabase.from('admin_roles').select('user_id').eq('user_id',user.id).maybeSingle();
  if(error||!data)return NextResponse.redirect(new URL('/admin/login?error=unauthorized',request.url));
 }
 return response;
}
export const config={matcher:['/account/:path*','/admin/:path*']};
