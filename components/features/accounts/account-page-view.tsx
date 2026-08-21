"use client"
import ConnectedAccounts from "@/components/features/accounts/ConnectAccounts";
import { ApiKeySettings } from "./Api-Key-Status";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ZernioExplainedPage from "./get-zernio-key";


const AccountPageViewer = () => {
    const zernioKey = useQuery(api.users.getApiKeyStatus);
    return (
        <div className="flex-1 gap-6 space-x-3 space-y-5 justify-center text-center items-center">
           
            <div className="gap-5 justify-between">
                <span className="p-2 text-4xl">{""}</span>
            <ApiKeySettings/>
            </div>
            <span className="gap-3"></span>
            {zernioKey?.hasKey && (
                <ZernioExplainedPage/>
            )}
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