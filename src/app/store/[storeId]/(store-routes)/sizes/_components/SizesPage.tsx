"use client"

import React, { Suspense, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Loader from "@/components/ui/Loader"
import Table from "@/components/ui/FormattedTable"
import { format } from "date-fns"
import columns from "./TableCategories/columns"
import { Ruler } from "lucide-react"
import { useGetSizesQuery } from "@/reduxStore/services/sizeApiSlice"
import Heading from "@/components/StoreHeading"
import { EmptyState } from "@/components/EmptyState"

function SizesPage() {
  const [loading, setLoading] = useState(false)
  const { storeId } = useParams()
  const router = useRouter()

  const handleClick = () => {
    try {
      setLoading(true)
      router.push(`/store/${storeId}/sizes/new`)
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
  } = useGetSizesQuery(`${storeId}`, { refetchOnMountOrArgChange: true })

  const sizeData =
    data.length > 0 &&
    typeof data != "undefined" &&
    data != null &&
    data.length != null

  const FormattedSizeData = data?.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
    createdAt: format(new Date(item.createdAt), "MMMM do, yyyy"),
    updatedAt: format(new Date(item.updatedAt), "MMMM do, yyyy"),
  }))

  return (
    <main className="space-y-1">
      <Heading
        title="Sizes"
        subtitle="Create and manage product size options"
        showButton
        text="Add New"
        handleClick={handleClick}
        plusIcon
      />

      {isLoading || isUninitialized || isFetching ? (
        <Loader />
      ) : sizeData && isSuccess ? (
        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <Suspense fallback={<Loader />}>
            <Table
              data={FormattedSizeData}
              searchKey="name"
              columns={columns}
            />
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
          icon={Ruler}
          title="Create product sizes"
          description="Add size options so customers can pick the right fit."
          actionLabel="Get started"
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

export default SizesPage
