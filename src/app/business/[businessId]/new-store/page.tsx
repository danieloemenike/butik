  import Header from '@/app/_components/Header'
  import React from 'react'
  import NewStoreForm from './_components/NewStoreForm'
  import Image from 'next/image'
  import { ArrowBigLeftDash, Sparkles, StoreIcon } from 'lucide-react'
  import { FcShop } from "react-icons/fc";
import { Button } from '@/components/ui/button'

  type Props = {}

  const page = (props: Props) => {
    return (
      <section className=' h-screen w-full'>
      <Header />
            <div className="grid place-items-center mt-8  h-14 w-full leading-tight group space-y-4 ">
          {/* <div className = "flex items-center ">
              <Button variant="default" >
            <ArrowBigLeftDash />
              Go Back
            </Button>
           
          </div> */}
          
                <h2 className="font-bold text-lg lg:text-2xl tracking-tighter"> Let's Create Your Brand's Store Presence </h2>
                {/* <div className="flex">
                <StoreIcon className="text-center text-5xl"/> <Sparkles />
                </div> */}
              
        
      </div>
    
      <div className='container grid grid-cols-1 lg:grid-cols-2 w-full my-auto h-[70dvh] '>
    <div className='flex items-center justify-center w-full h-full'>
        <NewStoreForm />
    </div>
    <div className="  lg:flex items-center justify-center hidden w-[70%] h-full">
        <Image width={ 400 } height={ 400} className="object-fit" src="/purchase.svg" alt="shopping image"/>
    </div>
    </div>
  </section>
    )
  }

  export default page