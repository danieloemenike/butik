'use client'


import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import CellAction from "./cellAction";
import Image from "next/image";



type ProductData = {
    id: string
    name: string;
    price: string;
    category: string;
    size: string;
    color: string;
    createdAt: string;
    isFeatured: boolean;
  isArchived: boolean;
    image: string
    }

    
    export const columns: ColumnDef<ProductData>[] = [
        {
          accessorKey: "name",
          header: "Name",
      },
      {
        accessorKey: 'image', 
          header: "Product Image",
          cell: info => <Image src={ info.row.original.image} alt="avatar" className="object-contain rounded " width={ 60 } height={ 30 } />
        
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
              <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: row.original.color }} />
            </div>
          )
        },
        {
          accessorKey: "createdAt",
          header: "Date",
        },
        {
          id: "actions",
          cell: ({ row }) => <CellAction data={row.original} />
        },
      ];



export default columns