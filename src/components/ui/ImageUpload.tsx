"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import {
	CldUploadWidget,
	type CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { ImagePlus, Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type ImageUploadProps = {
	disabled?: boolean;
	onChange: (value: string) => void;
	onRemove: (value: string) => void;
	value: string[];
};

function ImageUpload({
	disabled,
	onChange,
	onRemove,
	value,
}: ImageUploadProps) {
	const [isMounted, setIsMounted] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const handleSuccess = (result: CloudinaryUploadWidgetResults) => {
		const info = result.info;
		if (!info || typeof info === "string" || !info.secure_url) {
			toast({
				variant: "destructive",
				title: "Upload failed",
				description: "Could not read the uploaded image URL. Try another file.",
			});
			return;
		}

		// Normalize delivery so AVIF/HEIC previews and storefront images render.
		onChange(withCloudinaryTransforms(info.secure_url));
	};

	if (!isMounted) {
		return null;
	}

	return (
		<div>
			<div className="mb-4 flex items-center gap-4">
				{value?.map((url) => (
					<div
						key={url}
						className="relative h-[200px] w-[200px] overflow-hidden rounded-md">
						<div className="absolute right-2 top-2 z-10">
							<Button
								type="button"
								onClick={() => onRemove(url)}
								variant="destructive"
								size="sm">
								<Trash className="h-4 w-4" />
							</Button>
						</div>
						<Image
							fill
							className="object-cover"
							alt="Image"
							src={withCloudinaryTransforms(url)}
							sizes="200px"
						/>
					</div>
				))}
			</div>
			<CldUploadWidget
				onSuccess={handleSuccess}
				onError={(error) => {
					const description =
						typeof error === "string"
							? error
							: error?.statusText ||
								"This file type may not be allowed. Try JPG, PNG, WebP, or AVIF.";
					toast({
						variant: "destructive",
						title: "Upload failed",
						description,
					});
				}}
				uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET}
				options={{
					sources: ["local", "url", "camera"],
					resourceType: "image",
					clientAllowedFormats: [
						"jpg",
						"jpeg",
						"png",
						"webp",
						"avif",
						"gif",
						"heic",
						"heif",
					],
					maxFiles: 5,
				}}>
				{({ open }) => {
					const onClick = () => {
						open();
					};

					return (
						<Button
							type="button"
							disabled={disabled}
							variant="secondary"
							onClick={onClick}>
							<ImagePlus className="mr-2 h-4 w-4" />
							Upload an Image
						</Button>
					);
				}}
			</CldUploadWidget>
		</div>
	);
}

export default ImageUpload;
