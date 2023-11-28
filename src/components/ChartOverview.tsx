"use client"
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import React from 'react'

type Props = {
    data : any[]
}

function ChartOverview({data}: Props) {
  return (
    <ResponsiveContainer width="100%" height={400}>
         <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          barSize={20}
          >
             
              <XAxis dataKey="name" scale="point" padding={{ left: 10, right: 10 }}/>
          <YAxis />
          <Tooltip />
          <Legend />
          <CartesianGrid strokeDasharray="3 3" />
          <Bar dataKey="total" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
          {/* <Bar dataKey="uv" fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />} /> */}
        
        </BarChart>
        </ResponsiveContainer>
  )
}

export default ChartOverview