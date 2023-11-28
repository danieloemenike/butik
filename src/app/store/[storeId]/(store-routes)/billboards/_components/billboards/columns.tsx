'use client'

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import Image from "next/image";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import CellAction from "./cellAction";


type BillboardInfoType = {
  id: string;
  label: string;
  imageUrl: string;
  promotionText: string | null;
  promotionImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  storeId: string;
}
 const columnHelper = createColumnHelper<BillboardInfoType>()
 const columns : ColumnDef<BillboardInfoType, string>[] = [
        columnHelper.accessor('label', {
            header: ({column}) => {
            return (
              <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Billboard Title
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
              )
            }
        }),
        columnHelper.accessor('imageUrl', {
          header: "Billboard Image",
          cell: info => <Image src={ info?.getValue() } alt="avatar" className="object-contain rounded " width={ 60 } height={ 30 } />
        }),
        columnHelper.accessor('createdAt', {
            header: "Date Created"
        }),
        columnHelper.accessor('updatedAt', {
          header: "Last Updated"
        }),
     columnHelper.display({
         id: 'actions',
         cell: ({row}) => <CellAction data = {row.original} />
     })
    ]



export default columns