import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { Product } from "@prisma/client"

type ProductAddType = {
  id?: string
  name: string
  slug?: string
  categoryId: string
  subcategoryId?: string
  price: number
  colorId: string
  sizeId: string
  sizeIds?: string[]
  images: { url: string }[]
  isFeatured?: boolean
  isArchived?: boolean
  productVariant?: Array<{
    colorId: string
    sizeId: string
    quantity: number | null
    price: number
    discountedPrice?: number
    images: { url: string }[]
  }>
}

type ProductData = {
  id: string
  name: string
  slug?: string | null
  price: string
  isFeatured: boolean
  isArchived: boolean
  createdAt: Date
  updatedAt?: Date
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
  productVariant?: Array<{
    size?: { name: string } | null
    color?: { name?: string; value?: string } | null
  }>
}

export const productApiSlice = createApi({
  reducerPath: "productApiSlice",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["product"],
  endpoints: (build) => ({
    addProduct: build.mutation<
      Product,
      { storeId: string | string[]; data: ProductAddType }
    >({
      query: ({ storeId, data }) => ({
        url: `/${storeId}/products/v1`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["product"],
    }),
    getProducts: build.query<ProductData[], string>({
      query: (storeId) => `/${storeId}/products/v1`,
      providesTags: ["product"],
    }),
    getProduct: build.query<
      Product,
      { storeId: string | string[]; productId: string | string[] }
    >({
      query: ({ storeId, productId }) =>
        `/${storeId}/products/${productId}/v1`,
      providesTags: ["product"],
    }),
    deleteProduct: build.mutation<
      Product,
      { storeId: string | string[]; productId: string | string[] }
    >({
      query: ({ storeId, productId }) => ({
        url: `/${storeId}/products/${productId}/v1`,
        method: "DELETE",
      }),
      invalidatesTags: ["product"],
    }),
    updateProduct: build.mutation<
      Product,
      {
        storeId: string | string[]
        productId: string | string[]
        updatedData: ProductAddType
      }
    >({
      query: ({ storeId, productId, updatedData }) => ({
        url: `/${storeId}/products/${productId}/v1`,
        method: "PATCH",
        body: updatedData,
      }),
      invalidatesTags: ["product"],
    }),
  }),
})

export const {
  useAddProductMutation,
  useGetProductsQuery,
  useGetProductQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
} = productApiSlice
