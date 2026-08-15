import ConnectedAccounts from "@/components/features/accounts/ConnectAccounts";
import AccountPageViewer from "@/components/features/accounts/account-page-view";


const ContPage = () => {
   
    return (
        <div className="pt-14 justify-center text-center ">
            {/* header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-sm">
                <AccountPageViewer/>
            </div>
        </div>
    );
}
 
export default ContPage;