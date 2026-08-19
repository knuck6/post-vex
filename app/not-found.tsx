import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyContent,EmptyTitle,EmptyDescription } from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import { HomeIcon } from "lucide-react";
import Link from "next/link";

const NotFound = () => {
    return (
        <div className="flex w-full items-center justify-center overflow-hidden">
			<div className="flex h-screen items-center border-x">
				<div>
                    
					<FullWidthDivider />
					<Empty>
						<EmptyHeader>
							<EmptyTitle className="font-black font-mono text-8xl">
								404
							</EmptyTitle>
							<EmptyDescription className="text-nowrap">
								Pagina pe care o cauti nu a existat sau nu mai exista <br />
								sa mutat sau sa stins .
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<div className="flex mx-auto gap-2">
								<Button className={"justify-center text-center object-center cursor-pointer bg-teal-600/85"} variant={"ghost"} size={"lg"}>
									<Link href="/" className="flex  space-x-7 ">
										<HomeIcon className="size-6 text-indigo-600 animate-pulse" />
									 <p className="text-gray-950 leading-relaxed font-semibold"> Acasa</p>
									</Link>
								</Button>
								
							</div>
						</EmptyContent>
					</Empty>
					<FullWidthDivider />
				</div>
			</div>
		</div>
    );
}
 


type FullWidthDividerProps = React.ComponentProps<"div"> & {
	contained?: boolean;
	position?: "top" | "bottom";
};

export function FullWidthDivider({
	className,
	contained = false,
	position,
	...props
}: FullWidthDividerProps) {
	return (
		<div
			aria-hidden="true"
			className={cn(
				"pointer-events-none absolute h-px bg-border",
				// full-bleed (default)
				"data-[contained=false]:left-1/2 data-[contained=false]:w-screen data-[contained=false]:-translate-x-1/2",
				// contained
				"data-[contained=true]:inset-x-0 data-[contained=true]:w-full",
				// position
				position &&
					"data-[position=top]:-top-px data-[position=bottom]:-bottom-px",
				className
			)}
			data-contained={contained}
			data-position={position}
			{...props}
		/>
	);
}
export default NotFound;