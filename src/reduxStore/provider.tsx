'use client'

import { Provider } from "react-redux"
import { store } from "./store"

type Props = { 
    children : React.ReactNode
}
export function Providers({ children }: Props) {
    return  <Provider store={store}>
            {children}
            </Provider>   
       
    
}