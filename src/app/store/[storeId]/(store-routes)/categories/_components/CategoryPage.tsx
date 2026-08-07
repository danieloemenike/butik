"use client"

import React, { Suspense, useState } from "react"
import Heading from "@/components/StoreHeading"
import { useParams, useRouter } from "next/navigation"
import Loader from "@/components/ui/Loader"
import Table from "@/components/ui/FormattedTable"
import { format } from "date-fns"
import columns from "./TableCategories/columns"
import { Tags } from "lucide-react"
import { useGetCategoriesQuery } from "@/reduxStore/services/categoryApiSlice"
import { ApiList } from "@/components/ui/api-list"
import { EmptyState } from "@/components/EmptyState"

function CategoryPage() {
  const [loading, setLoading] = useState(false)
  const { storeId } = useParams()
  const router = useRouter()

  const handleClick = () => {
    try {
      setLoading(true)
      router.push(`/store/${storeId}/categories/new`)
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
  } = useGetCategoriesQuery(`${storeId}`, { refetchOnMountOrArgChange: true })

  const categoryData =
    data.length > 0 &&
    typeof data != "undefined" &&
    data != null &&
    data.length != null

  const FormattedCategoryData = data?.map((item) => ({
    id: item.id,
    name: item.name,
    createdAt: format(new Date(item.createdAt), "MMMM do, yyyy"),
    updatedAt: format(new Date(item.updatedAt), "MMMM do, yyyy"),
  }))

  return (
    <main className="space-y-1">
      <Heading
        title="Categories"
        subtitle="Organize products into clear taxonomy groups"
        showButton={false}
        text="Add New"
        handleClick={handleClick}
        plusIcon
      />

      {isLoading || isUninitialized || isFetching ? (
        <Loader />
      ) : categoryData && isSuccess ? (
        <div className="space-y-6 rounded-xl border border-border bg-card p-4 md:p-5">
          <Suspense fallback={<Loader />}>
            <Table
              data={FormattedCategoryData}
              searchKey="name"
              columns={columns}
            />
            <ApiList entityName="categories" entityIdName="categoryId" />
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
          icon={Tags}
          title="No categories yet"
          description="Create categories to organize products in your catalog."
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

export default CategoryPage
