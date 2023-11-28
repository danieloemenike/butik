
"use client"

import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components//ui/button"
import { useState } from "react"
import axios from 'axios'
import Router from "next/router"
import { useParams, useRouter } from "next/navigation"
import { CircleDotDashed } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

  
const formSchema = z.object({
   storeName: z.string().min(3, {
        message: "Your store name is too short!.It must be more than 2 characters"
    }).max(30, {
        message: "Your store name cannot be more than 30 characters"
    }),
    storePhoneNumber: z.string(),
    storeAddress: z.string().min(3, {
        message: "Your business address is too short! Please add more information to it"
    }).max(30, {
        message: "Your business address cannot be more than 50 characters"
    }),
    storeCity: z.string().min(3, {
        message: "Your business address must be more than 3 characters"
    }).max(30, {
        message: "Your business address cannot be more than 50 characters"
    }),
    storeCountry: z.string().min(3, {
        message: "Your business country must be more than 3 characters"
    }).max(30, {
        message: "Your business country cannot be more than 50 characters"
    }),
    
})

export default function NewStoreForm() {
    const { toast } = useToast();
    const params = useParams();
  const router = useRouter()
    //form state
    const [loading, setLoading] = useState(false)

    //form default values and resolver
    const form = useForm<z.infer<typeof formSchema>>({
       resolver:   zodResolver(formSchema),
        defaultValues: {
            storeName: "",
            storePhoneNumber: "",
            storeAddress: "",
            storeCity: "Lagos",
            storeCountry:"Nigeria"
            
       }

    })
    
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setLoading(true)
            const response = await axios.post(`/api/business/${params.businessId}/stores/v1`, values)
            console.log("success")
            
            if (response) {
                toast({
                    title:"Success",
                    description: "Your Store has been created",
                  })
                router.refresh()
                router.push(`/business/${params.businessId}`)
            } else {
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "There was a problem with your request. Please try again",
                   
                  })
                console.log("Something went wrong ")
            }
            
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request. Please try again",
               
              }) 
            console.log("something went wrong",error)
        } finally {
            setLoading(false)
        }
    }
    return (
        <main className = " w-[70%]  mx-auto mt-[40px]">
        
          <Form { ...form }>
            <form onSubmit={ form.handleSubmit(onSubmit) } className="space-y-8">
                   <main className="grid grid-cols-2 gap-4">
                   <div>
                    <FormField control={form.control} name = "storeName" render={ ({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Store Name
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Store Name" { ...field } />
                             </FormControl>
                               <FormMessage />
                        </FormItem>
                    )}
                    />
                    </div>
                        <div>
                    <FormField control={form.control} name = "storePhoneNumber" render={ ({ field }) => (
                            <FormItem>
                                <FormLabel>
                                   Store Phone Number
                                </FormLabel>
                                <FormControl>
                                    <Input  { ...field } />
                             </FormControl>
                               <FormMessage />
                        </FormItem>
                    )}
                    />
                    </div>
                    <div>
                    <FormField control={form.control} name = "storeAddress" render={ ({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Store Address
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="" { ...field } />
                             </FormControl>
                               <FormMessage />
                        </FormItem>
                    )}
                    />
                    </div>
                    <div>
                    <FormField control={form.control} name = "storeCity" render={ ({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    City
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="" { ...field } />
                             </FormControl>
                               <FormMessage />
                        </FormItem>
                    )}
                    />
                        </div>
                        <div>
                    <FormField control={form.control} name = "storeCountry" render={ ({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Country
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="" { ...field } />
                             </FormControl>
                               <FormMessage />
                        </FormItem>
                    )}
                    />
                        </div>
                          </main>
                    <Button disabled={ loading } type="submit">
                    { loading ? (
                  <>
                 <div role="status">
    <CircleDotDashed  className="inline w-4 h-4 mr-2 text-blue-800 animate-spin dark:text-black"/>
    <span className="sr-only">Loading...</span>
</div>
                Processing...
                </>
              ) : (
              <p>Create Store </p>  
             )
            }
                    
                    </Button>
                  
                </form>
              
            </Form>
           
        </main>
    )
    
}