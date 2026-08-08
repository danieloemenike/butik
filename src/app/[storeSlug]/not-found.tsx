import Link from "next/link"

export default function StorefrontNotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center px-5 text-center">
      <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        404
      </p>
      <h1 className="mt-2 font-display text-2xl font-medium tracking-tight">
        Store not found
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This storefront is offline or does not exist.
      </p>
      <div className="mt-6 flex gap-4 text-sm font-semibold">
        <Link href="/" className="underline-offset-4 hover:underline">
          Home
        </Link>
        <Link href="/explore" className="underline-offset-4 hover:underline">
          Explore stores
        </Link>
      </div>
    </main>
  )
}
