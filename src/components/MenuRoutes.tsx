"use client";
import { usePathname, useRouter, useParams } from "next/navigation";
import { Menu } from "@/static-data/menu";
import Link from "next/link";

export default function SideBarMenu() {
	const activeRoute = usePathname();
	const router = useRouter();
	const params = useParams();
	// const OnNavigate = (url: string) => {
	// 	router.push({/store/${params?.storeId}$url});
	// };
	return (
		<nav className=" space-y-6 ">
			{Menu.map((routes) => (
				<div className="space-y-4 " key={ routes.id }>
					<div className="flex justify-start">
					<h3 className="cursor-pointer px-3 text-xs text-gray-300 uppercase dark:text-gray-400">
						{" "}
						{routes.label}{" "}
					</h3>
					</div>
					{routes.menu.map((route) => (
						<Link
							href={`/store/${params?.storeId}${route.path}`}
							className={`flex group items-center cursor-pointer px-6 py-2  transition-colors duration-100 transform rounded-lg  hover:shadow-md ${
								activeRoute === `/store/${params?.storeId}${route.path}`
									? "bg-gradient-to-r from-indigo-600 via-purple-800 to-indigo-600 dark:text-white"
									: "  hover:text-black grayscale dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-200 dark:hover:text-black "
							}    `}
							key={route.id}>
							<div className="">
								<route.icon className="w-5 h-5 " />
							</div>
							<h4
								className={` mx-3 text-sm font-normal capitalize ${
									activeRoute === `/store/${params?.storeId}${route.path}`
										? "text-white font-semibold group-hover:text-black"
										: "text-gray-400 dark:group-hover:text-black group-hover:text-black"
								}`}>
								{" "}
								{route.title}{" "}
							</h4>
						</Link>
					))}
				</div>
			))}
		</nav>
	);
}
