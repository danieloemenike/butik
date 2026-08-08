"use client"

import React, { Suspense, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Loader from "@/components/ui/Loader"
import Table from "@/components/ui/FormattedTable"
import { format } from "date-fns"
import columns from "./TableCategories/columns"
import { Package } from "lucide-react"
import { useGetProductsQuery } from "@/reduxStore/services/productApiSlice"
import { formatStoreMoney } from "@/lib/utils"
import { ApiList } from "@/components/ui/api-list"
import Heading from "@/components/StoreHeading"
import { EmptyState } from "@/components/EmptyState"
import { isValidProductSlug } from "@/lib/store-identity"

type Props = {
  storeCurrency?: string
}

function ProductPage({ storeCurrency = "NGN" }: Props) {
  const [loading, setLoading] = useState(false)
  const { storeId } = useParams()
  const router = useRouter()

  const handleClick = () => {
    try {
      setLoading(true)
      router.push(`/store/${storeId}/products/new`)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const {
    data = [],
    error,
    isLoading,
    isFetching,
    isSuccess,
    isUninitialized,
    isError,
  } = useGetProductsQuery(`${storeId}`, { refetchOnMountOrArgChange: true })

  const productData =
    data.length > 0 &&
    typeof data != "undefined" &&
    data != null &&
    data.length != null

  const formattedProducts = data?.map((item) => {
    const slug = item.slug ?? null
    const storefrontVisible = !item.isArchived && isValidProductSlug(slug)

    const sizeNames = new Set<string>()
    if (item.size?.name) sizeNames.add(item.size.name)
    for (const variant of item.productVariant ?? []) {
      if (variant.size?.name) sizeNames.add(variant.size.name)
    }

    return {
      id: item.id,
      name: item.name,
      isFeatured: item.isFeatured,
      isArchived: item.isArchived,
      price: formatStoreMoney(Number(item.price), storeCurrency),
      category: item.category.name,
      size: [...sizeNames].join(", ") || item.size?.name || "—",
      color: item.color.value,
      createdAt: format(new Date(item.createdAt), "MMMM do, yyyy"),
      image: item.images[0]?.url ?? "",
      slug,
      storefrontVisible,
    }
  })

  return (
    <main className="space-y-1">
      <Heading
        title="Products"
        subtitle="Manage your store catalog and inventory"
        showButton
        text="Add New"
        handleClick={handleClick}
        plusIcon
      />

      {isLoading || isUninitialized || isFetching ? (
        <Loader />
      ) : productData && isSuccess ? (
        <div className="space-y-6 rounded-xl border border-border bg-card p-4 md:p-5">
          <Suspense fallback={<Loader />}>
            <Table
              data={formattedProducts}
              searchKey="name"
              columns={columns}
            />
            <ApiList entityName="products" entityIdName="productId" />
          </Suspense>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            An error has occurred, please refetch this page.
          </p>
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="Create your first product"
          description="Add products to start selling from this storefront."
          actionLabel={loading ? "Processing…" : "Create first product"}
          onAction={handleClick}
          loading={loading}
        />
      )}
      {error ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            An error has occurred, please refetch this page.
          </p>
        </div>
      ) : null}
    </main>
  )
}

export default ProductPage
