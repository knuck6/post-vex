"use client"
import ConnectedAccounts from "@/components/features/accounts/ConnectAccounts";
import { ApiKeySettings } from "./Api-Key-Status";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";


const AccountPageViewer = () => {
    const zernioKey = useQuery(api.users.getApiKeyStatus);
    return (
        <div className="flex-1 gap-6 space-x-3 space-y-5 justify-center text-center items-center">
           
            <div className="gap-5 justify-between">
                <span className="text-lg dark:text-blue-600/80 text-green-600/80">Cheia Zernio</span>
            {zernioKey?.hasKey && (
            <div className="text-center">
                <h1>Cheia Zernio</h1>
                <Link href="https://zernio.com/dashboard/api-keys" target="__blank">
                <Button variant="ghost">Catre Cheie</Button>
                </Link>
            </div>

            )}
            <ApiKeySettings/>
            </div>
            <span className="gap-3"></span>
            {zernioKey?.hasKey && (

            <div className="gap-5 justify-between text-center">
                <span>Conecteaza-te la platforme</span>
            <ConnectedAccounts/>
            </div>
            )}
        </div>
    );
}
 
export default AccountPageViewer;