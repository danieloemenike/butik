import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import type {Store} from "@prisma/client"



export const storeApi = createApi({
    reducerPath: 'storeApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api/business' }),
    tagTypes: ['Post'],
    //refetchOnMountOrArgChange: true,
    keepUnusedDataFor: 36000,
    endpoints: (build) => ({
        getStores: build.query<Store[],string>({
            query: (id) => `/${id}/stores/v1`,
            providesTags: ['Post'],
        }),
        deleteStore: build.mutation<Store, { storeId: string | string[], businessId: string | string[] }>({
            query: ({ storeId, businessId }) => ({
                url: `/${businessId}/stores/${storeId}/v1`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Post']
        }),
    })
})

export const {  useGetStoresQuery, useDeleteStoreMutation} = storeApi