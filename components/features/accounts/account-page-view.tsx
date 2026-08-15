import ConnectedAccounts from "@/components/features/accounts/ConnectAccounts";
import { ApiKeySettings } from "./Api-Key-Status";


const AccountPageViewer = () => {
    return (
        <div className="flex-1 gap-6 space-x-3 space-y-5 justify-center text-center items-center">
            Contul tau
            <div className="gap-5 justify-between">
                <span className="text-lg dark:text-blue-600/80 text-green-600/80">Cheia Zernio</span>
            <ApiKeySettings/>
            </div>
            <span className="gap-3"></span>
            <div className="gap-5 justify-between text-center">
                <span>Conecteaza-te la platforme</span>
            <ConnectedAccounts/>
            </div>
        </div>
    );
}
 
export default AccountPageViewer;