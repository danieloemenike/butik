import React from "react";

import {
	RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import Image from "next/image";
import { Button } from "@/components/ui/button";
type Props = {};

function Hero({}: Props) {
	return (
		<section className="grid md:grid-cols-2 grid-cols-1 h-[87dvh] container md:px-8 gap-2">
			<div className=" w-[100%] h-full ">
				<h1 className="md:text-[3rem] text-[2rem]  font-bold md:mt-[115px] tracking-tighter mt-[35px] md:tracking-loose text-black/90 dark:text-white">
					{" "}
					Your{" "}
					<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-black to-fuchsia-500 dark:bg-gradient-to-r dark:from-indigo-500 dark:to-fuchsia-500">
						{" "}
						E-Commerce{" "}
					</span>{" "}
					Success Partner
				</h1>
				<div className=" pr-4">
					<p className="text-muted-foreground dark:text-slate-300 mt-[15px] md:text-lg text-sm leading-loose p-1 ">
						Here in butik, we empower businesses of all sizes to thrive in the
						digital marketplace. From{" "}
						<span className="underline decoration-indigo-600 underline-offset-4">
							customizable storefronts{" "}
						</span>{" "}
						to secure payment processing and powerful analytics. Join thousands
						of entrepreneurs and experience the future of e-commerce today.
					</p>
				</div>

				<div className="md:mt-[15px] mt-[7px] w-fit flex items-center">
					<Button className="rounded shadow-2xl bg-primary">
					
					
					<RegisterLink>
						<h2 className=" font-bold mr-[4px] text-primary-foreground ">
							{" "}
							Explore butik{" "}
						</h2>
						</RegisterLink>
						</Button>
				</div>
			</div>

			<div className=" h-[100%]  md:w-[90%] flex items-center justify-center">
				<Image
					src="/webshop.svg"
					alt="ecommerce image"
					className="object-contain"
					priority
					width={500}
					height={500}
					
				/>
			</div>
		</section>
	);
}

export default Hero;
