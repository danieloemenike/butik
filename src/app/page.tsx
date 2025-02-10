
import React from 'react'
import Header from './_components/Header'
import Hero from './_components/Hero'
// import Footer from './_components/Footer'
import AdditionalSections from './_components/AdditionalSections'
import FooterSections from './_components/FooterSections'

type Props = {}

function Home({}: Props) {
  return (
    <main className='bg-background dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-800 via-black to-black '>
      <Header dashboardButton  />
      <Hero />
      <AdditionalSections />
      <FooterSections />
    </main>
  )
}

export default Home