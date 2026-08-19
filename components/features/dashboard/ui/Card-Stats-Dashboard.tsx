"use client"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { api } from "@/convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import { ActivityIcon, Globe, SendIcon, User2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { PLATFORM_CONFIG } from "../../compose/dashboard-posts";
import { Separator } from "@/components/ui/separator";


const CardStatsDashboard = () => {
    const data = useQuery(api.dashboard.getDashboardOverview);
    const accounts = useQuery(api.accounts.listAccounts);
    const getZernioPosts = useAction(api.posts.getZernioPosts);
    const [posts, setPosts] = useState<{ upcoming: any[]; published: any[] }>({
        upcoming: [],
        published: [],
    });

    const fetchPosts = async () => {
        const data = await getZernioPosts();
        setPosts({ upcoming: data.upcoming, published: data.published });
    };
    useEffect(() => {
        fetchPosts();
    }, [data]);
    return (
        <div className="grid pt-8 gap-3 space-y-6 items-center justify-center text-center">

            {data?.stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 justify-between gap-4 mx-auto p-2">
                    <div className="border rounded-xl p-0.5 relative bg-white shadow-md dark:bg-gray-900/55">
                        <Card>
                            <CardHeader>
                                <CardTitle><p className="absolute top-4 right-4 text-xs font-semibold text-red-500">
                                    +{data?.stats.scheduled.todayDelta} azi
                                </p></CardTitle>
                                <CardDescription>
                                    <div className="text-3xl font-bold">{data?.stats.scheduled.total}</div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent><div className="text-sm text-gray-400 mt-2">Posturi pregatite</div></CardContent>
                        </Card>
                    </div><div className="border rounded-xl p-0.5 relative bg-white shadow-md dark:bg-gray-900/55">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <p className="absolute top-4 right-4 text-xs font-semibold text-red-500">
                                        +{data?.stats.published.todayDelta} azi
                                    </p>
                                </CardTitle>
                                <CardDescription>
                                    <div className="text-3xl font-bold">{data?.stats.published.total}</div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent><div className="text-sm text-gray-400 mt-2">Posturi publicate prin noi</div></CardContent>
                        </Card>
                    </div><div className="border rounded-xl p-0.5 relative bg-white shadow-md dark:bg-gray-900/55">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <p className="absolute top-4 right-4 text-xs font-semibold text-red-500">
                                        {accounts?.length === 0 ? ('inactive') : ("activ")}
                                    </p>
                                </CardTitle>
                                <CardDescription>
                                    <div className="text-3xl font-bold">
                                        {accounts?.length}
                                    </div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent><div className="text-sm text-gray-400 mt-2">Conturi conectate</div></CardContent>
                        </Card>
                    </div></div>) : (
                <div className="flex justify-center text-center ">
                    <User2Icon className="size-8 text-blue-600" />
                    <h2 className="flex-1 text-2xl leading-relaxed">No activity</h2>
                </div>
            )}
            <Separator />
            <span className="space-x-3"></span>
            {posts.published.length === 0 ? (
                <div className="flex-row items-center justify-center pt-8 py-16 px-6">

                    <div className="flex items-center justify-center bg-slate-200 rounded-2xl mb-3 size-12">
                        <ActivityIcon className="size-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm">No activity yet</p>
                    <p className="text-slate-500 text-sm">Connect accounts and schedule posts to see events here</p>
                </div>
            ) :
                (<div className="flex-wrap hover:opacity-85 cursor-pointer lg:h-72 lg:overflow-y-scroll">
                    {posts?.published.map((activity) => (
                        <div key={activity.id} className="flex  flex-col
                        items-start gap-4 px-6 py-4 ">
                            <div className="size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-zinc-50 text-zinc-600">
                                <SendIcon className="size-5" />
                            </div>
                            <span className="dark:bg-dark rounded-full text-sm font-semibold line-clamp-2">
                                {activity.content}
                            </span>
                          
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span>Publicat</span>
                                    <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm flex dark:text-blue-600 gap-0.5">
                                    Platforma : {' '}
                                    {activity.platforms.map((p: string) => {
                                        const config = PLATFORM_CONFIG[p] || { icon: Globe };
                                        const Icon = config.icon;
                                        return (<Icon key={p} className="size-6 text-blue-600 dark:text-slate-600" />);
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>)}

        </div>
    );
}

export default CardStatsDashboard;