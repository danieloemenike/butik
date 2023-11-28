
import Heading from '@/components/StoreHeading';
import React from 'react'
import { BillboardForm } from './_components/BillboardForm'


type Props = {}

export default function NewBillboard({ }: Props) {
   
  return (
    <>
     
          {/* <Heading title="Create New Billboard" subtitle="Add a new billboard" showButton={ false } /> */}
      <main className="overflow-y-auto">
      <BillboardForm />

          </main>
         
      </>
  )
}