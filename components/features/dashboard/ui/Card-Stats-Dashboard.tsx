"use client"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { ActivityIcon, SendIcon, User2Icon } from "lucide-react";


const CardStatsDashboard = () => {
    const data = useQuery(api.dashboard.getDashboardOverview);
   
    return (
        <div className="grid pt-8 gap-3 space-y-6 items-center justify-center text-center">
          
            {data?.stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 justify-between gap-4 mx-auto p-2">
                    <div className="border rounded-xl p-0.5 relative bg-white shadow-sm">
                        <Card>
                            <CardHeader>
                                <CardTitle><span className="absolute top-6 right-8 text-xs font-semibold text-red-500">
                                    +{data?.stats.scheduled.todayDelta} today
                                </span></CardTitle>
                                <CardDescription>
                                    <div className="text-3xl font-bold">{data?.stats.scheduled.total}</div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent><div className="text-sm text-gray-500 mt-2">scheduled post</div></CardContent>
                        </Card>
                    </div><div className="border rounded-xl p-0.5 relative bg-white shadow-sm">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <span className="absolute top-4 right-4 text-xs font-semibold text-red-500">
                                        +{data?.stats.published.todayDelta} today
                                    </span>
                                </CardTitle>
                                <CardDescription>
                                    <div className="text-3xl font-bold">{data?.stats.published.total}</div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent><div className="text-sm text-gray-500 mt-2">published post</div></CardContent>
                        </Card>
                    </div><div className="border rounded-xl p-0.5 relative bg-white shadow-sm">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <span className="absolute top-4 right-4 text-xs font-semibold text-red-500">
                                        {data?.stats.connectedAccounts.statusText}
                                    </span>
                                </CardTitle>
                                <CardDescription>
                                    <div className="text-3xl font-bold">
                                        {data?.stats.connectedAccounts.total}
                                    </div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent><div className="text-sm text-gray-500 mt-2">connected accounts</div></CardContent>
                        </Card>
                    </div></div>) : (
                <div className="flex justify-center text-center ">
                    <User2Icon className="size-8 text-blue-600" />
                    <h2 className="flex-1 text-2xl leading-relaxed">No activity</h2>
                </div>
            )}

            {data?.recentActivity.length === 0 ? (
                <div className="flex-row items-center justify-center pt-8 py-16 px-6">

                    <div className="flex items-center justify-center bg-slate-200 rounded-2xl mb-3 size-12">
                        <ActivityIcon className="size-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm">No activity yet</p>
                    <p className="text-slate-500 text-sm">Connect accounts and schedule posts to see events here</p>
                </div>
            ) :
                (<div className="divide-y divide-slate-50">
                    {data?.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                            <div className="size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-zinc-50 text-zinc-600">
                                <SendIcon className="size-4" />
                            </div>
                            <span className="p-2 bg-gray-100 rounded-full text-xs">🚀</span>
                            <div>
                                <div className="font-semibold text-gray-800">
                                    {activity.actionType === "POST_PUBLISHED"
                                        ? "Published"
                                        : "AI Action"}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span>Published</span>
                                    <span>{new Date(activity.timestamp).toUTCString()}</span>
                                </div>
                                <p className="text-sm text-slate-600">{activity.description}</p>
                            </div>
                        </div>
                    ))}
                </div>)}

        </div>
    );
}

export default CardStatsDashboard;