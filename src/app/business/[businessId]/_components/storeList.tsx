"use client";

import { useGetStoresQuery } from "@/reduxStore/services/storeApiSlice";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { FcAddImage } from "react-icons/fc";
import { FcShop } from "react-icons/fc";
import { useState } from "react";
import columns from "./Table/columns";
import FormattedTable from "@/components/ui/FormattedTable";
import { useToast } from "@/components/ui/use-toast";
import Skeleton from "react-loading-skeleton";
import Image from "next/image";
import { Dna } from "react-loader-spinner";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Link from "next/link";

function StoreList() {
	const { user } = useKindeBrowserClient();

	const [loading, setLoading] = useState(false);
	const { toast } = useToast();
	const router = useRouter();
	const params = useParams();
	const {
		data = [],
		error,
		isLoading,
		isFetching,
		isUninitialized,
		isSuccess,
		isError,
	} = useGetStoresQuery(`${params.businessId}`, {
		refetchOnMountOrArgChange: true,
	});

	const storeData =
		data.length > 0 &&
		typeof data != "undefined" &&
		data != null &&
		data.length != null;

	const FormattedStoreData = data?.map((item) => ({
		id: item.id,
		name: item.name,
		address: item.address,
		phoneNumber: item.phoneNumber,
		city: item.city,
		country: item.country,
		createdAt: format(new Date(item.createdAt), "MMMM do, yyyy"),
		updatedAt: format(new Date(item.updatedAt), "MMMM do, yyyy"),
	}));

	const handleClick = () => {
		try {
			setLoading(true);
			router.push(` /business/${params.businessId}/new-store`);
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Uh oh! Something went wrong.",
				description: "There was a problem with your request.",
			});
		} finally {
			setLoading(false);
		}
	};
	return (
		<main className="">
			{isLoading || isUninitialized || isFetching ? (
				<div className="h-[70dvh] flex items-center justify-center">
					<Dna
						visible={true}
						height="180"
						width="180"
						ariaLabel="dna-loading"
						wrapperStyle={{}}
						wrapperClass="dna-wrapper"
					/>
				</div>
			) : storeData && isSuccess ? (
				<>
					<header className="flex justify-between w-full items-center h-14 ">
							<h1 className="text-[23px] font-bold tracking-tighter"> Stores </h1>
							<Button>
							<Link href={` /business/${params.businessId}/new-store`}>
							{" "}
							Create New Store
						</Link>
							</Button>
						
					</header>
					<FormattedTable
						data={FormattedStoreData}
						searchKey="name"
						columns={columns}
					/>
				</>
			) : isError ? (
				<>
					<div>
						<p> An Error has occurred, please refetch this page </p>
					</div>
				</>
			) : (
				<>
					<section className="grid md:grid-cols-2 grid-cols-1 h-[80dvh] w-[100%]  my-auto space-y-4 gap-9 container ">
						<div className="flex flex-col h-[100%] justify-center items-start md:space-y-4 space-y-8 mt-10">
							<h2 className="text-[24px] font-bold tracking-tight">
								{" "}
								Congrats {user?.given_name}! Your Business Has Been Registered.{" "}
							</h2>

							<h2 className="text-[18px] ">
								Let's Create Your First Store & Start Selling Today{" "}
							</h2>
							<Button className="" onClick={handleClick} disabled={loading}>
								{loading ? "Processing.." : "Get Started Now"}
							</Button>
						</div>
						{/* <FcShop className="lg:text-[15rem] text-[5rem]" /> */}
						<div className="h-[100%] flex items-center md:w-[90%] justify-center">
							<Image
								src="/store.svg"
								width={550}
								height={550}
								alt="Empty Store"
							/>
						</div>
					</section>
				</>
			)}
			{error && (
				<>
					<div>
						<p> An Error has occurred, please refetch this page </p>
					</div>
				</>
			)}
		</main>
	);
}

export default StoreList;
