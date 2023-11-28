"use client"

import * as z from "zod"
import axios from "axios"
import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Trash } from "lucide-react"

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

import Loader from "@/components/ui/Loader"
import { useAddSizeMutation, useDeleteSizeMutation, useGetSizeQuery, useUpdateSizeMutation } from "@/reduxStore/services/sizeApiSlice"
import FormattedAlertModal from "@/components/FormattedAlertModal"



const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});

type BillboardFormValues = z.infer<typeof formSchema>


export const EditSizeForm = () => {
  
  const params = useParams();
  const {storeId, sizesId} = params
    const router = useRouter();

  const { data: initialData, isSuccess: gottenData } = useGetSizeQuery({ storeId, sizeId: sizesId })
  const [deleteSize] = useDeleteSizeMutation();
  const [updateSize] = useUpdateSizeMutation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
 
   const form =  useForm<BillboardFormValues>({
    resolver: zodResolver(formSchema),
     defaultValues: initialData
    
  });
  
  
  useEffect(() => {
    if (gottenData && initialData) {
      form.reset({
        name: initialData.name,
        value: initialData.value,
      });
    }
  }, [gottenData, initialData, form.reset]);

  const onSubmit = async (data: BillboardFormValues) => {
    try {
      setLoading(true);
      //await axios.post(`/api/${params.storeId}/billboard/v1`, data);
        await updateSize({ storeId: params.storeId, sizeId: params.sizesId, updatedData: data })
        console.log("success")
      router.refresh();
      router.push(`/store/${storeId}/sizes`);
     
    } catch (error: any) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await deleteSize({ storeId: params.storeId, sizeId: params.sizesId })
      router.refresh();
      router.push(`/store/${storeId}/sizes`);
    } catch (error: any) {
      console.error('Size could not be deleted',error);
    } finally {
      setLoading(false);
      setOpen(false);
    } 
  }

  return (
    <>
      { gottenData ? (
        <>
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
        <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Size name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Size value" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <Button disabled={loading} className="ml-auto" type="submit">
            Save Changes
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
