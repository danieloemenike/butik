    import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
    import type {Category} from "@prisma/client"
    import { z } from 'zod';

 
export type categoryForm = {
    id?: string
    name: string
    billboardId?: string
}
type CategoriesDataTable = {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
   
  
    }
type DeleteCategoryArgs = {
    storeId: string | string[]
    categoryId: string | string[]
}[]

export const categoryApiSlice = createApi({
    reducerPath: 'categoryApiSlice',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['category'],
    //refetchOnMountOrArgChange: true,
    //keepUnusedDataFor: 36000,
    endpoints: (build) => ({
         //                      ResultType  QueryArgs
    //                                   v       v
        addCategory: build.mutation<Category,{storeId:string|string[]; data: categoryForm}>({
            query: ({ storeId, data }) => ({
                url: `/${storeId}/categories/v1`,
                method: "POST",
                body: data 
                

            }),
            invalidatesTags: ['category']
          
        }),
          getCategories: build.query<CategoriesDataTable[], string>({
                query: (storeId) => `/${storeId}/categories/v1`,
                providesTags: ['category']
          }),
          getCategory: build.query<categoryForm, {storeId:string|string[], categoryId:string|string[]}>({
            query: ({storeId, categoryId}) => `/${storeId}/categories/${categoryId}/v1`,
            providesTags: ['category']
    }),
        deleteCategory: build.mutation<Category, { storeId: string | string[], categoryId: string | string[] }>({
            query: ({ storeId, categoryId }) => ({
                url: `/${storeId}/categories/${categoryId}/v1`,
                method: 'DELETE'
            }),
            invalidatesTags: ['category']
        }),
        updateCategory: build.mutation<Category, { storeId: string | string[], categoryId: string | string[],updatedData: {
            name: string;
            billboardId: string;
            // Add other fields as needed
          } }>({
            query: ({ storeId, categoryId,updatedData }) => ({
                url: `/${storeId}/categories/${categoryId}/v1`,
                  method: 'PATCH',
                body: updatedData
            }),
            invalidatesTags: ['category']
        }),
    })
})

export const {useAddCategoryMutation, useGetCategoriesQuery, useGetCategoryQuery, useDeleteCategoryMutation, useUpdateCategoryMutation} = categoryApiSlice