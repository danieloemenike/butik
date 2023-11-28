
import React from 'react'
import { NewColorForm } from './_components/ColorForm'
import Heading from '@/components/StoreHeading'


type Props = {}

export default function page({ }: Props) {
   
  return (
    <>
     
          <Heading title="Create Unique Colors" subtitle="Create Product Colors Here" showButton={ false } />
      <main className="overflow-y-auto">
      <NewColorForm />

          </main>
         
      </>
  )
}