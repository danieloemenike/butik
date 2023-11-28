
import React from 'react'
import { EditColorForm } from './_component/EditColorData'
import Heading from '@/components/StoreHeading'

type Props = {}

function page({}: Props) {
  return (
    <main>

<Heading title="Edit Colors" subtitle="Edit Colors" showButton={ false } />
      <div className="overflow-y-auto">
      <EditColorForm />

          </div>
    </main>
  )
}

export default page