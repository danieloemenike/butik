"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import Link from "next/link"
import {
  ArrowUpRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import {
  useDeleteStoreMutation,
  useGetStoresQuery,
} from "@/reduxStore/services/storeApiSlice"
import { useToast } from "@/components/ui/use-toast"
import FormattedAlertModal from "@/components/FormattedAlertModal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Loader from "@/components/ui/Loader"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MAX_STORES } from "@/lib/store-limits"
import { cn } from "@/lib/utils"
import { CreateStoreModal, type StoreDetails } from "./CreateStoreModal"

type Props = {
  businessName?: string | null
  userName?: string | null
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function StoreList({ businessName, userName }: Props) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [storeModalOpen, setStoreModalOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<StoreDetails | null>(null)
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const businessId = String(params.businessId ?? "")

  const {
    data = [],
    isLoading,
    isFetching,
    isUninitialized,
    isSuccess,
    isError,
  } = useGetStoresQuery(businessId, {
    refetchOnMountOrArgChange: true,
  })
  const [deleteStore, { isLoading: isDeleting }] = useDeleteStoreMutation()

  const isBusy = isLoading || isUninitialized
  const hasStores = isSuccess && data.length > 0
  const atLimit = data.length >= MAX_STORES
  const remaining = Math.max(MAX_STORES - data.length, 0)

  const filteredStores = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return data

    return data.filter((store) => {
      const haystack = [
        store.name,
        store.address,
        store.city,
        store.country,
        store.phoneNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(needle)
    })
  }, [data, query])

  const goCreate = () => {
    if (atLimit) {
      toast({
        variant: "destructive",
        title: "Store limit reached",
        description: `You can create up to ${MAX_STORES} stores on your current plan.`,
      })
      return
    }
    setEditingStore(null)
    setStoreModalOpen(true)
  }

  const goEdit = (store: StoreDetails) => {
    setEditingStore(store)
    setStoreModalOpen(true)
  }

  const closeStoreModal = () => {
    setStoreModalOpen(false)
    setEditingStore(null)
  }

  const onConfirmDelete = async () => {
    if (!selectedStoreId) return
    try {
      await deleteStore({ storeId: selectedStoreId, businessId }).unwrap()
      toast({
        description: "Your store has been deleted successfully.",
      })
      router.refresh()
    } catch {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      })
    } finally {
      setOpen(false)
      setSelectedStoreId(null)
    }
  }

  if (isBusy) {
    return <Loader />
  }

  if (isError) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-6xl flex-col items-center justify-center px-5 text-center md:px-8">
        <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          We couldn&apos;t load your stores. Refresh the page to try again.
        </p>
        <Button className="mt-6" onClick={() => router.refresh()}>
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <section
      className={cn(
        "mx-auto w-full max-w-6xl px-5 md:px-8",
        hasStores ? "py-8 md:py-10" : "py-14 md:py-20"
      )}
    >
      <CreateStoreModal
        open={storeModalOpen}
        onClose={closeStoreModal}
        businessId={businessId}
        store={editingStore}
      />

      {!hasStores ? (
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {businessName || "Your business"}
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl">
            {userName ? `Congrats, ${userName}` : "You're all set"}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Create your first storefront to start managing products, billboards,
            and store APIs. You can add up to {MAX_STORES} stores.
          </p>
          <Button
            size="lg"
            className="mt-8 font-semibold"
            onClick={goCreate}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create your first store
          </Button>
        </div>
      ) : (
        <>
      <FormattedAlertModal
        title="Delete this store?"
        description="This cannot be undone. The store and its related catalog data will be permanently removed."
        isOpen={open}
        onClose={() => {
          setOpen(false)
          setSelectedStoreId(null)
        }}
        onConfirm={onConfirmDelete}
        loading={isDeleting}
      />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[1.65rem] font-medium tracking-tight text-foreground md:text-[1.85rem]">
            Stores
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.length} of {MAX_STORES} storefront
            {MAX_STORES === 1 ? "" : "s"}
            {remaining > 0 ? ` · ${remaining} remaining` : " · limit reached"}
            {isFetching ? " · refreshing…" : ""}
          </p>
        </div>

        <Button
          onClick={goCreate}
          disabled={atLimit}
          className="font-semibold"
          title={
            atLimit
              ? `Maximum of ${MAX_STORES} stores reached`
              : "Create a new store"
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Store
        </Button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter stores…"
          className="pl-9"
        />
      </div>

      {filteredStores.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-semibold tracking-tight text-foreground">
            No stores match “{query}”
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-2 text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredStores.map((store) => {
            const location = [store.city, store.country]
              .filter(Boolean)
              .join(", ")

            return (
              <article
                key={store.id}
                className={cn(
                  "group flex flex-col rounded-2xl border border-border bg-card p-5",
                  "shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-all duration-200",
                  "hover:border-foreground/20 hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-extrabold tracking-tighter text-foreground">
                      {getInitials(store.name) || "ST"}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-lg font-medium tracking-tight text-foreground">
                        {store.name}
                      </h2>
                      <p className="truncate text-xs text-muted-foreground">
                        {location || "Location not set"}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/store/${store.id}/dashboard`)
                        }
                      >
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Visit store
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          goEdit({
                            id: store.id,
                            name: store.name,
                            phoneNumber: store.phoneNumber,
                            address: store.address,
                            city: store.city,
                            country: store.country,
                            storeSlug: store.storeSlug,
                          })
                        }
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setSelectedStoreId(store.id)
                          setOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <dl className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-muted-foreground">Address</dt>
                    <dd className="max-w-[60%] text-right font-medium text-foreground">
                      {store.address || "—"}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd className="max-w-[60%] text-right font-medium text-foreground">
                      {store.phoneNumber || "—"}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="text-right font-medium text-foreground">
                      {format(new Date(store.createdAt), "MMM d, yyyy")}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-muted-foreground">Updated</dt>
                    <dd className="text-right font-medium text-foreground">
                      {format(new Date(store.updatedAt), "MMM d, yyyy")}
                    </dd>
                  </div>
                </dl>

                <div className="mt-auto pt-5">
                  <Link
                    href={`/store/${store.id}/dashboard`}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90"
                  >
                    Visit store
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            )
          })}

          {!atLimit && (
            <button
              type="button"
              onClick={goCreate}
              className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-transparent p-5 text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-secondary/40 hover:text-foreground"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-current/15">
                <Plus className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold tracking-tight">
                Add another store
              </span>
              <span className="text-xs">
                {remaining} slot{remaining === 1 ? "" : "s"} left
              </span>
            </button>
          )}
        </div>
      )}
        </>
      )}
    </section>
  )
}

export default StoreList
