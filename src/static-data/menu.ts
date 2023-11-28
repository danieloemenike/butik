import { FcHome, FcSms,FcSettings, FcPaid,FcDoughnutChart,FcMusic,FcVideoCall,FcPlus,FcAddImage, FcMms, FcFilledFilter, FcCloth } from "react-icons/fc";

export const Menu = [
    {
        id: "1",
        label: "Overview",
        menu: [
            {
                id: "1",
                title: 'Dashboard',
                path: '/dashboard',
                pro: false,
                icon: FcHome,
                color: "#292929"
            },
        ]
    },
    {
        id: "2",
        label: "Catalog",
        menu: [
            {
                id: "1",
                title: 'Products',
                path: '/products',
                pro: true,
                icon: FcPaid,
                color: "#292929"
            },
           
           
        ]
    },
     {
        id: "3",
        label: "Images",
        menu: [
            {
                id: "1",
                title: 'Billboards',
                path: '/billboards',
                pro: false,
                icon: FcMms,
                color: "#292929"
            },
           
           
        ]
    },
    {
        id: "4",
        label: "Attributes",
        menu: [
    
           
            {
                id: "1",
                title: 'Categories',
                path: '/categories',
                pro: false,
                icon: FcFilledFilter,
                color: "#292929"
            },
            {
                id: "2",
                title: 'Colors',
                path: '/colors',
                pro: false,
                icon: FcDoughnutChart,
                color: "#292929"
            },
            {
                id: "3",
                title: 'Sizes',
                path: '/sizes',
                pro: false,
                icon: FcCloth,
                color: "#292929"
            },
          
        ]
    },
    // {
    //     id: "5",
    //     label: "Customization",
    //     menu: [
    //         {
    //             id: "1",
    //             title: 'Settings',
    //             path: '/settings',
    //             pro: false,
    //             icon: FcSettings,
    //             color: "#292929"
    //         },
    //     ]
    // }
   
   
  
   
    // {
    //     id: "7",
    //     title: 'Delivery',
    //     path: 'delivery',
    //     icon: FcShipped,
    //     color: "#292929"
    // },
    // {
    //     id: "8",
    //     title: 'Support',
    //     path: 'support',
    //     icon: FcCustomerSupport,
    //     color: "#292929"
    // },

]