"use client"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { AlignLeft } from "lucide-react"
import Sidebar from "./Sidebar"
import SideBarMenu from "./MenuRoutes"

type Props = {}

function MobileSideBar({}: Props) {
  return (
    <Sheet>
    <SheetTrigger>  <AlignLeft /></SheetTrigger>
    <SheetContent side ="left">
      <SheetHeader>
       
        <SheetDescription>
        <SideBarMenu />
        </SheetDescription>
      </SheetHeader>
    </SheetContent>
  </Sheet>
  
  )
}

export default MobileSideBar