"use client"

import * as z from "zod"
import axios from "axios"
import { useState } from "react"
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

import { useAddCategoryMutation } from "@/reduxStore/services/categoryApiSlice"
import { useGetBillboardsQuery } from "@/reduxStore/services/billboardApiSlice"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Category } from "@prisma/client"


const formSchema = z.object({
  name: z.string().min(1), 
  billboardId: z.string({
    required_error: "Please select a language.",
  }),
});

type CategoryFormValues = z.infer<typeof formSchema>


type CategoryData = {
  id: string;
  label: string;
  imageUrl: string;
  promotionText: string | null;
  promotionImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  storeId: string;
}[]
export const CategoryForm = () => {
  const params = useParams();
  const {storeId} = params
  const router = useRouter();
  
  const [addCategory, { isLoading, isError, isSuccess }] = useAddCategoryMutation();
  
    const{data = [], error, isLoading:isBillboardLoading, isFetching, isSuccess:isBillboardSuccessful,  isError: isBillboardError} = useGetBillboardsQuery(`${storeId}`, { refetchOnMountOrArgChange: true } );
 
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

   const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      billboardId: ''
    }
  });

  const onSubmit = async (categoryData: CategoryFormValues) => {
    try {
      setLoading(true);
      //await axios.post(`/api/${params.storeId}/billboard/v1`, data);
        await addCategory({ storeId, data: categoryData }).unwrap();
        console.log("success")
      router.refresh();
      router.push(`/store/${storeId}/categories`);
     
    } catch (error: any) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
    
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
  );
};
