"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import linkToCheck from "@/lib/assets/link-active-ApiKey.png";
import buttonToApiKey from "@/lib/assets/ApiKey-show-button.png";
import modalToApiKey from "@/lib/assets/ApiKey-show-after-button.png";
import copiKey from "@/lib/assets/ApiKey-show-when-need-to-copy.png";
import { Copy, Tally1, Tally2, Tally3, Tally4 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ZernioExplainedPage = () => {
    return (
        <div className="text-center justify-center gap-3 p-3 flex-1">
            <h1>Cheia Zernio, cum se obtine:</h1>
            <Separator className={"p-1 dark:bg-gray-800/25"} />
            <p>Te autentifici pe Zernio  vezi "Catre Cheie" apasa pe el pentru a ajunge acolo rapid</p>
            <span className="text-4xl">{""}</span>
            <Link href="https://zernio.com/dashboard/api-keys" target="__blank">
                <Button variant="default" size={"lg"} className={"text-white  cursor-pointer rounded-sm"}>Catre Cheie</Button>
            </Link>
            <Separator className={"p-1 dark:bg-gray-800/25"} />
            <Dialog>
                <DialogTrigger render={<Button variant={"secondary"}><Tally1 className="size-6" /></Button>} />
                <DialogContent className={"flex flex-col wrap-anywhere p-20  min-w-7xl dark:bg-amber-600/75 "}>
                    <DialogTitle className={"max-w-2xl text-3xl "}>
                        Fi sigur ca esti acolo unde trebuie https://zernio.com/dashboard/api-keys
                    </DialogTitle>
                    <DialogDescription >

                        <div className="flex flex-col pt-6  gap-3 max-h-screen max-w-2xl ">
                            <Image src={linkToCheck} width={800} height={900}  className="hover:scale-130 mx-8 max-h-dvh" alt="checker-step1" loading="eager" />
                            <br />
                            <p className="pt-2 dark:text-black text-lg">In bara din stange selecteaza API Keys</p>
                        </div>
                    </DialogDescription>
                </DialogContent>
            </Dialog>


            <Separator className={"p-1 dark:bg-gray-800/25"} />
            <Dialog>
                <DialogTrigger render={<Button variant={"secondary"}><Tally2 className="size-6" /></Button>} />
                <DialogContent className={"flex flex-col wrap-anywhere p-20 dark:bg-amber-600/75  min-w-7xl"}>
                    <DialogTitle className={"max-w-2xl text-3xl "}>
                        apasa butonul rosu din partea dreapta cu "+ Create key"
                    </DialogTitle>
                    <DialogDescription >
                        <div className="flex flex-col  gap-3 max-h-screen max-w-2xl ">
                            <Image src={buttonToApiKey} width={750} height={10} loading="eager" className="hover:scale-200 max-w-xl mx-74" alt="button-show" />
                            <br />
                        </div>
                    </DialogDescription>
                </DialogContent>
            </Dialog>            
            <Separator className={"p-1 dark:bg-gray-800/25"} />
            <Dialog>
                <DialogTrigger render={<Button variant={"secondary"}><Tally3 className="size-6"/></Button>} />
                <DialogContent className={"flex flex-col wrap-anywhere p-20 dark:bg-amber-600/75  min-w-7xl"}>
                    <DialogTitle className={"max-w-xl text-3xl flex-col text-center text-wrap "}>
                        In partea dreapta se va deschide un panou ,
                        <br/>
                         Key Name: foloseste numele nostru pentru indentificarea usoara.
                        
                    </DialogTitle>
                    <DialogDescription >
                        <div className="flex flex-col  gap-3 max-h-screen max-w-2xl ">
                            <Image src={modalToApiKey} width={750} height={450} className="hover:scale-125 mx-8" loading="eager" alt="key-modal-opener" />
                            <p className="text-lg text-red-400 dark:text-black  pt-8">Apasa Create key</p>
                        </div>
                    </DialogDescription>
                </DialogContent>
            </Dialog>
            <Separator className={"p-1 dark:bg-gray-800/25"} />
            <Dialog>
                <DialogTrigger render={<Button variant={"secondary"}><Tally4 className="size-6"/></Button>} />
                <DialogContent className={"flex flex-col wrap-anywhere p-20 dark:bg-amber-600/75  min-w-7xl"}>
                    <DialogTitle className={"max-w-xl text-3xl flex-col text-center text-wrap "}>
                    Pentru a copia poti apasa butonul
                    <br/>
                 <span className="flex text-center justify-center text-xl text-red-400 dark:text-black"><Copy className="size-6" /> Copy Key </span>
                        
                    </DialogTitle>
                    <DialogDescription >
                        <div className="flex flex-col pt-16 gap-3 max-h-screen max-w-2xl">
                             <Image src={copiKey} width={150} height={100} className="hover:scale-x-200 hover:scale-y-125 mx-12" alt="copy-key" loading="eager" />
                            <span className="text-lg text-red-400 dark:text-black font-semibold pt-16 flex gap-1.5">Apasa  </span>
                             <Copy className="size-6" /> Copy Key
                        </div>
                    </DialogDescription>
                </DialogContent>
            </Dialog>
           
          
            <Separator />
            <h2 className="text-2xl text-red-400">Dupa parcurgerea secventelor</h2>
            <p className="text-red-400">insereaza cheia in spatiul alocat dupa "Cheia ta:" </p>

        </div>
    );
}

export default ZernioExplainedPage;