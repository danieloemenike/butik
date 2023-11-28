import Heading from '@/components/StoreHeading';
import React from 'react'
import { EditCategoryForm } from './_component/EditCategoryData'

type Props = {}

function page({}: Props) {
  return (
    <main>

<Heading title="Edit Category" subtitle="Edit Category" showButton={ false } />
      <div className="overflow-y-auto">
      <EditCategoryForm />

          </div>
    </main>
  )
}

export default page