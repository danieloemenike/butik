'use client'
import React, { Suspense, useMemo, useState } from 'react'
import Heading from '@/components/StoreHeading';
import { useParams, useRouter } from 'next/navigation';
import Loader from '@/components/ui/Loader';
import Table from '@/components/ui/FormattedTable';
import { format } from "date-fns";
import columns from './TableCategories/columns';
import { Button } from '@/components/ui/button';
import { FcLandscape } from 'react-icons/fc';
import { useGetCategoriesQuery } from '@/reduxStore/services/categoryApiSlice';
import { ApiList } from '@/components/ui/api-list';


    
function CategoryPage() {
  const [loading, setLoading ] = useState(false)
    const { storeId } = useParams();
  const router = useRouter()
  
  const handleClick = () => {
    try {
    setLoading(true)
      router.push(`/store/${storeId}/categories/new`)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

 const{data = [], error, isLoading, isFetching, isSuccess, isUninitialized, isError} = useGetCategoriesQuery(`${storeId}`, { refetchOnMountOrArgChange: true } );

 const categoryData = data.length > 0 && typeof data != "undefined" && data != null && data.length != null 
 
  const FormattedCategoryData = data?.map((item) => ({
    id: item.id,
    name: item.name,
    createdAt:format(new Date(item.createdAt), 'MMMM do, yyyy'),
    updatedAt:  format(new Date(item.updatedAt), 'MMMM do, yyyy'),
    
  }))
  return (
      <main>
     
   
      
     <Heading title="Categories" subtitle="System Generated Available Store Categories " showButton = {false} text="Add New" handleClick={ handleClick } plusIcon />

      {
        isLoading || isUninitialized || isFetching
          ?
          ( <Loader />)
        :
         categoryData && isSuccess ?
            (
          <>
            <Suspense fallback={ <Loader /> }>
                  <Table data={ FormattedCategoryData } searchKey="name" columns={ columns } />
                  <ApiList entityName="categories" entityIdName="categoryId" />
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
                  <FcLandscape className="lg:text-[15rem] text-[5rem]" />
                </div>
                <h2 className='text-[23px] font-bold tracking-tight my-2'> Create Your Store's Category Image</h2>
                <p className='text-slate-600 tracking-wide font-semibold'>Create Categories for your store </p>
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

export default CategoryPage