import BusinessForm from "./_component/businessForm"
import { OnboardingVisual } from "./_component/OnboardingVisual"
import Header from "../_components/Header"

function RegisterBusiness() {
  return (
    <section className="landing-shell relative min-h-screen w-full overflow-hidden">
      <div className="landing-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="landing-grain" />

      <Header />

      <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 md:px-6 md:py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-10 xl:gap-14">
        <div className="surface-panel relative z-10 w-full p-6 shadow-sm md:p-8">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Onboarding
          </p>
          <h1 className="mt-2 font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            Register your business
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Add your business profile so you can create stores, manage catalog,
            and go live.
          </p>

          <div className="mt-8">
            <BusinessForm />
          </div>
        </div>

        <OnboardingVisual />
      </div>
    </section>
  )
}

export default RegisterBusiness
