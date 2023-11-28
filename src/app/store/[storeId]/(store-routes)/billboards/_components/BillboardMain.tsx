'use client'
import React, { Suspense, useMemo, useState } from 'react'
import Heading from '@/components/StoreHeading';
import { useParams, useRouter } from 'next/navigation';
import { useGetBillboardsQuery } from '@/reduxStore/services/billboardApiSlice';
import { Dna } from "react-loader-spinner";
import type { Billboard } from '@prisma/client';
import FormattedTable from '@/components/ui/FormattedTable';
import { format } from "date-fns";
import columns from './billboards/columns';
import { Button } from '@/components/ui/button';
import { FcAddImage } from 'react-icons/fc';
// import BillboardShimmer from './BillboardShimmer';
import { ApiList } from '@/components/ui/api-list';
import Image from 'next/image';



function BillboardMain() {
  const [loading, setLoading ] = useState(false)
    const { storeId } = useParams();
    const router = useRouter()
  const handleClick = () => {
    try {
    setLoading(true)
      router.push(`/store/${storeId}/billboards/new`)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

 const{data = [], error, isLoading, isFetching, isSuccess, isUninitialized, isError} = useGetBillboardsQuery(`${storeId}`, { refetchOnMountOrArgChange: true } );
 
 const billboardData = data.length > 0 && typeof data != "undefined" && data != null && data.length != null 
  
  const FormattedBillboardData = data?.map((item) => ({
    id: item.id,
    label: item.label,
    imageUrl: item.imageUrl,
    promotionText: item?.promotionText,
    promotionImageUrl: item?.promotionImageUrl,
    createdAt:format(new Date(item.createdAt), 'MMMM do, yyyy'),
    updatedAt:  format(new Date(item.updatedAt), 'MMMM do, yyyy'),
    storeId: item.storeId
  }))
  return (
      <main>
     
   
      
     <Heading title="Billboards" subtitle="Manage your billboards here" showButton text="Add New" handleClick={ handleClick } plusIcon />

      {
        isLoading || isUninitialized || isFetching
          ?
          ( <Dna />)
        :
          billboardData && isSuccess ?
            (
          <>
           
                  <FormattedTable data={ FormattedBillboardData } searchKey="label" columns={ columns } />
                  <ApiList entityName="billboards" entityIdName="billboardId" />
         
          </>
        )
          :
          isError ?
        
            (
              <>
                <div>
                  <p> An Error has occurred, please refetch this page  </p>
               
                </div>
  
  
              </>
            )
        
        
            :

            
            (
             <>
					<section className="grid grid-cols-2 h-[50dvh] w-[100%]  my-auto space-y-4 gap-9  ">
						<div className="flex flex-col h-[100%] justify-center items-start space-y-2 ">
							<h2 className="text-[24px] font-bold tracking-tight">
								{" "}
								Create Your Store's First Billboard Image{" "}
							</h2>

							<p className="text-muted-foreground capitalize ">
								Welcome Your customers with beautiful display banners{" "}
							</p>
							<Button className="" onClick={handleClick} disabled={loading}>
						{loading ? "Processing.." : "Get Started Now"}		
							</Button> 
						</div>
						{/* <FcShop className="lg:text-[15rem] text-[5rem]" /> */}
						<div className="h-[100%] flex items-center">
							<Image
								src="/building.svg"
								width={450}
								height={450}
								alt="Empty Store"
							/>
						</div>
					</section>
				</>
            )
    
      }
         { error && (
        <>
        <div>
          <p> An Error has occurred, please refetch this page  </p>
             
        </div>


        </>
      )}
 
    </main>
  )
}

export default BillboardMain