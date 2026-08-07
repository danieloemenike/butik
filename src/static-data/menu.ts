import {
  Home,
  ImageIcon,
  Package,
  Palette,
  Ruler,
  Tags,
} from "lucide-react"

export const Menu = [
  {
    id: "1",
    label: "Overview",
    menu: [
      {
        id: "1",
        title: "Dashboard",
        path: "/dashboard",
        pro: false,
        icon: Home,
      },
    ],
  },
  {
    id: "2",
    label: "Catalog",
    menu: [
      {
        id: "1",
        title: "Products",
        path: "/products",
        pro: true,
        icon: Package,
      },
    ],
  },
  {
    id: "3",
    label: "Images",
    menu: [
      {
        id: "1",
        title: "Billboards",
        path: "/billboards",
        pro: false,
        icon: ImageIcon,
      },
    ],
  },
  {
    id: "4",
    label: "Attributes",
    menu: [
      {
        id: "1",
        title: "Categories",
        path: "/categories",
        pro: false,
        icon: Tags,
      },
      {
        id: "2",
        title: "Colors",
        path: "/colors",
        pro: false,
        icon: Palette,
      },
      {
        id: "3",
        title: "Sizes",
        path: "/sizes",
        pro: false,
        icon: Ruler,
      },
    ],
  },
]
