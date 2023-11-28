'use client'

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import Image from "next/image";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import CellAction from "./cellAction";

type StoreType = {
    id: string; name: string; address: string | null; city: string | null; country: string | null; createdAt: string; updatedAt: string; phoneNumber: string | null;
}
    
 const columnHelper = createColumnHelper<StoreType>()
 const columns : ColumnDef<StoreType, string>[] = [
        columnHelper.accessor('name', {
            header: ({column}) => {
            return (
              <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Store Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
              )
            }
        }),
        
         columnHelper.accessor('address', {
          header: "Address",
          
         }),
         columnHelper.accessor('phoneNumber', {
          header: "Phone No",
          
         }),
         columnHelper.accessor('city', {
            header: "City",
            
         }),
         columnHelper.accessor('country', {
            header: "Country",
            
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