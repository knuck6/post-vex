import { Button } from "@/components/ui/button";
import { Show, SignUp } from "@clerk/nextjs";
import { SendToBack, Sparkles } from "lucide-react";
import Link from "next/link";

const SignInPage = () => {
    return (
          <main>
          <header className="flex items-center bg-gray-600/15 rounded-3xl gap-3 md:shadow-lg md:shadow-amber-400/80 p-4 ">
            {/* brand */}
            <div className="flex items-center gap-2.5 pr-2">
                
                <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient">
                    <SendToBack className="size-6 text-cyan-600 animate-spin"/>
                </div>
                <span className="brand-gradient tracking-tighter">Postatorul</span>
            </div>
            <nav className="mx-auto  items-center gap-1 rounded-4xl lg:flex">
            </nav>

            {/* right side of top */}
            <div className="ml-auto flex items-center gap-2">
                <Show when={"signed-in"}>
                <Link href="/dashboard/home">
                <Button className="bg-accent-ai text-black dark:text-white flex items-center space-x-2">
                   Vezi bordul tau
                </Button>
                </Link>
                </Show>
            </div>
        </header>
    <div className='flex flex-3 flex-col items-center justify-center pt-24 lg:pt-56 '>
        <SignUp forceRedirectUrl={"/dashboard"} fallbackRedirectUrl={'/dashboard'}/>
    </div>    
    </main>
    );
}
 
export default SignInPage;