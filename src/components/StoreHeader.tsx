


import { toggleSidebar } from "@/reduxStore/features/sidebarSlice"
import { useAppDispatch } from "@/reduxStore/hooks";

import Link from "next/link";

import { TfiAlignLeft } from "react-icons/tfi";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { LoginLink, LogoutLink, RegisterLink,  } from "@kinde-oss/kinde-auth-nextjs/components";
import Image from "next/image";
import prismadb from "@/lib/prismadb";
import { redirect, useParams } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Button } from "./ui/button";
// import StoreSwitcher from "./StoreSwitcher";


export default async function StoreHeader() {
  const dashboardButton = true
    const { getUser, isAuthenticated } = getKindeServerSession();
    const user = await getUser();
    const isAuth = await isAuthenticated();
    // const dispatch = useAppDispatch()
    // const handleSidebar = () => {
    //             dispatch(toggleSidebar())
    // }
    if (!isAuth) {
        redirect("/")
    }
    if (!user) {
        redirect("/")
    }
  //   const stores = await prismadb.store.findMany({
  //       where: {
            
  //           userId: user?.id,
           
  //       }, select: {
  //           id: true,
  //           name: true
  //       }

  //   })

  //   if (!stores) {
  //      redirect("/")
  //  }
   
    return (
        <>
             <header className=" h-[4rem] shadow-md px-[2rem] py-[1rem] flex items-center justify-between  top-0  w-[80%] mt-2 rounded-full ml-56 bg-clip-padding backdrop-filter backdrop-blur-xl z-50 bg-opacity-5 dark:bg-neutral-900 sticky" >
             <div className=" h-full flex items-center  w-full ">
                    <Link href="/"> <h2 className="font-extrabold tracking-tighter text-2xl cursor-pointer  w-[140px] text-center dark:text-white text-black items-center h-[30px]  "> butik </h2> </Link> 
                </div>
                <main className='flex items-center h-[100%] justify-evenly  w-full'>
                    <ModeToggle />
                   
                <nav className='gap-4 h-[100%] flex  '>
                 
                    { !isAuth ?
                            (<>
                                <div className='flex items-center justify-center  h-full w-full gap-4 '>
                                    <Button variant="ghost">
                                    <LoginLink className="">Sign in</LoginLink>
                                    </Button>
                                    <Button className="bg-primary">
                                    <RegisterLink className="text-primary-foreground font-bold ">Get Started</RegisterLink>
                                    </Button>
                                    
                                    </div>
                            </>)
                        :
                       ( 
                       
                                <div className="flex w-full h-[100%] items-center mx-auto">
                                    { dashboardButton && <Button variant="ghost" className='border mr-4 rounded-full font-bold dark:border-white border-black'>
                                        <Link href="/register-business">  Dashboard </Link>
                                    </Button>
                                    }
                            { user?.picture ? (
                                <Image className="rounded-full" src={ user?.picture } width={ 55 } height={ 55} alt = "user profile avatar" priority />
                            ) :
                                (
                                    <div className='bg-primary text-primary-foreground rounded-full p-4'>
                                        {user?.given_name?.[0]}
                                            {user?.family_name?.[0]}
                                    </div>
                                )
                            }
                           
                            <div className= "w-full ml-[2rem] ">
                            {/* <p className="text-2xl">
                                 Hi {user?.given_name} {user?.family_name}
                                </p> */}
                                        <Button>
                                        <LogoutLink className=" ">Logout</LogoutLink>
                                        </Button>
                            
                            </div>

                        </div>)
                    }
                       
                    </nav>
                    </main>
            </header>
        
        </>
    )
}