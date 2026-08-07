"use client"

import React, { useState } from "react"
import Heading from "@/components/StoreHeading"
import { useParams, useRouter } from "next/navigation"
import { useGetBillboardsQuery } from "@/reduxStore/services/billboardApiSlice"
import Loader from "@/components/ui/Loader"
import FormattedTable from "@/components/ui/FormattedTable"
import { format } from "date-fns"
import columns from "./billboards/columns"
import { ImageIcon } from "lucide-react"
import { ApiList } from "@/components/ui/api-list"
import { EmptyState } from "@/components/EmptyState"

function BillboardMain() {
  const [loading, setLoading] = useState(false)
  const { storeId } = useParams()
  const router = useRouter()

  const handleClick = () => {
    try {
      setLoading(true)
      router.push(`/store/${storeId}/billboards/new`)
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
  } = useGetBillboardsQuery(`${storeId}`, { refetchOnMountOrArgChange: true })

  const billboardData =
    data.length > 0 &&
    typeof data != "undefined" &&
    data != null &&
    data.length != null

  const FormattedBillboardData = data?.map((item) => ({
    id: item.id,
    label: item.label,
    imageUrl: item.imageUrl,
    promotionText: item?.promotionText,
    promotionImageUrl: item?.promotionImageUrl,
    createdAt: format(new Date(item.createdAt), "MMMM do, yyyy"),
    updatedAt: format(new Date(item.updatedAt), "MMMM do, yyyy"),
    storeId: item.storeId,
  }))

  return (
    <main className="space-y-1">
      <Heading
        title="Billboards"
        subtitle="Manage storefront banners and promotional imagery"
        showButton
        text="Add New"
        handleClick={handleClick}
        plusIcon
      />

      {isLoading || isUninitialized || isFetching ? (
        <Loader />
      ) : billboardData && isSuccess ? (
        <div className="space-y-6 rounded-xl border border-border bg-card p-4 md:p-5">
          <FormattedTable
            data={FormattedBillboardData}
            searchKey="label"
            columns={columns}
          />
          <ApiList entityName="billboards" entityIdName="billboardId" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            An error has occurred, please refetch this page.
          </p>
        </div>
      ) : (
        <EmptyState
          icon={ImageIcon}
          title="Create your first billboard"
          description="Welcome customers with a clear storefront banner."
          actionLabel={loading ? "Processing…" : "Get started"}
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

export default BillboardMain
