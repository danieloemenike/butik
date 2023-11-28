
import React from 'react'

import { ProductForm } from './_components/ProductForm'
import Heading from '@/components/StoreHeading'
import prismadb from '@/lib/prismadb'


type Props = {}

export default async function page({ }: Props) {
  const categories = await prismadb.category.findMany({
    include: {
       subcategories: true
     }
  })
 
  return (
    <>
     
          <Heading title="Create Your Store's Product Here" subtitle="Create your products " showButton={ false } />
      <main className="">
   
        <ProductForm categories={ categories } />
          </main>
         
      </>
  )
}