
import React from 'react'
import { NewSizeForm } from './_components/SizeForm'
import Heading from '@/components/StoreHeading'


type Props = {}

export default function page({ }: Props) {
   
  return (
    <>
     
          <Heading title="Create New Product Size" subtitle="Add a Product Size" showButton={ false } />
      <main className="overflow-y-auto">
      <NewSizeForm />

          </main>
         
      </>
  )
}