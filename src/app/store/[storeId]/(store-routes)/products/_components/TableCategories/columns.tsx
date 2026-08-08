"use client"

import { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy"
import CellAction from "./cellAction"
import Image from "next/image"

type ProductData = {
  id: string
  name: string
  price: string
  category: string
  size: string
  color: string
  createdAt: string
  isFeatured: boolean
  isArchived: boolean
  image: string
  slug: string | null
  storefrontVisible: boolean
}

export const columns: ColumnDef<ProductData, unknown>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="font-medium">{row.original.name}</p>
        {!row.original.isArchived && !row.original.storefrontVisible ? (
          <span className="inline-flex rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-200">
            Hidden on storefront
          </span>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "image",
    header: "Product Image",
    cell: (info) => (
      <Image
        src={info.row.original.image}
        alt=""
        className="rounded object-contain"
        width={60}
        height={30}
      />
    ),
  },
  {
    accessorKey: "slug",
    header: "URL slug",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.slug || "—"}
      </span>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "isArchived",
    header: "Archived",
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.color}
        <div
          className="h-6 w-6 rounded-full border"
          style={{ backgroundColor: row.original.color }}
        />
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]

export default columns
