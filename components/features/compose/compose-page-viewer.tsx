import { ComposePostManager } from "./compose-manager";
import { DashboardPosts } from "./dashboard-posts";

const ComposePageViewer = () => {
    return (
        <div className="space-x-2.5">
           <span className="p-2"></span>
            <ComposePostManager/>
            
        </div>
    );
}
 
export default ComposePageViewer;