import { createColumnHelper, flexRender, getCoreRowModel, useReactTable,getSortedRowModel, SortingState,ColumnFiltersState,getFilteredRowModel, getPaginationRowModel, ColumnDef,} from "@tanstack/react-table";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"

 type FormattedDataProps<TData, TValue> = {
    data : TData[],
   searchKey: string,
  columns: ColumnDef<TData, TValue>[],
}

export default function FormattedTable<TData, TValue>({ data, searchKey, columns }: FormattedDataProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    
    const table = useReactTable({
        data,
        columns: columns,
      getCoreRowModel: getCoreRowModel(),
        //sorting
        onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
      //filtering
      onColumnFiltersChange: setColumnFilters,
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      state: {
        sorting,
        columnFilters,
      }
         
    })
  return (
    <main className = " "> 
       
    <div className="flex items-center py-4">
    <Input
      placeholder="Filter..."
      value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
      onChange={(event) =>
        table.getColumn(searchKey)?.setFilterValue(event.target.value)
      }
      className="max-w-sm"
    />
  </div>
        <div className="rounded-md border">
          
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
              </div>
             
      </main>
    )
}