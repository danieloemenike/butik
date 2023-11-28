
import Image from 'next/image'
import Aidea from "@/public/aidea.svg"
import Link from 'next/link'

import { useParams, usePathname } from 'next/navigation'
import { LogoutLink, getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { BiLogOutCircle } from "react-icons/bi";
// import SideBarMenu from './menu'
import { Button } from '@/components/ui/button'
import { ArrowBigLeftIcon, ArrowLeftCircleIcon, ArrowLeftFromLineIcon, MenuIcon, MenuSquareIcon, Sparkles } from 'lucide-react'
import SideBarMenu from './MenuRoutes'
type Props = {
    storeName : string | null
}

export default function Sidebar({storeName}: Props) {
  
  return (
      <aside className="hidden md:flex flex-col fixed left-0 min-h-screen max-h-screen w-52 px-4 bg-white shadow-xl dark:bg-neutral-900  z-50 overflow-y-auto border-r-[1px] rounded-tr-xl">
          <div className = "flex justify-start mb-3 items-center w-full p-0 flex-wrap">
          {/* <Button variant="ghost" size= "icon">
              <MenuIcon />
              </Button> */}
         
              </div>
         
          {/* LOGO DESIGN */ }
          
          <div className="flex flex-wrap justify-start mb-7 mt-5 truncate ...">
          { storeName ? (
              <h2 className="tracking-tighter font-bold truncate">{ storeName }</h2>
          ) : (
             <h2 className="tracking-tighter font-bold">butik</h2>
         )} 
          </div>
        
         
          
          <div className='flex flex-col flex-1 overflow-y-auto'>
              {/* Menu here*/ }
              <SideBarMenu />
        
              {/* <div className='flex items-center justify-between mt-10 mb-5'>
                  <Button className="bg-gradient-to-r from-sky-700 via-blue-600">
                      Upgrade
                      <Sparkles  />
                    </Button>
                </div> */}
              {/* Profile Picture */}
              {/* <div className='flex items-center justify-between mt-10 mb-5'>
              <div className="flex items-center gap-x-2 ">
                         { user?.picture ? (
                             <Image className="rounded-full" src={ user?.picture } width={ 30 } height={ 30} alt = "user profile avatar" />
                         ) :
                             (
                                 <div className='bg-purple-800 text-white rounded-full p-4'>
                                     {user?.given_name?.[0]}
                                         {user?.family_name?.[0]}
                                 </div>
                             )
                      }
                       <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {user?.given_name} 
                             </p>
            </div> 
                         <div className= " ">
                          
                          <LogoutLink className=" text-bold text-white w-[170px] rounded h-[24px] ">
                          <BiLogOutCircle />
                         </LogoutLink>
                         </div>

                     
              </div> */}


          </div>

    </aside>
  )
}