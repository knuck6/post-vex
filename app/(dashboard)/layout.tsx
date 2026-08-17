"use client"
import MainNavbar from "@/components/features/main-navbar";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarInset, SidebarProvider, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSync } from "@/components/UserSync";
import { ZernioSync } from "@/components/ZernioSync";
import { navLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";


type Props = {
    children: React.ReactNode
}
const LayoutDashboard = ({ children }: Props) => {
    const pathname = usePathname()
    return (
        <SidebarProvider className="flex">
            <Sidebar variant="floating">
                
                <SidebarHeader className="flex items-center text-3xl  p-6">Postator</SidebarHeader>
                <SidebarContent>
                    <SidebarGroup className="text-center gap-6 pt-4">
                        {navLinks.map(({ href, label, icon: Icon }) => {
                            const isActive =
                                pathname === href ||
                                (href !== "/dashboard" && pathname.startsWith(href));
                            return (
                                <Link key={href} href={href}
                                    className={cn(
                                        "flex items-center gap-8 space-x-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-accent-ai-text hover:bg-muted hover:text-foreground"
                                    )}>
                                    <Icon className="size-8" />
                                    <span>{label}</span>
                                </Link>
                            )
                        })}
                    </SidebarGroup>
                    
                </SidebarContent>
                <SidebarFooter className="flex items-center">
                    <div className="flex-1 text-center ">
                        <p className="text-sm capitalize">tasta D </p>
                        <span className="text-sm text-wrap">apasata pentru intuneric/luminat</span>
                    </div>
                    <Button variant={"ghost"}>
                        <UserButton />
                    </Button>
                    <span className="pb-16"></span>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <div className="p-2 overflow-hidden">

                
                    <MainNavbar/>
                    <main className="flex px-auto justify-center text-center">
                        <ZernioSync>
                            <UserSync>

                                {children}
                            </UserSync>
                        </ZernioSync>
                    </main>
                </div>
                
            </SidebarInset>
        </SidebarProvider>
    );
}


export default LayoutDashboard;

