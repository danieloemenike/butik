
import React from 'react'
import Header from './_components/Header'
import Hero from './_components/Hero'
import Footer from './_components/Footer'

type Props = {}

function Home({}: Props) {
  return (
    <main className='bg-indigo-600 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-800 via-black to-black '>
      <Header dashboardButton  />
      <Hero />
      {/* <Footer /> */}
    </main>
  )
}

export default Home