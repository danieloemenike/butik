"use client"
import { Dna } from "react-loader-spinner";

export default function Loading() {
    // You can add any UI inside Loading, including a Skeleton.
    return (
        <div className = "h-[70dvh] flex items-center justify-center">
        <Dna
            visible={true}
            height="180"
            width="180"
            ariaLabel="dna-loading"
            wrapperStyle={{}}
            wrapperClass="dna-wrapper"
        />
</div>
    )
  }