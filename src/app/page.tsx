import MarketingHeader from "./_components/MarketingHeader"
import Hero from "./_components/Hero"
import AdditionalSections from "./_components/AdditionalSections"
import FooterSections from "./_components/FooterSections"

function Home() {
  return (
    <main className="landing-shell relative min-h-screen overflow-x-hidden">
      <MarketingHeader />
      <Hero />
      <AdditionalSections />
      <FooterSections />
    </main>
  )
}

export default Home
