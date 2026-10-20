import {redirect} from 'next/navigation';
import {createSupabaseServer} from '@/lib/supabase/server';
export async function requireCustomer(){
 const supabase=await createSupabaseServer();
 if(!supabase)redirect('/auth/login?error=setup');
 const {data:{user},error}=await supabase.auth.getUser();
 if(error||!user)redirect('/auth/login?next=/account');
 return {supabase,user};
}
