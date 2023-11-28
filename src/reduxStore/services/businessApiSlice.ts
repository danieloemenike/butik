import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Business } from "@prisma/client";


export type businessForm = {
	businessName: string;
	businessAddress: string;
	businessCity: string;
	businessCountry: string;
	businessPhoneNumber?: any;
};

// type DeleteBillboardArgs = {
//     storeId: string | string[]
//     billboardId: string | string[]
// }[]

export const businessApiSlice = createApi({
	reducerPath: "businessApiSlice",
	baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
	tagTypes: ["Business"],
	//refetchOnMountOrArgChange: true,
	//keepUnusedDataFor: 36000,
	endpoints: (build) => ({
		//                      ResultType  QueryArgs
		//                                   v       v
		addBusiness: build.mutation<Business, { data: businessForm }>({
			query: ({ data }) => ({
				url: `/business/v1`,
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Business"],
		}),
		//       getBillboards: build.query<Billboard[], string>({
		//             query: (storeId) => `/${storeId}/billboard/v1`,
		//             providesTags: ['Billboard']
		//       }),
		//       getBillboard: build.query<billboardForm, {storeId:string|string[], billboardId:string|string[]}>({
		//         query: ({storeId, billboardId}) => `/${storeId}/billboard/${billboardId}/v1`,
		//         providesTags: ['Billboard']
		// }),
		//     deleteBillboard: build.mutation<Billboard, { storeId: string | string[], billboardId: string | string[] }>({
		//         query: ({ storeId, billboardId }) => ({
		//             url: `/${storeId}/billboard/${billboardId}/v1`,
		//             method: 'DELETE'
		//         }),
		//         invalidatesTags: ['Billboard']
		//     }),
		//     updateBillboard: build.mutation<Billboard, { storeId: string | string[], billboardId: string | string[],updatedData: {
		//         label: string;
		//         imageUrl: string;
		//         // Add other fields as needed
		//       } }>({
		//         query: ({ storeId, billboardId,updatedData }) => ({
		//             url: `/${storeId}/billboard/${billboardId}/v1`,
		//               method: 'PATCH',
		//             body: updatedData
		//         }),
		//         invalidatesTags: ['Billboard']
		//     }),
	}),
});

export const { useAddBusinessMutation } = businessApiSlice;
