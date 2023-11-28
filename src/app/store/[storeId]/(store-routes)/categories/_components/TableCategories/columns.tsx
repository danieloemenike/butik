'use client'


import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import CellAction from "./cellAction";
import Image from "next/image";


type categoryDataInfo = {
  
    id: string;
    name: string;
    // createdAt: string;
    // updatedAt: string;
   
}

    
 const columnHelper = createColumnHelper<categoryDataInfo>()
 const columns : ColumnDef<categoryDataInfo, string>[] = [
        columnHelper.accessor('name', {
            header: ({column}) => {
            return (
              <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Category Title
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
              )
            }
        }),
        // columnHelper.accessor('billboardLabel', {
        //   header: "Billboards",
          
       
        // }),
        // columnHelper.accessor('billboardImage', {
        //   header: "Billboard Image",
        //   cell: info => {
        //     const imageUrl = info?.getValue();
        //     const imageUrlValid =imageUrl !== undefined && imageUrl !== null
        //     // Check if imageUrl exists before rendering the Image component
        //     return imageUrlValid ? (
        //       <Image src={imageUrl} alt="avatar" className="object-contain rounded " width={60} height={30} />
        //     ) : (
        //       // Display an empty field or placeholder when imageUrl is not available
        //       <span>Assign A Billboard </span>
        //     );
        //   },
        // }),
        // columnHelper.accessor('createdAt', {
        //     header: "Date Created"
        // }),
        // columnHelper.accessor('updatedAt', {
        //   header: "Last Updated"
        // }),

    //  columnHelper.display({
    //      id: 'actions',
    //      cell: ({row}) => <CellAction data = {row.original} />
    //  })
    ]



export default columns