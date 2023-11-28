import Heading from '@/components/StoreHeading';
import React from 'react'
import { EditBillboardForm } from './_component/EditBillBoard'

type Props = {}

function page({}: Props) {
  return (
    <main>

<Heading title="Edit Billboard" subtitle="Edit Billboard" showButton={ false } />
      <div className="overflow-y-auto">
      <EditBillboardForm />

          </div>
    </main>
  )
}

export default page