"use client"

import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { ButikLogo } from "@/components/ButikLogo"

function CTASection() {
  return (
    <section className="border-t border-ink/8">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-28">
        <div className="relative overflow-hidden rounded-2xl bg-surface-deep px-8 py-16 text-surface-raised md:px-14 md:py-20 dark:border dark:border-ink/10 dark:bg-surface-raised dark:text-ink">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(58,168,157,0.28),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_80%_20%,rgba(58,168,157,0.16),transparent_50%)]" />
          <div className="landing-grain opacity-20" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl font-medium tracking-[-0.03em] md:text-5xl md:leading-[1.05]">
              Ready to run commerce like infrastructure?
            </h2>
            <p className="mt-5 max-w-[40ch] text-lg leading-relaxed text-surface-raised/65 dark:text-ink-muted">
              Stand up your business, provision stores, and connect clients on
              APIs designed for multi-vendor scale.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <RegisterLink className="inline-flex h-12 items-center rounded-md bg-surface-raised px-6 text-sm font-semibold text-surface-deep transition-opacity hover:opacity-90 dark:bg-ink dark:text-surface-raised">
                Start building
              </RegisterLink>
              <a
                href="#platform"
                className="inline-flex h-12 items-center rounded-md border border-surface-raised/20 px-5 text-sm font-semibold text-surface-raised/85 transition-colors hover:bg-surface-raised/5 dark:border-ink/15 dark:text-ink-soft dark:hover:bg-ink/5"
              >
                Review platform
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-ink/8 bg-surface-raised">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.2fr_repeat(3,0.7fr)]">
          <div>
            <ButikLogo href={null} className="text-ink" />
            <p className="mt-3 max-w-[28ch] text-sm leading-relaxed text-ink-muted">
              Multi-vendor commerce infrastructure for modern retail operators.
            </p>
          </div>

          {[
            {
              title: "Product",
              links: [
                { label: "Platform", href: "#platform" },
                { label: "Operations", href: "#operations" },
                { label: "Explore stores", href: "/explore" },
              ],
            },
            {
              title: "Resources",
              links: [
                { label: "Documentation", href: "#" },
                { label: "API reference", href: "#" },
                { label: "Guides", href: "#" },
                { label: "Status", href: "#" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About", href: "#" },
                { label: "Customers", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Contact", href: "#" },
              ],
            },
          ].map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold tracking-[0.08em] text-ink uppercase">
                {column.title}
              </p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-ink/8 pt-8 text-sm text-ink-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Butik. All rights reserved.</p>
          <div className="flex flex-wrap gap-6">
            <a href="#" className="transition-colors hover:text-ink">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-ink">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-ink">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterSections() {
  return (
    <>
      <CTASection />
      <Footer />
    </>
  )
}

export default FooterSections
