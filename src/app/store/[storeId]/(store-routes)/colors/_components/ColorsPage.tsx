'use client'
import React, { Suspense, useMemo, useState } from 'react'

import { useParams, useRouter } from 'next/navigation';
import Loader from '@/components/ui/Loader';
import Table from '@/components/ui/FormattedTable';
import { format } from "date-fns";
import columns from './TableColors/columns';
import { Button } from '@/components/ui/button';
import { FcNumericalSorting12 } from 'react-icons/fc';
import { useGetColorsQuery } from '@/reduxStore/services/colorApiSlice';
import Heading from '@/components/StoreHeading';



function colorsPage() {
  const [loading, setLoading ] = useState(false)
    const { storeId } = useParams();
  const router = useRouter()
  
  const handleClick = () => {
    try {
    setLoading(true)
      router.push(`/store/${storeId}/colors/new`)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

 const{data = [], error, isLoading, isFetching, isSuccess, isUninitialized, isError} = useGetColorsQuery(`${storeId}`, { refetchOnMountOrArgChange: true } );
 
 const colorData = data.length > 0 && typeof data != "undefined" && data != null && data.length != null 
 
  const FormattedColorData = data?.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
    // createdAt:format(new Date(item.createdAt), 'MMMM do, yyyy'),
    // updatedAt:  format(new Date(item.updatedAt), 'MMMM do, yyyy'),
   
  }))

  return (
      <main>
     
   
      
     <Heading title="Colors" subtitle="Unique Products Colors" showButton text="Add New" handleClick={ handleClick } plusIcon />

      {
        isLoading || isUninitialized || isFetching
          ?
          ( <Loader />)
        :
         colorData && isSuccess ?
            (
          <>
            <Suspense fallback={ <Loader /> }>
              <Table data={ FormattedColorData } searchKey="name" columns={ columns } />
            </Suspense>
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
              <section className='flex flex-col items-center justify-center h-[70%] w-[70%] mx-auto mt-[2rem] mb-[7rem]  my-auto bg-white/10 rounded-xl shadow-md p-4'>
                <div>
                  <FcNumericalSorting12 className="lg:text-[15rem] text-[5rem]" />
                </div>
                <h2 className='text-[23px] font-bold tracking-tight my-2'> Create and Manage Your Product Colors </h2>
                <p className='text-slate-600 tracking-wide font-semibold'>Create Unique Colors for your store </p>
                <Button className="bg-black mt-[2rem] text-white" onClick={ handleClick } disabled={ loading }> Get Started </Button>
                
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

export default colorsPage