import Image from 'next/image'
import React from 'react'
import BusinessForm from './_component/businessForm'
import Header from '../_components/Header'
import { Separator } from '@/components/ui/separator'

type Props = {}

function RegisterBusiness({}: Props) {
    return (
      
        <section className=' h-screen w-full'>
            <Header />
            <div className="flex flex-col  mt-8 items-center justify-center  h-14 w-full leading-tight group ">
                <h2 className="font-bold text-lg lg:text-2xl tracking-tighter"> Register Your Business Information</h2><br/>
               
            </div>
          
            <div className='container grid grid-cols-1 lg:grid-cols-2 w-full my-auto h-[60dvh] '>
          <div className='flex items-center justify-center'>
              <BusinessForm />
          </div>
          <div className="  lg:flex items-center justify-center hidden ">
              <Image width={ 500 } height={ 500} className="object-fit" src="/shopping.svg" alt="shopping image"/>
          </div>
          </div>
        </section>
  )
}

export default RegisterBusiness