"use client";
import React, { Suspense, useMemo, useState } from "react";

import { useParams, useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import Table from "@/components/ui/FormattedTable";
import { format } from "date-fns";
import columns from "./TableCategories/columns";
import { Button } from "@/components/ui/button";
import { FcLandscape } from "react-icons/fc";
import { useGetProductsQuery } from "@/reduxStore/services/productApiSlice";
import { formatter } from "@/lib/utils";
import { ApiList } from "@/components/ui/api-list";
import Heading from "@/components/StoreHeading";
import { useToast } from "@/components/ui/use-toast";
import Image from 'next/image';


function ProductPage() {
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);
	const { storeId } = useParams();
	const router = useRouter();

	const handleClick = () => {
		try {
			setLoading(true);
			router.push(`/store/${storeId}/products/new`);
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	const {
		data = [],
		error,
		isLoading,
		isFetching,
		isSuccess,
		isUninitialized,
		isError,
	} = useGetProductsQuery(`${storeId}`, { refetchOnMountOrArgChange: true });

	const productData =
		data.length > 0 &&
		typeof data != "undefined" &&
		data != null &&
		data.length != null;

	const formattedProducts = data?.map((item) => ({
		id: item.id,
		name: item.name,
		isFeatured: item.isFeatured,
		isArchived: item.isArchived,
		price: formatter.format(Number(item.price)),
		category: item.category.name,
		size: item.size.name,
		color: item.color.value,
		createdAt: format(new Date(item.createdAt), "MMMM do, yyyy"),
		image: item.images[0].url
	}));

	return (
		<main>
			<Heading
				title="Products"
				subtitle="Manage your store Products here"
				showButton
				text="Add New"
				handleClick={handleClick}
				plusIcon
			/>

			{isLoading || isUninitialized || isFetching ? (
				<Loader />
			) : productData && isSuccess ? (
				<>
					<Suspense fallback={<Loader />}>
						<Table
							data={formattedProducts}
							searchKey="name"
							columns={columns}
						/>
						<ApiList entityName="products" entityIdName="productId" />
					</Suspense>
				</>
			) : isError ? (
				<>
					<div>
                <p> An Error has occurred, please refetch this page </p>
                <>
                  {
                    toast({
							variant: "destructive",
							title: "Uh oh! Something went wrong.",
							description: "There was a problem with your request.",
						})}
                </>
			
					</div>
				</>
			) :  (
        <>
     <section className="grid grid-cols-1 md:grid-cols-2 h-[50dvh] w-[100%]  my-auto space-y-4 gap-9 px-4 pt-4  ">
       <div className="flex flex-col h-[100%] justify-center items-start  md:space-y-2 space-y-5 ">
         <h2 className="text-[24px] font-bold tracking-tight">
           {" "}
           Create Your First Store Product{" "}
         </h2>

         <p className="text-muted-foreground capitalize ">
           Start Selling Your Products Today{" "}
         </p>
         <Button className="" onClick={handleClick} disabled={loading}>
       {loading ? "Processing.." : "Create First Product"}		
         </Button> 
       </div>
       {/* <FcShop className="lg:text-[15rem] text-[5rem]" /> */}
       <div className="h-[100%] flex items-center">
         <Image
           src="/product.svg"
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

export default ProductPage;
