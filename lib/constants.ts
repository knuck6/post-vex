import { BrainIcon, LayoutGridIcon, PenToolIcon, Settings } from "lucide-react"

const urlDash = ""
export const navLinks =[
    {href:`${urlDash}/dashboard`, label:"Acasa", icon: LayoutGridIcon},
    {href:`${urlDash}/compune`,label:"Compune", icon:PenToolIcon},
    {href:`${urlDash}/ai`, label:"Ai", icon:BrainIcon},
    
    {href:`${urlDash}/cont`, label:"Cont", icon:Settings}
]