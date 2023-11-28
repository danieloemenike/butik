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

import { useAddSizeMutation, } from "@/reduxStore/services/sizeApiSlice"



const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});

type BillboardFormValues = z.infer<typeof formSchema>


export const NewSizeForm = () => {
  
  const params = useParams();
  const {storeId, sizeId} = params
    const router = useRouter();
    const [addSize,{isLoading,isError, isSuccess}] = useAddSizeMutation();
 
  const [loading, setLoading] = useState(false);
 
   const form =  useForm<BillboardFormValues>({
    resolver: zodResolver(formSchema),
     defaultValues: {
       name: "",
       value: ""
     }
    
  });

  const onSubmit = async (data: BillboardFormValues) => {
    try {
      setLoading(true);
      //await axios.post(`/api/${params.storeId}/billboard/v1`, data);
      await addSize({ storeId: params.storeId, data }).unwrap();
        console.log("success")
      router.refresh();
      router.push(`/store/${storeId}/sizes`);
     
    } catch (error: any) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

 

  return (
    <>
     
          
          
    
      <Form {...form}>
        <form onSubmit={ form.handleSubmit(onSubmit) } className=" space-y-8 w-full">
        <div className="md:grid md:grid-cols-3 gap-8">
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
            </div>
          <Button disabled={loading} className="ml-auto" type="submit">
           Create Size
          </Button>
        </form>
          </Form>
        
    </>
  );
};
