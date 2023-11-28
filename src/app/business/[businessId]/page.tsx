import Header from '@/app/_components/Header'
import React from 'react'
import StoreList from './_components/storeList'

type Props = {}

function BusinessPage({}: Props) {
  return (
      <section className=' h-screen w-full'>
      <Header dashboardButton={ false } />
      <main className="grid place-items-center">
      <StoreList />
      </main>
          
    </section>
  )
}

export default BusinessPage