import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./features/sidebarSlice"
import { storeApi } from "./services/storeApiSlice";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import businessSliceReducer from './features/businessSlice';
import { billboardApiSlice } from "./services/billboardApiSlice";
import { categoryApiSlice } from "./services/categoryApiSlice";
import { sizeApiSlice } from "./services/sizeApiSlice";
import { colorApiSlice } from "./services/colorApiSlice";
import { productApiSlice } from "./services/productApiSlice";
import { businessApiSlice } from "./services/businessApiSlice";

const apiSlices = [storeApi.middleware, billboardApiSlice.middleware, categoryApiSlice.middleware,sizeApiSlice.middleware, colorApiSlice.middleware, productApiSlice.middleware,businessApiSlice.middleware]

export const store = configureStore({
    reducer: {
       business: businessSliceReducer,
        sidebar: sidebarReducer,
        [storeApi.reducerPath]: storeApi.reducer,
        [billboardApiSlice.reducerPath]: billboardApiSlice.reducer,
        [categoryApiSlice.reducerPath]: categoryApiSlice.reducer,
        [sizeApiSlice.reducerPath]: sizeApiSlice.reducer,
        [colorApiSlice.reducerPath]: colorApiSlice.reducer,
        [productApiSlice.reducerPath]: productApiSlice.reducer,
         [businessApiSlice.reducerPath]: businessApiSlice.reducer
    },
    devTools: process.env.NODE_ENV !== "production",
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(...apiSlices),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch