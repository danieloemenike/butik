import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import type {Category, Size} from "@prisma/client"
import { z } from 'zod';

 
export type categoryForm = {
    name: string
    value: string
}
type CategoriesDataTable = {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    storeId: string;
    billboardId: string;
   billboard: { 
    createdAt: string
    id: string
    imageUrl : string
    label: string
    promotionImageUrl?:  string
    promotionText?:  string
    storeId : string
    updatedAt: string}
    }
// type DeleteCategoryArgs = {
//     storeId: string | string[]
//     categoryId: string | string[]
// }[]

export const sizeApiSlice = createApi({
    reducerPath: 'sizeApiSlice',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['size'],
    //refetchOnMountOrArgChange: true,
    //keepUnusedDataFor: 36000,
    endpoints: (build) => ({
         //                      ResultType  QueryArgs
    //                                   v       v
        addSize: build.mutation<Category,{storeId:string|string[]; data: categoryForm}>({
            query: ({ storeId, data }) => ({
                url: `/${storeId}/sizes/v1`,
                method: "POST",
                body: data 
                

            }),
            invalidatesTags: ['size']
          
        }),
          getSizes: build.query<Omit<Size[],"storeId">, string>({
                query: (storeId) => `/${storeId}/sizes/v1`,
                providesTags: ['size']
          }),
          getSize: build.query<Size, {storeId:string|string[], sizeId:string|string[]}>({
        query: ({storeId, sizeId}) => `/${storeId}/sizes/${sizeId}/v1`,
            providesTags: ['size']
    }),
        deleteSize: build.mutation<Size, { storeId: string | string[], sizeId: string | string[] }>({
            query: ({ storeId, sizeId }) => ({
                url: `/${storeId}/sizes/${sizeId}/v1`,
                method: 'DELETE'
            }),
            invalidatesTags: ['size']
        }),
        updateSize: build.mutation<Size, { storeId: string | string[], sizeId: string | string[],updatedData: {
            name: string;
            value: string;
            // Add other fields as needed
          } }>({
            query: ({ storeId, sizeId,updatedData }) => ({
                url: `/${storeId}/sizes/${sizeId}/v1`,
                  method: 'PATCH',
                body: updatedData
            }),
            invalidatesTags: ['size']
        }),
    })
})

export const {useAddSizeMutation, useGetSizesQuery, useGetSizeQuery, useDeleteSizeMutation, useUpdateSizeMutation} = sizeApiSlice