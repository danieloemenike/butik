"use client"

import * as z from "zod"
import axios from "axios"
import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Check, ChevronsUpDown, Trash } from "lucide-react"

import { useParams, useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { useAddBillboardMutation, useDeleteBillboardMutation, useGetBillboardQuery, useGetBillboardsQuery, useUpdateBillboardMutation } from "@/reduxStore/services/billboardApiSlice"

import type { Category } from "@prisma/client"
import Loader from "@/components/ui/Loader"
// import AlertModal from "@/components/ui/modals/AlertModal"
  import FormattedAlertModal from "@/components/FormattedAlertModal"
import { useDeleteCategoryMutation, useGetCategoryQuery, useUpdateCategoryMutation } from "@/reduxStore/services/categoryApiSlice"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"



const formSchema = z.object({
  name: z.string().min(1), 
  billboardId: z.string({
    required_error: "Please select a language.",
  }),
});

type BillboardFormValues = z.infer<typeof formSchema>


export const EditCategoryForm = () => {

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);


  const params = useParams();
  const {storeId, categoryId} = params
  const router = useRouter();
  
  //API CALLS
  const { data: initialData, isSuccess: gottenData } = useGetCategoryQuery({ storeId, categoryId })

  const{data = [], error, isLoading:isBillboardLoading, isFetching, isSuccess:isBillboardSuccessful,  isError: isBillboardError} = useGetBillboardsQuery(`${storeId}`, { refetchOnMountOrArgChange: true } );
 
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

   const form =  useForm<BillboardFormValues>({
    resolver: zodResolver(formSchema),
     defaultValues:  initialData
    
  });

  useEffect(() => {
    if (gottenData && initialData) {
      form.reset({
        name: initialData.name,
        billboardId: initialData.billboardId,
      });
    }
  }, [gottenData, initialData, form.reset]);
  
 
  
//Patch 
  const onSubmit = async (data: BillboardFormValues) => {
    try {
      setLoading(true);
      //await axios.post(`/api/${params.storeId}/billboard/v1`, data);
      // await updateBillboard({ storeId: params.storeId, billboardId: params.billboardId, updatedData: data })
      
      await updateCategory({ storeId: params.storeId, categoryId: params.categoryId, updatedData: data })
      
      router.refresh();
      router.push(`/store/${storeId}/categories`);
     
    } catch (error: any) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      // await deleteBillboard({ storeId: params.storeId, billboardId: params.billboardId })
      // router.refresh();
      await deleteCategory({ storeId: params.storeId, categoryId: params.categoryId })
      router.refresh();
      router.push(`/store/${storeId}/categories`);
      console.log('Category deleted.');
    } catch (error: any) {
      console.error('Make sure you removed all categories using this billboard first.');
    } finally {
      setLoading(false);
      setOpen(false);
    } 
  }

  return (
    <>
      { gottenData ? (
        <>
             {/* <AlertModal
        open={open} 
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
              title="Are you absolutely sure?"
              description ="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
          
      />
           */}
          
          <FormattedAlertModal title = "Are you absolutely sure?"  description ="This action cannot be undone. This will permanently delete your account and remove your data from our servers." isOpen = {open}  onClose={() => setOpen(false)} />
          
     <div className="flex items-center justify-between">
       
    
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
       
      </div>
    
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto ml-1 w-[70%]">
         
          <div className="md:grid md:grid-cols-3 gap-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Category Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>
                
          <div>

            <FormField control={ form.control } 
              name="billboardId" render={ ({ field }) => (
                <>
                <FormLabel>Choose one Billboard </FormLabel>
               
                <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant = "outline" role="combobox" className={cn("w-[200px] justify-between ", !field.value && "text-muted-background")}>
                    {field.value ? data.find((billboard) => billboard.id === field.value )?.label : "Select Billboard" }
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          
                        </Button>
                      </FormControl>

                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                        <Command>
                        <CommandInput placeholder="Search for the billboard" />
                        <CommandEmpty>  
                          No Billboard Found 
                        </CommandEmpty>
                        <CommandGroup>
                          { data?.map((item) => (
                            <CommandItem value={ item.label }
                              key={ item.id }
                              onSelect={
                                () => {
                              form.setValue("billboardId", item.id)
                                }
                              }>
                              <Check className={ cn("mr-2 h-4 w-4 ",item.id === field.value ? "opacity-100" : "opacity-0" )} />
                              { item.label}
                              </CommandItem>
                          )) }
                        </CommandGroup>   
                    </Command>
                    </PopoverContent>
                </Popover>
            </>
            )}
            />
          </div>



          <Button disabled={loading} className="ml-auto" type="submit">
            Create 
          </Button>
        </form>
      </Form>
           </>
        )
        : <>
          <Loader />

          </>
      
      }  
    </>
  );
};
