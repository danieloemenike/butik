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

import { useAddColorMutation, } from "@/reduxStore/services/colorApiSlice"



const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});

type BillboardFormValues = z.infer<typeof formSchema>


export const NewColorForm = () => {
  
  const params = useParams();
  const {storeId, colorId} = params
    const router = useRouter();
    const [addColor,{isLoading,isError, isSuccess}] = useAddColorMutation();
 
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
      await addColor({ storeId: params.storeId, data }).unwrap();
        console.log("success")
      router.refresh();
      router.push(`/store/${storeId}/colors`);
     
    } catch (error: any) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

 

  return (
    <>
     
          
          
    
      <Form {...form}>
        <form onSubmit={ form.handleSubmit(onSubmit) } className="space-y-8 w-full">
        <div className="md:grid md:grid-cols-3 gap-8">
        <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Color name" {...field} />
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
                  <div className="flex items-center gap-x-4">
                    <Input disabled={loading} placeholder="Color value" {...field} />
                    <div 
                        className="border p-4 rounded-full" 
                        style={{ backgroundColor: field.value }}
                    />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            Create Color  
           
            </Button>
     
        </form>
          </Form>
        
    </>
  );
};
