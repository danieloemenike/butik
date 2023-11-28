import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import type {Billboard} from "@prisma/client"
import { z } from 'zod';

 
export type billboardForm = {
    id?: string
    label: string
    imageUrl: string
}

type DeleteBillboardArgs = {
    storeId: string | string[]
    billboardId: string | string[]
}[]

export const billboardApiSlice = createApi({
    reducerPath: 'billboardApiSlice',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['Billboard'],
    //refetchOnMountOrArgChange: true,
    //keepUnusedDataFor: 36000,
    endpoints: (build) => ({
         //                      ResultType  QueryArgs
    //                                   v       v
        addBillboard: build.mutation<Billboard,{storeId:string|string[]; data: billboardForm}>({
            query: ({ storeId, data }) => ({
                url: `/${storeId}/billboard/v1`,
                method: "POST",
                body: data 
                

            }),
            invalidatesTags: ['Billboard']
          
        }),
          getBillboards: build.query<Billboard[], string>({
                query: (storeId) => `/${storeId}/billboard/v1`,
                providesTags: ['Billboard']
          }),
          getBillboard: build.query<billboardForm, {storeId:string|string[], billboardId:string|string[]}>({
            query: ({storeId, billboardId}) => `/${storeId}/billboard/${billboardId}/v1`,
            providesTags: ['Billboard']
    }),
        deleteBillboard: build.mutation<Billboard, { storeId: string | string[], billboardId: string | string[] }>({
            query: ({ storeId, billboardId }) => ({
                url: `/${storeId}/billboard/${billboardId}/v1`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Billboard']
        }),
        updateBillboard: build.mutation<Billboard, { storeId: string | string[], billboardId: string | string[],updatedData: {
            label: string;
            imageUrl: string;
            // Add other fields as needed
          } }>({
            query: ({ storeId, billboardId,updatedData }) => ({
                url: `/${storeId}/billboard/${billboardId}/v1`,
                  method: 'PATCH',
                body: updatedData
            }),
            invalidatesTags: ['Billboard']
        }),
    })
})

export const {useAddBillboardMutation, useGetBillboardsQuery, useGetBillboardQuery, useDeleteBillboardMutation, useUpdateBillboardMutation} = billboardApiSlice