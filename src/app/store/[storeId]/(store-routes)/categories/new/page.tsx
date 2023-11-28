import Heading from '@/components/StoreHeading';
import React from 'react'
import { CategoryForm } from './_components/CategoryForm'


type Props = {}

export default function page({ }: Props) {
   
  return (
    <>
     
          <Heading title="Create New Category" subtitle="Add a New Store Category" showButton={ false } />
      <main className="overflow-y-auto">
      <CategoryForm />

          </main>
         
      </>
  )
}