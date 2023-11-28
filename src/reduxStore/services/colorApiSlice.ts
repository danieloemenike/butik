import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import type {Category, Color} from "@prisma/client"
import { z } from 'zod';

 
export type categoryForm = {
    name: string
    value: string
}

// type DeleteCategoryArgs = {
//     storeId: string | string[]
//     categoryId: string | string[]
// }[]

export const colorApiSlice = createApi({
    reducerPath: 'colorApiSlice',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['color'],
    //refetchOnMountOrArgChange: true,
    //keepUnusedDataFor: 36000,
    endpoints: (build) => ({
         //                      ResultType  QueryArgs
    //                                   v       v
        addColor: build.mutation<Category,{storeId:string|string[]; data: categoryForm}>({
            query: ({ storeId, data }) => ({
                url: `/${storeId}/colors/v1`,
                method: "POST",
                body: data 
                

            }),
            invalidatesTags: ['color']
          
        }),
          getColors: build.query<Omit<Color[],"storeId">, string>({
                query: (storeId) => `/${storeId}/colors/v1`,
                providesTags: ['color']
          }),
          getColor: build.query<Color, {storeId?:string|string[], colorId:string|string[]}>({
        query: ({storeId, colorId}) => `/${storeId}/colors/${colorId}/v1`,
            providesTags: ['color']
    }),
        deleteColor: build.mutation<Color, { storeId: string | string[], colorId: string | string[] }>({
            query: ({ storeId, colorId }) => ({
                url: `/${storeId}/colors/${colorId}/v1`,
                method: 'DELETE'
            }),
            invalidatesTags: ['color']
        }),
        updateColor: build.mutation<Color, { storeId?: string | string[], colorId: string | string[],updatedData: {
            name: string;
            value: string;
            // Add other fields as needed
          } }>({
            query: ({ storeId, colorId,updatedData }) => ({
                url: `/${storeId}/colors/${colorId}/v1`,
                  method: 'PATCH',
                body: updatedData
            }),
            invalidatesTags: ['color']
        }),
    })
})

export const {useAddColorMutation, useGetColorsQuery, useGetColorQuery, useDeleteColorMutation, useUpdateColorMutation} = colorApiSlice