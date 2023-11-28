import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import type {Product} from "@prisma/client"
import { Category } from '@prisma/client';


type productForm = {
    id?: string
    name: string
    categoryId: string
    price: string
    colorId: string
    sizeId: string
    images: string
    isFeatured: string
    isArchived: string
}
type ProductAddType = {
    id?: string
    name: string
    categoryId: string
    price: number
    colorId: string
    sizeId: string
    images: { url: string; }[];
    isFeatured?: boolean | undefined
    isArchived?: boolean | undefined
    productVariant: [
        {
          colorId: string
          sizeId: string
          quantity: number
          price: number
          discountedPrice:number
          images: { url: string; }[];
        },
      ],
}

type ProductData = {
    id: string;
    name: string;
    price: string;  
    isFeatured: boolean;
    isArchived: boolean;
    createdAt: Date;
    updatedAt?: Date;
   category: { 
   name: string
    }
    size: {
       name: string
    }
    color: {
        name?: string
        value: string
        
    }
    images: {
        url: string
    }[]
    }


export const productApiSlice = createApi({
    reducerPath: 'productApiSlice',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['product'],
    //refetchOnMountOrArgChange: true,
    //keepUnusedDataFor: 36000,
    endpoints: (build) => ({
         //                      ResultType  QueryArgs
    //                                   v       v
        addProduct: build.mutation<Product,{storeId:string|string[]; data: ProductAddType}>({
            query: ({ storeId, data }) => ({
                url: `/${storeId}/products/v1`,
                method: "POST",
                body: data 
                

            }),
            invalidatesTags: ['product']
          
        }),
          getProducts: build.query<ProductData[], string>({
                query: (storeId) => `/${storeId}/products/v1`,
                providesTags: ['product']
          }),
          getProduct: build.query<Product, {storeId:string|string[], productId:string|string[]}>({
            query: ({storeId, productId}) => `/${storeId}/categories/${productId}/v1`,
            providesTags: ['product']
    }),
        deleteProduct: build.mutation<Product, { storeId: string | string[], productId: string | string[] }>({
            query: ({ storeId, productId }) => ({
                url: `/${storeId}/products/${productId}/v1`,
                method: 'DELETE'
            }),
            invalidatesTags: ['product']
        }),
        updateProduct: build.mutation<Product, { storeId: string | string[], productId: string | string[],updatedData:productForm }>({
            query: ({ storeId, productId,updatedData }) => ({
                url: `/${storeId}/categories/${productId}/v1`,
                  method: 'PATCH',
                body: updatedData
            }),
            invalidatesTags: ['product']
        }),
    })
})

export const {useAddProductMutation, useGetProductsQuery, useGetProductQuery, useDeleteProductMutation, useUpdateProductMutation} = productApiSlice