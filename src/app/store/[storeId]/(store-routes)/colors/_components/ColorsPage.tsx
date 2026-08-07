"use client"

import React, { Suspense, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Loader from "@/components/ui/Loader"
import Table from "@/components/ui/FormattedTable"
import columns from "./TableColors/columns"
import { Palette } from "lucide-react"
import { useGetColorsQuery } from "@/reduxStore/services/colorApiSlice"
import Heading from "@/components/StoreHeading"
import { EmptyState } from "@/components/EmptyState"

function colorsPage() {
  const [loading, setLoading] = useState(false)
  const { storeId } = useParams()
  const router = useRouter()

  const handleClick = () => {
    try {
      setLoading(true)
      router.push(`/store/${storeId}/colors/new`)
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
  } = useGetColorsQuery(`${storeId}`, { refetchOnMountOrArgChange: true })

  const colorData =
    data.length > 0 &&
    typeof data != "undefined" &&
    data != null &&
    data.length != null

  const FormattedColorData = data?.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
  }))

  return (
    <main className="space-y-1">
      <Heading
        title="Colors"
        subtitle="Define product color swatches for your catalog"
        showButton
        text="Add New"
        handleClick={handleClick}
        plusIcon
      />

      {isLoading || isUninitialized || isFetching ? (
        <Loader />
      ) : colorData && isSuccess ? (
        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <Suspense fallback={<Loader />}>
            <Table
              data={FormattedColorData}
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
          icon={Palette}
          title="Create product colors"
          description="Add unique color values your products can use."
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

export default colorsPage
