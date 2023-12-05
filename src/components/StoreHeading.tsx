import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Props = {
	title: string;
	subtitle: string;
	handleClick?: () => void;
	text?: string;
	showButton: boolean;
	plusIcon?: boolean;
};

function Heading({
	title,
	subtitle,
	handleClick,
	text,
	showButton,
	plusIcon,
}: Props) {
	return (
		<>
			<header className="flex items-center justify-between mt-6 mb-4 border-b-2 border-b-primary pb-3 px-4">
				<div>
					<h2 className="text-[23px] font-bold tracking-tighter capitalize"> {title} </h2>
					<p className="hidden md:block text-[16px] text-muted-foreground"> {subtitle}</p>
				</div>
				{showButton && (
					<Button onClick={handleClick} variant="default">
						{text}
						{plusIcon && <Plus className="mr-2 h-4 w-4" />}
					</Button>
				)}
			</header>
		</>
	);
}

export default Heading;
