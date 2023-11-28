import Heading from '@/components/StoreHeading'
import React from 'react'
import { getProductCount } from '@/actions/getProductCount'
import { getTotalRevenue } from '@/actions/getTotalRevenue'
import { getSalesCount } from '@/actions/getSalesCount'
import { getGraphRevenue } from '@/actions/getGraphRevenue'
import { Card, CardHeader, CardTitle,CardContent } from '@/components/ui/card'
import { formatter } from '@/lib/utils';
import { FcPaid, FcPositiveDynamic } from 'react-icons/fc';
import { TbCurrencyNaira } from "react-icons/tb";
import ChartOverview from '@/components/ChartOverview';


type Props = {
  params : {
    storeId : string
  }
}

async function DashboardPage({ params }: Props) {
  const [totalRevenue, totalSalesCount, totalProducts, totalGraphRevenue] = await Promise.all([
    getTotalRevenue(params.storeId),
    getSalesCount(params.storeId),
    getProductCount(params.storeId),
    getGraphRevenue(params.storeId),
  ]);
  return (
    <section>
      <Heading title="Dashboard" subtitle='Overview of your store' showButton = {false} />
      <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className = "shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className ="font-medium text-sm">
                      Total Revenue
                      </CardTitle>
                      <TbCurrencyNaira className="text-muted-foreground" />
                    </CardHeader>
                     
                      <CardContent>
                          <div className="text-2xl font-bold">
                              {formatter.format(totalRevenue)}
                          </div>
                      </CardContent>
                      
                 
              </Card>
              <Card className = "shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className ="font-medium text-sm">
                      Sales
                      </CardTitle>
                      <FcPositiveDynamic className="text-muted-foreground" />
                    </CardHeader>
                     
                      <CardContent>
                          <div className="text-2xl font-bold">
                             {totalSalesCount}
                          </div>
                      </CardContent>
                      
                 
              </Card>
              <Card className = "shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className ="font-medium text-sm">
                     Products In Stock
                      </CardTitle>
                      <FcPaid className="text-muted-foreground" />
                    </CardHeader>
                     
                      <CardContent>
                          <div className="text-2xl font-bold">
                              {totalProducts}
                          </div>
                      </CardContent>
                      
                 
              </Card>
          </div>
          <Card className="col-span-4 mt-6 shadow-lg">
              <CardHeader>
                  <CardTitle className="tracking-tighter font-bond capitalize ">
                      Revenue Overview
                  </CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                  <ChartOverview data = {totalGraphRevenue}/>
              </CardContent>
          </Card>
    </>
    </section>
  )
}

export default DashboardPage