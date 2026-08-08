"use client"

import FormattedTable from "@/components/ui/FormattedTable"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export type OrderRow = {
  id: string
  reference: string
  status: string
  customerName: string
  phone: string
  itemCount: number
  subtotal: string
  createdAt: string
}

export function OrdersTable({
  storeId,
  data,
}: {
  storeId: string
  data: OrderRow[]
}) {
  const router = useRouter()

  const columns = [
    {
      accessorKey: "reference",
      header: "Reference",
      cell: ({ row }: { row: { original: OrderRow } }) => (
        <button
          type="button"
          className="font-medium underline-offset-2 hover:underline"
          onClick={() =>
            router.push(`/store/${storeId}/orders/${row.original.id}`)
          }
        >
          {row.original.reference}
        </button>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: OrderRow } }) => {
        const status = row.original.status
        const pending = status === "PENDING"
        const expired = status === "EXPIRED"
        return (
          <span
            className={
              pending
                ? "rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300"
                : expired
                  ? "rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  : "text-xs font-medium opacity-80"
            }
          >
            {status}
          </span>
        )
      },
    },
    { accessorKey: "customerName", header: "Customer" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "itemCount", header: "Items" },
    { accessorKey: "subtotal", header: "Total" },
    { accessorKey: "createdAt", header: "Placed" },
    {
      id: "actions",
      cell: ({ row }: { row: { original: OrderRow } }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(`/store/${storeId}/orders/${row.original.id}`)
          }
        >
          View
        </Button>
      ),
    },
  ]

  return (
    <FormattedTable data={data} searchKey="reference" columns={columns} />
  )
}
