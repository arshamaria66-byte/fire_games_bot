import {requireCustomer} from '@/lib/auth/customer';
import {AccountShell} from '@/components/account/account-shell';
export const dynamic='force-dynamic';
export default async function AccountLayout({children}:{children:React.ReactNode}){const {user}=await requireCustomer();return <AccountShell email={user.email||''}>{children}</AccountShell>}
