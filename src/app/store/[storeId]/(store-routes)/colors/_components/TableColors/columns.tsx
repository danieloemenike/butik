'use client'


import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import CellAction from "./cellAction";
import Image from "next/image";


type sizeDataInfo = {
  
    id: string;
    name: string;
  value: string;
   
   
}

    
 const columnHelper = createColumnHelper<sizeDataInfo>()
 const columns : ColumnDef<sizeDataInfo, string>[] = [
        columnHelper.accessor('name', {
            header: ({column}) => {
            return (
              <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Color Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
              )
            }
        }),
         columnHelper.accessor('value', {
          header: "Color Value",
          cell: ({ row }) => (
            <div className="flex items-center gap-x-2">
              {row.original.value}
              <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: row.original.value }} />
            </div>
          )
       
        }),
      
    //     columnHelper.accessor('createdAt', {
    //         header: "Date Created"
    //     }),
    //     columnHelper.accessor('updatedAt', {
    //       header: "Last Updated"
    //     }),

    //  columnHelper.display({
    //      id: 'actions',
    //      cell: ({row}) => <CellAction data = {row.original} />
    //  })
    ]



export default columns