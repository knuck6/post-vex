"use client"
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
            <Sidebar className="flex">
                <SidebarRail />
                <SidebarHeader className="flex items-center text-3xl  p-6">Postatorul</SidebarHeader>
                <SidebarContent>
                    <SidebarGroup className="text-center gap-6 pt-4">
                        {navLinks.map(({ href, label, icon: Icon }) => {
                            const isActive =
                                pathname === href ||
                                (href !== "/dashboard" && pathname.startsWith(href));
                            return (
                                <Link key={href} href={href}
                                    className={cn(
                                        "flex items-center gap-5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-accent-ai-text hover:bg-muted hover:text-foreground"
                                    )}>
                                    <Icon className="size-12" />
                                    <span>{label}</span>
                                </Link>
                            )
                        })}
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter className="flex items-center pb-8">
                    <Button variant={"ghost"}>
                        <UserButton />
                    </Button>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <div className="p-2 overflow-hidden">

                
                    <nav>
                       
                       
                    </nav>
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

