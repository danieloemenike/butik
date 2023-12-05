
"use client"

import { useForm, } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
// import PhoneInput from "react-phone-number-input";
import { useEffect, useState } from "react"
// import axios from 'axios'
// import validator from "validator";
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useAddBusinessMutation } from "@/reduxStore/services/businessApiSlice"
import Header from "@/app/_components/Header"

const phoneRegex = new RegExp(
    /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
  );
  
const formSchema = z.object({
    businessName: z.string().min(3, {
        message: "Your business name must be more than 3 characters"
    }).max(30, {
        message: "Your business name is too long!. It cannot be more than 30 characters, Kindly Reduce It."
    }),
    businessPhoneNumber: z.string(),
    businessAddress: z.string().min(3, {
        message: "Your business address is too short! Please add more information to it"
    }).max(30, {
        message: "Your business address cannot be more than 50 characters"
    }),
    businessCity: z.string().min(3, {
        message: "Your business address must be more than 3 characters"
    }).max(30, {
        message: "Your business address cannot be more than 50 characters"
    }),
    businessCountry: z.string().min(3, {
        message: "Your business country must be more than 3 characters"
    }).max(30, {
        message: "Your business country cannot be more than 50 characters"
    }),
    
})



export default function BusinessForm() {
    const router = useRouter()
   
    const {toast} = useToast()
    //business slug state
   
    const [loading, setLoading] = useState(false);

    const [addBusiness,{isLoading,isError, isSuccess}] = useAddBusinessMutation();
    //form default values and resolver
    const form = useForm<z.infer<typeof formSchema>>({
       resolver:   zodResolver(formSchema),
        defaultValues: {
            businessName: "",
            businessPhoneNumber: "",
            businessAddress: "",
            businessCity: "Lagos",
            businessCountry: "Nigeria",
          
            
       }

    })




    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            setLoading(true)
            const response = await addBusiness({ data }).unwrap();
            if (!response) return
            console.log(response)
            toast({
                description: "Business Created Successfully.",
              })
             
            router.push(`/business/${response?.id}`)
            
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with the request. Please try again",
                
              })
      
            console.log("something went wrong",error)
        } finally {
            setLoading(false)
        }
    }
    return (
    <>
         
            <main className = " w-[90%]  mx-auto mt-[40px] mb-[10px]">
        
            <Form { ...form } >
              <form onSubmit={ form.handleSubmit(onSubmit) } className="space-y-8" >
                     <main className="grid grid-cols-1 lg:grid-cols-2 md:gap-4 gap-8">
                     <div>
                      <FormField control={form.control} name = "businessName" render={ ({ field }) => (
                              <FormItem>
                                  <FormLabel>
                                      Business Name
                                  </FormLabel>
                                  <FormControl>
                                      <Input { ...field } disabled = {loading} />
                               </FormControl>
                                 <FormMessage />
                          </FormItem>
                      )}
                      />
                          </div>
                       
                          <div>
                      <FormField control={form.control} name = "businessPhoneNumber" render={ ({ field }) => (
                              <FormItem>
                                  <FormLabel>
                                      Official Business Phone Number
                                  </FormLabel>
                                  <FormControl>
                                      <Input  { ...field } disabled = {loading} />
                               </FormControl>
                                 <FormMessage />
                          </FormItem>
                      )}
                      />
                      </div>
                      <div>
                      <FormField control={form.control} name = "businessAddress" render={ ({ field }) => (
                              <FormItem>
                                  <FormLabel>
                                      Business Address
                                  </FormLabel>
                                  <FormControl>
                                      <Input placeholder="" { ...field } disabled = {loading} />
                               </FormControl>
                                 <FormMessage />
                          </FormItem>
                      )}
                      />
                      </div>
                      <div>
                      <FormField control={form.control} name = "businessCity" render={ ({ field }) => (
                              <FormItem>
                                  <FormLabel>
                                      City
                                  </FormLabel>
                                  <FormControl>
                                      <Input placeholder="" { ...field } disabled = {loading} />
                               </FormControl>
                                 <FormMessage />
                          </FormItem>
                      )}
                      />
                          </div>
                          <div>
                      <FormField control={form.control} name = "businessCountry" render={ ({ field }) => (
                              <FormItem>
                                  <FormLabel>
                                      Country
                                  </FormLabel>
                                  <FormControl>
                                      <Input placeholder="" { ...field } disabled = {loading} />
                               </FormControl>
                                 <FormMessage />
                          </FormItem>
                      )}
                      />
                          </div>
                            </main>
                        <Button disabled={ loading } type="submit"> 
                        {loading ? "Processing.." : " Create Business"}
                        </Button>
                    
                  </form>
                
              </Form>
             
          </main>
              
       
    
        </>
    )
}