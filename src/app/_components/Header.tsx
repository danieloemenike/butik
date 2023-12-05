import React from 'react'
import Link from "next/link"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Image from 'next/image';
import {RegisterLink, LoginLink,LogoutLink} from "@kinde-oss/kinde-auth-nextjs/components";
import { ModeToggle } from '@/components/ui/ModeToggle';
import { Button } from '@/components/ui/button';
import { AlignLeft } from 'lucide-react';
import MobileSideBar from '@/components/MobileSideBar';

type Props = {
    dashboardButton?: boolean
    storeSideBar ?:boolean
}

async function Header({ dashboardButton, storeSideBar}: Props) {
    const { getUser, isAuthenticated } = getKindeServerSession();
    const user = await getUser();
    const isAuth = await isAuthenticated();

    return (
        <>
            <header className="bg-background h-[5rem] shadow-md   top-0  w-full  bg-clip-padding backdrop-filter backdrop-blur-xl z-30 bg-opacity-5 sticky ">
                <div className="container flex items-center justify-between pl-1 pr-1 md:px-[2rem] md:py-[1rem]  w-full h-full sticky">
                
                    <div className=" h-full flex items-center justify-stretch w-full gap-4 pl-2 ">
                        <div className = "md:hidden ">
                        {
                            storeSideBar && (
                                    <MobileSideBar />
                                    
                            )
                        }
                        </div>
                   
                   
                    <Link href="/"> <h2 className="font-extrabold tracking-tighter text-2xl cursor-pointer  w-full ml-1 md:text-center dark:text-white text-black items-center h-[30px]  "> BUTIK </h2> </Link> 
                </div>
                <main className='flex items-center h-[100%] md:justify-evenly  w-full'>
                    <ModeToggle />
                   
                <nav className='gap-2 h-[100%] flex ml-1  items-center'>
                 
                    { !isAuth ?
                            (<>
                                <div className='flex items-center justify-center h-full w-full gap-2 '>
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
                                <Image className="rounded-full" src={ user?.picture } width={ 30 } height={ 40} alt = "user profile avatar" priority />
                            ) :
                                (
                                    <div className='bg-primary text-primary-foreground rounded-full p-4'>
                                        {user?.given_name?.[0]}
                                            {user?.family_name?.[0]}
                                    </div>
                                )
                            }
                           
                            <div className= "w-full md:ml-[2rem] ml-2">
                            {/* <p className="text-2xl">
                                 Hi {user?.given_name} {user?.family_name}
                                </p> */}
                                         <Button variant="destructive">
                                        <LogoutLink className=" ">Logout</LogoutLink>
                                        </Button>
                            
                            </div>

                        </div>)
                    }
                       
        </nav > 
                   
                    </main>
                    </div>  
            </header>
        
        </>
    )
}

export default Header