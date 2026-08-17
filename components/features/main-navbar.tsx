import { Sparkle } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import { navLinks } from "@/lib/constants";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MainNavbar = () => {
    const pathname = usePathname()
    return (
        <header className="sticky  top-0 z-50 flex items-center backdrop-blur-sm rounded-xl gap-3  p-4 ">
            <SidebarTrigger />
            <div className="hidden items-center gap-2.5 pr-2 text-2xl md:flex font-mono font-semibold tracking-wider">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl">
                    <Sparkle className="size-6 animate-spin text-cyan-600" />
                </div>
            </div>
            <span>Postator</span>
            
            <div className="ml-auto p-2 mx-auto flex items-center gap-2 bg-accent-ai rounded-2xl">
                  <nav className="hidden ml-auto gap-2 mx-auto lg:flex items-center">
                    {navLinks.map(({ href, label, icon: Icon }) => {
                        const isActive =
                            pathname === href ||
                            (href !== "/dashboard" && pathname.startsWith(href));
                        return (
                            <Link
                                key={href}
                                href={href}

                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition tracking-wide hover:shadow-2xl hover:bg-gray-400/20",
                                    isActive
                                        ? "bg-blue-600/45 text-primary-foreground"
                                        : "hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className="size-8" />
                                <span className="text-lg">{label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </header>
    );
}

export default MainNavbar;