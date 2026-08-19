import { Button } from "@/components/ui/button"
import { Show, SignInButton } from "@clerk/nextjs"
import { ArrowRightIcon, CalendarDaysIcon, CheckCircleIcon, DotIcon, HashIcon, SendToBack, Share2Icon, Sparkle, Wand2Icon, ZapIcon } from "lucide-react"
import Link from "next/link"

const features = [
    {
        icon: CalendarDaysIcon,
        title: "Postare inteligenta",
        description: "Creaza coada de posturi pentru toate socia media . Setezi odata si noi ne ocupam de restu.",
        color: "bg-red-50 text-red-500",
    },
    {
        icon: Wand2Icon,
        title: "IA-content generat",
        description: "Genereaza imagini grozave cu IA modat pentru social media. Nu ii mai lasa sa se uite la o pagina goala.",
        color: "bg-red-50 text-red-500",
    },

    
    {
        icon: Share2Icon,
        title: "Multi-Platforme",
        description: "Conecteaza LinkedIn, Facebook,Bluesky si Instagram. Posteaza dintr-un singur loc.",
        color: "bg-red-50 text-red-500",
    },
    {
        icon: ZapIcon,
        title: "Publicare instanta",
        description: "Ai nevoie de a fi `live` si de a posta pentru a sti urmaritorii ca esti , o facem noi.",
        color: "bg-red-50 text-red-500",
    },
    {
        icon: HashIcon,
        title: "Hashtag sugerat",
        description: "pune IA nostru sa iti creeze hashtag-uri pentru o audienta mai buna.",
        color: "bg-red-50 text-red-500",
    },
];
const steps = [
    { step: "01", title: "Conecteaza-te la noi", description: "Apasa `Vreau cont` pentru a intra in comunitatea noasta, dureaza sub 10 secunde." },
    { step: "02", title: "Copiaza cheia Zernio", description: "Dupa inscriere va dura cateva secunde de a creea un cont zernio si de a insera cheia aici dureaza sub 55 secunde." },
    { step: "03", title: "Publica instant sau programabil", description: "Alege timpul , data si platforma . Noi vom publica pentru tine ." },
];

export default function Page() {
  return (
    <main className="text-center">
      <header className="flex items-center mr-4 ml-4 mt-1  rounded-3xl gap-3 md:shadow-lg md:shadow-amber-400/45 p-4 ">
        {/* brand */}
        <div className="flex items-center gap-2.5 pr-2">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl leading-relaxed">
            <SendToBack className="size-6 text-cyan-400 animate-spin" />
          </div>
          <span className="brand-gradient leading-relaxed">Postator</span>
        </div>
        <nav className="mx-auto  items-center gap-5 justify-between rounded-4xl lg:flex">
          <Show when={"signed-out"}>
            <Link href="/sign-up">
              <Button variant={"ghost"} size="lg" className={"tracking-widest shadow-sm  dark:bg-secondary shadow-blue-600"}>Vreau cont</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant={"ghost"} size={"lg"} className={"leading-relaxed shadow-sm dark:bg-secondary shadow-cyan-600 text-black dark:text-gray-100"}>Login</Button>
            </Link>
          </Show>

        </nav>

        {/* right side of top */}
        <div className="ml-auto flex items-center gap-2">
          <Show when={"signed-in"}>
            <Link href="/dashboard">
              <Button className="bg-blue-600/55 text-black dark:text-white flex items-center space-x-2" variant={"ghost"}>
                Vezi bordul tau
              </Button>
            </Link>
          </Show>
            <div className="font-mono text-xs text-muted-foreground">
              (Apasa <kbd>d</kbd> pentru schimba dark/light mode)
            </div>
        </div>
      </header>
      <div className=" pt-8 text-center items-center justify-center space-x-3">
        <section className="relative overflow-hidden">
            {/* Subtle grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-size-[56px_56px] pointer-events-none" />

            {/* Red soft glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-225 h-140 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.08)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-20 pb-12 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-500 text-sm px-3.5 py-1.5 rounded-full mb-8">
                    <span className="size-1.5 bg-red-400 rounded-full" />
                    AI-pentru social media post modelat
                </div>

                {/* Headline */}
                <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl xl:text-8xl text-slate-900 dark:text-gray-200/75">
                    Postator inteligent.
                    <br />
                    <span className="text-red-400 italic">Cresti rapid cu noi.</span>
                </h1>

                {/* Subheadline */}
                <p className="mt-7 text-gray-500 dark:text-gray-300/85 max-w-2xl mx-auto">Postator te face mai creativ, mai punctual si concentrat la platformele tale sociale — cu un Ai pregatit pentru retelele sociale.</p>

                {/* CTAs */}
                <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link href="/login" className="bg-red-500 text-white rounded-full font-medium hover:bg-red-600 hover:shadow-[0_8px_24px_rgba(239,68,68,0.35)] inline-flex items-center gap-2 text-[15px] px-8 py-3.5 w-full sm:w-auto justify-center transition-all">
                        Incearca <ArrowRightIcon className="size-4" />
                    </Link>
                   
                </div>

                <p className="mt-5 text-md leading-relaxed darktext-gray-400">2 conturi conectate gratis , postat si programarea postarii gratuite</p>
            </div>

            {/* Dashboard mockup */}
            <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pb-0">
                <div className="rounded-t-2xl overflow-hidden border border-gray-200 border-b-0">
                    {/* Browser chrome */}
                    <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#f0f0f0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                        <div className="flex-1 mx-4 rounded-md h-5 max-w-xs bg-white/80" />
                    </div>

                    {/* Mock content */}
                    <div className="p-6" style={{ background: "#f7f7f7" }}>
                        {/* Stat row */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                            {[
                                { val: "12", label: "Pregatit de postat" },
                                { val: "48", label: "Postate" },
                                { val: "4", label: "Conturi" },
                                
                            ].map((s) => (
                                <div key={s.label} className="rounded-xl p-4 bg-white" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
                                    <div className="text-2xl font-bold text-gray-900 tabular-nums">{s.val}</div>
                                    <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Activity list */}
                        <div className="rounded-xl p-4 space-y-3 bg-white" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Recent Activity</div>
                            {[
                                { text: "Post publicat pe LinkedIn si Facebook", time: "acum 2m " },
                                { text: "Nou post programat pentru maine 9am", time: "acum 1h" },
                            ].map((item) => (
                                <div key={item.text} className="flex items-center gap-3">
                                    <DotIcon className="size-5 text-gray-300" />
                                    <span className="text-sm text-gray-600 flex-1">{item.text}</span>
                                    <span className="text-xs text-gray-300 shrink-0">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
         <section id="features" className="py-24 bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                    <div className="mb-6 inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/15 text-red-500 text-[11px] font-medium tracking-[0.06em] uppercase px-3.5 py-1.5 rounded-full">
                        <ZapIcon className="size-4 animate-bounce"  />
                        Tot ce ai nevoie in zilele fara inspiratie
                    </div>
                    <h2 className="font-serif text-4xl sm:text-5xl font-medium leading-tight text-gray-900">
                        Poti automatiza intregul proces social media pentru 
                        <br />
                        <span className="text-red-400 italic">ziua-saptamana-luna respectivad</span>
                    </h2>
                    <p className="mt-5 text-gray-500 max-w-xl mx-auto leading-relaxed">De la creearea continutului la imagine si video , noi iti putem creea tot necesarul pentru platforma sociala</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
                    {features.map((f) => (
                        <div key={f.title} className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-slate-200 hover:shadow-md hover:shadow-slate-100 group">
                            <div className={`size-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                                <f.icon className="size-5" />
                            </div>
                            <h3 className=" text-slate-900 mb-2">{f.title}</h3>
                            <p className="text-sm text-slate-500/90 leading-relaxed">{f.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        <section id="how-it-works" className="py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                    <div className="mb-6 inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/15 text-red-500 text-[11px] font-medium tracking-[0.06em] uppercase px-3.5 py-1.5 rounded-full">
                        <CheckCircleIcon className="size-3" />
                        Simple setup
                    </div>
                    <h2 className="font-serif font-medium text-4xl sm:text-5xl leading-tight text-gray-900">
                        Up and running in <span className="text-red-400 italic">minutes</span>
                    </h2>
                    <p className="mt-5 text-gray-500 max-w-lg mx-auto leading-relaxed">No complicated onboarding, no steep learning curve. Just connect, create, and grow.</p>
                </div>

                <div className="space-y-6">
                    {steps.map((s, i) => (
                        <div key={s.step} className="flex gap-6 items-start">
                            <div className="shrink-0 size-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-red-500">{s.step}</span>
                            </div>
                            <div className="pt-1">
                                <h3 className=" text-slate-900/95 text-start font-semibold mb-1">{s.title}</h3>
                                <p className="text-slate-700 text-sm leading-relaxed">{s.description}</p>
                            </div>
                            {i < steps.length - 1 && (
                                <div className="hidden sm:block ml-auto shrink-0 self-center">
                                    <ArrowRightIcon className="size-4 text-slate-200" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
        </div>
       
    </main>
  )
}
