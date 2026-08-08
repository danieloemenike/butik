import Image from "next/image"

type Billboard = {
  id: string
  label: string
  imageUrl: string
  promotionText: string | null
}

export function BillboardHero({ billboards }: { billboards: Billboard[] }) {
  if (!billboards.length) return null

  const primary = billboards[0]

  return (
    <section className="relative mb-8 overflow-hidden rounded-lg sm:mb-10">
      {/* Taller on mobile so text stays readable; wider on desktop */}
      <div className="relative aspect-[4/3] w-full bg-black/10 sm:aspect-[16/9] md:aspect-[21/9] md:min-h-[280px]">
        <Image
          src={primary.imageUrl}
          alt={primary.label}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8">
          <h2 className="max-w-xl text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-3xl">
            {primary.label}
          </h2>
          {primary.promotionText ? (
            <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-white/85 sm:mt-2">
              {primary.promotionText}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
