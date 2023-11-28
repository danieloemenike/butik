import {createSlice } from "@reduxjs/toolkit"

interface sidebarState{
    isOpen: boolean
    userName : number
}

const initialState : sidebarState = {
    isOpen: true,
    userName: 5
}

const sidebarSlice = createSlice({
    name: 'sidebar',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.isOpen = !state.isOpen
        }
    }
})

export const { toggleSidebar } = sidebarSlice.actions;

export default sidebarSlice.reducer

