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

import { useAddBillboardMutation, useDeleteBillboardMutation, useGetBillboardQuery, useUpdateBillboardMutation } from "@/reduxStore/services/billboardApiSlice"
import ImageUpload from "../../new/_components/ImageUpload"
import type { Billboard } from "@prisma/client"
import Loader from "@/components/ui/Loader"
// import AlertModal from "@/components/ui/modals/AlertModal"
import FormattedAlertModal from "@/components/FormattedAlertModal"

type BillboardData = {
  label: string,
  imageUrl: string
}

const formSchema = z.object({
  label: z.string().min(1),
  imageUrl: z.string().min(1),
});

type BillboardFormValues = z.infer<typeof formSchema>


export const EditBillboardForm = () => {
  
  const params = useParams();
  const {storeId, billboardId} = params
    const router = useRouter();
    const [addBillboard,{isLoading,isError, isSuccess}] = useAddBillboardMutation();
  const { data: initialData, isSuccess: gottenData } = useGetBillboardQuery({ storeId, billboardId })
  const [deleteBillboard] = useDeleteBillboardMutation();
  const [updateBillboard] = useUpdateBillboardMutation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
 
   const form =  useForm<BillboardFormValues>({
    resolver: zodResolver(formSchema),
     defaultValues:   {
        label: "",
        imageUrl: ""
  }
    
  });

  useEffect(() => {
    if (gottenData && initialData) {
      form.reset({
        label: initialData.label,
        imageUrl: initialData.imageUrl,
      });
    }
  }, [gottenData, initialData, form.reset]);

  const onSubmit = async (data: BillboardFormValues) => {
    try {
      setLoading(true);
      //await axios.post(`/api/${params.storeId}/billboard/v1`, data);
        await updateBillboard({ storeId: params.storeId, billboardId: params.billboardId, updatedData: data })
       
      router.refresh();
      router.push(`/store/${storeId}/billboards`);
     
    } catch (error: any) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await deleteBillboard({ storeId: params.storeId, billboardId: params.billboardId })
      router.refresh();
      router.push(`/store/${storeId}/billboards`);
      
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
          
      /> */}
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
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background image</FormLabel>
                  <FormControl>
                    <ImageUpload 
                      value={field.value ? [field.value] : []} 
                      disabled={loading} 
                      onChange={(url) => field.onChange(url)}
                      onRemove={() => field.onChange('')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <div className="md:grid md:grid-cols-3 gap-3">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Billboard label" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
