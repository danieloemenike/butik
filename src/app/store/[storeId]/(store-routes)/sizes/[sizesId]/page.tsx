
import React from 'react'
import { EditSizeForm } from './_component/EditSizeData'
import Heading from '@/components/StoreHeading'

type Props = {}

function page({}: Props) {
  return (
    <main>

<Heading title="Edit Sizes" subtitle="Edit Sizes" showButton={ false } />
      <div className="overflow-y-auto">
      <EditSizeForm />

          </div>
    </main>
  )
}

export default page