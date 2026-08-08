"use client";

import * as z from "zod";
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useParams, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import ImageUpload from "@/components/ui/ImageUpload";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetColorsQuery } from "@/reduxStore/services/colorApiSlice";
import { useGetSizesQuery } from "@/reduxStore/services/sizeApiSlice";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { slugifyStoreName } from "@/lib/store-form";
import { isValidProductSlug } from "@/lib/store-identity";
import { buildSizeVariants } from "@/lib/commerce/product-variants";
import { normalizeCurrencyCode } from "@/lib/currency";

const variantSchema = z.object({
	colorId: z.string().min(1),
	sizeId: z.string().min(1),
	quantity: z.coerce.number().int().min(0),
	price: z.coerce.number().min(1),
	discountedPrice: z.coerce.number().optional(),
	images: z
		.object({ url: z.string() })
		.array()
		.refine((data) => data.length > 0, {
			message: "Product variant image is required",
		}),
});

const formSchema = z.object({
	name: z.string().min(1).max(50),
	slug: z
		.string()
		.min(1, { message: "Slug is required" })
		.refine((value) => isValidProductSlug(value), {
			message:
				"Use lowercase letters, numbers, and underscores (e.g. air_jordan_13).",
		}),
	description: z
		.string()
		.min(10)
		.max(500)
		.refine((data) => data.trim().split(/\s+/).length >= 10, {
			message: "Description must have at least 10 words.",
		}),
	images: z
		.object({ url: z.string() })
		.array()
		.refine((data) => data.length > 0, {
			message: "Image is required",
		}),
	productVariant: variantSchema.array(),
	quantity: z.coerce.number().int().min(0),
	price: z.coerce.number().min(1),
	discountedPrice: z.coerce.number().optional(),
	categoryId: z.string().min(1),
	subcategoryId: z.string().min(1),
	colorId: z.string().min(1),
	sizeIds: z.array(z.string()).min(1, { message: "Select at least one size" }),
	isFeatured: z.boolean().default(false).optional(),
	isArchived: z.boolean().default(false).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

type CategoryOption = {
	id: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
	subcategories: {
		id: string;
		name: string;
		createdAt: Date;
		updatedAt: Date;
		categoryId: string;
	}[];
};

export type ProductFormInitialData = {
	id: string;
	name: string;
	slug: string | null;
	description: string | null;
	price: number | string;
	discountedPrice?: number | string | null;
	quantity?: number | string | null;
	categoryId: string;
	subcategoryId: string;
	colorId: string;
	sizeId: string;
	isFeatured: boolean;
	isArchived: boolean;
	images: { url: string }[];
	productVariant?: Array<{
		colorId: string;
		sizeId: string;
		quantity: number | null;
		price: number | string;
		discountedPrice?: number | string | null;
		images: { url: string }[];
	}>;
};

type ProductProps = {
	categories: CategoryOption[];
	initialData?: ProductFormInitialData | null;
	storeCurrency?: string;
};

function toNumber(value: number | string | null | undefined, fallback = 0) {
	if (value == null || value === "") return fallback;
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
}

export const ProductForm = ({
	categories,
	initialData = null,
	storeCurrency = "NGN",
}: ProductProps) => {
	const { toast } = useToast();
	const params = useParams();
	const storeId = String(params.storeId ?? "");
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const currencyCode = normalizeCurrencyCode(storeCurrency);
	const isEditing = Boolean(initialData?.id);

	const { data: colors = [] } = useGetColorsQuery(storeId, {
		refetchOnMountOrArgChange: true,
	});

	const { data: sizes = [] } = useGetSizesQuery(storeId, {
		refetchOnMountOrArgChange: true,
	});

	const initialSizeIds = useMemo(() => {
		if (!initialData) return [] as string[];
		const ids = new Set<string>();
		if (initialData.sizeId) ids.add(initialData.sizeId);
		for (const variant of initialData.productVariant ?? []) {
			if (variant.sizeId) ids.add(variant.sizeId);
		}
		return [...ids];
	}, [initialData]);

	const defaultValues: ProductFormValues = {
		name: initialData?.name ?? "",
		slug: initialData?.slug ?? "",
		description: initialData?.description ?? "",
		images: initialData?.images ?? [],
		quantity: toNumber(initialData?.quantity, 0),
		productVariant: (initialData?.productVariant ?? []).map((variant) => ({
			colorId: variant.colorId,
			sizeId: variant.sizeId,
			quantity: toNumber(variant.quantity, 0),
			price: toNumber(variant.price, 0),
			discountedPrice: variant.discountedPrice
				? toNumber(variant.discountedPrice)
				: undefined,
			images: variant.images ?? [],
		})),
		price: toNumber(initialData?.price, 0),
		discountedPrice: initialData?.discountedPrice
			? toNumber(initialData.discountedPrice)
			: undefined,
		categoryId: initialData?.categoryId ?? "",
		subcategoryId: initialData?.subcategoryId ?? "",
		colorId: initialData?.colorId ?? "",
		sizeIds: initialSizeIds,
		isFeatured: initialData?.isFeatured ?? false,
		isArchived: initialData?.isArchived ?? false,
	};

	const form = useForm<ProductFormValues>({
		resolver: zodResolver(formSchema) as Resolver<ProductFormValues>,
		defaultValues,
	});

	const productName = useWatch({ control: form.control, name: "name" });
	const lastAutoSlug = useRef(
		slugifyStoreName(initialData?.name ?? "") || (initialData?.slug ?? "")
	);

	useEffect(() => {
		const next = slugifyStoreName(productName ?? "");
		if (!next) return;
		const current = form.getValues("slug");
		if (!current || current === lastAutoSlug.current) {
			form.setValue("slug", next, { shouldValidate: true });
			lastAutoSlug.current = next;
		}
	}, [productName, form]);

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "productVariant",
	});

	const addProductVariant = () => {
		append({
			colorId: "",
			sizeId: "",
			quantity: 0,
			price: 0,
			images: [],
		});
	};

	const [selectedCategory, setSelectedCategory] = useState(
		initialData?.categoryId ?? ""
	);
	const [filteredSubcategories, setFilteredSubcategories] = useState<
		CategoryOption["subcategories"]
	>([]);

	useEffect(() => {
		if (selectedCategory) {
			const selectedCategoryData = categories?.find(
				(category) => category.id === selectedCategory
			);
			setFilteredSubcategories(selectedCategoryData?.subcategories || []);
		} else {
			setFilteredSubcategories(
				categories.flatMap((category) => category.subcategories || [])
			);
		}
	}, [selectedCategory, categories]);

	const onSubmit = async (data: ProductFormValues) => {
		setLoading(true);
		try {
			const sizeId = data.sizeIds[0];
			if (!sizeId) {
				toast({
					variant: "destructive",
					title: "Size required",
					description: "Select at least one size.",
				});
				return;
			}

			const productVariant = buildSizeVariants({
				sizeIds: data.sizeIds,
				colorId: data.colorId,
				price: data.price,
				discountedPrice: data.discountedPrice,
				quantity: data.quantity,
				images: data.images,
				manualVariants: data.productVariant,
			});

			const payload = {
				name: data.name,
				slug: data.slug,
				description: data.description,
				images: data.images,
				quantity: data.quantity,
				price: data.price,
				discountedPrice: data.discountedPrice,
				categoryId: data.categoryId,
				subcategoryId: data.subcategoryId,
				colorId: data.colorId,
				sizeId,
				sizeIds: data.sizeIds,
				productVariant,
				isFeatured: data.isFeatured,
				isArchived: data.isArchived,
			};

			if (isEditing && initialData) {
				await axios.patch(
					`/api/${storeId}/products/${initialData.id}/v1`,
					payload
				);
				toast({
					description: "Your product has been updated successfully.",
				});
			} else {
				await axios.post(`/api/${storeId}/products/v1`, payload);
				toast({
					description: "Your product has been created successfully.",
				});
			}
			router.push(`/store/${storeId}/products`);
			router.refresh();
		} catch (error) {
			let message = "There was a problem with your request."
			if (axios.isAxiosError(error)) {
				const data = error.response?.data
				if (typeof data === "string" && data.trim()) {
					message = data
				} else if (
					data &&
					typeof data === "object" &&
					"message" in data &&
					typeof (data as { message: unknown }).message === "string"
				) {
					message = (data as { message: string }).message
				}
			}
			toast({
				variant: "destructive",
				title: "Uh oh! Something went wrong.",
				description: message,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="w-full space-y-8">
				<div className="gap-12 md:grid md:grid-cols-3">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Product Name</FormLabel>
								<FormControl>
									<Input
										disabled={loading}
										placeholder="Product name"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="slug"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Product URL slug</FormLabel>
								<FormControl>
									<Input
										disabled={loading}
										placeholder="air_jordan_13"
										{...field}
										onChange={(event) => {
											const next = slugifyStoreName(event.target.value);
											lastAutoSlug.current = next;
											field.onChange(next);
										}}
									/>
								</FormControl>
								<FormDescription>
									Lowercase letters, numbers, and underscores only.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="quantity"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Quantity</FormLabel>
								<FormControl>
									<Input
										type="number"
										disabled={loading}
										placeholder="e.g. 12 (whole units)"
										{...field}
									/>
								</FormControl>
								<FormDescription className="capitalize">
									Whole units in stock. Use 0 when sold out.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="col-span-2 min-h-[70px]">
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Tell us a little bit about your product"
											className="h-[180px] max-w-full resize-y"
											disabled={loading}
											{...field}
										/>
									</FormControl>
									<FormDescription className="capitalize">
										What is your product all about. Please write a descriptive
										text about it.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="price"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Price</FormLabel>
								<FormControl>
									<div className="flex gap-2">
										<Input
											type="number"
											disabled={loading}
											placeholder="9.99"
											className="flex-1"
											{...field}
										/>
										<div className="flex min-w-20 items-center justify-center rounded-md border border-input bg-muted px-3 text-sm font-medium text-muted-foreground">
											{currencyCode}
										</div>
									</div>
								</FormControl>
								<FormDescription>
									Selling price in {currencyCode}. Change store currency in
									Settings.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="discountedPrice"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Discounted Price</FormLabel>
								<FormControl>
									<div className="flex gap-2">
										<Input
											type="number"
											disabled={loading}
											placeholder="9.99"
											className="flex-1"
											{...field}
										/>
										<div className="flex min-w-20 items-center justify-center rounded-md border border-input bg-muted px-3 text-sm font-medium text-muted-foreground">
											{currencyCode}
										</div>
									</div>
								</FormControl>
								<FormDescription className="capitalize">
									Optional discount price ({currencyCode}).
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="categoryId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Category</FormLabel>
								<Select
									disabled={loading}
									onValueChange={(value) => {
										field.onChange(value);
										setSelectedCategory(value);
										form.setValue("subcategoryId", "");
									}}
									value={field.value}
									defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a category" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{categories?.map((category) => (
											<SelectItem key={category.id} value={category.id}>
												{category.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="subcategoryId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>SubCategory</FormLabel>
								<Select
									disabled={loading}
									onValueChange={field.onChange}
									value={field.value}
									defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a SubCategory" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{filteredSubcategories?.map((subcategory) => (
											<SelectItem key={subcategory.id} value={subcategory.id}>
												{subcategory.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="sizeIds"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Sizes</FormLabel>
								<FormDescription>
									Select every size this product ships in. Multiple sizes become
									shopper options automatically.
								</FormDescription>
								<div className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-md border border-input p-3">
									{sizes.length === 0 ? (
										<p className="text-sm text-muted-foreground">
											No sizes yet. Create sizes for this store first.
										</p>
									) : (
										sizes.map((size) => {
											const checked = field.value.includes(size.id);
											return (
												<label
													key={size.id}
													className="flex cursor-pointer items-center gap-2 text-sm">
													<Checkbox
														disabled={loading}
														checked={checked}
														onCheckedChange={(value) => {
															const next = value
																? [...field.value, size.id]
																: field.value.filter((id) => id !== size.id);
															field.onChange(next);
														}}
													/>
													<span>
														{size.name}
														{size.value ? (
															<span className="text-muted-foreground">
																{" "}
																({size.value})
															</span>
														) : null}
													</span>
												</label>
											);
										})
									)}
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="colorId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Color</FormLabel>
								<Select
									disabled={loading}
									onValueChange={field.onChange}
									value={field.value}
									defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a color" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{colors.map((color) => (
											<SelectItem key={color.id} value={color.id}>
												{color.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="images"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Images</FormLabel>
							<FormControl>
								<ImageUpload
									value={field.value.map((image) => image.url)}
									disabled={loading}
									onChange={(url) =>
										field.onChange([...field.value, { url }])
									}
									onRemove={(url) =>
										field.onChange([
											...field.value.filter((current) => current.url !== url),
										])
									}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex flex-col">
					<h2 className="text-lg font-semibold">Product Variants</h2>
					<p className="capitalize text-muted-foreground">
						Optional. Use this for extra color or price combinations beyond the
						selected sizes.
					</p>
				</div>

				{fields.map((variant, index) => (
					<div key={variant.id} className="space-y-4">
						<Separator />
						<Button
							type="button"
							onClick={() => remove(index)}
							variant="destructive"
							className="shadow-lg">
							Remove Variant
						</Button>
						<div className="gap-8 md:grid md:grid-cols-3">
							<FormField
								control={form.control}
								name={`productVariant.${index}.colorId` as const}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Color</FormLabel>
										<Select
											disabled={loading}
											onValueChange={field.onChange}
											value={field.value}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a color" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{colors.map((color) => (
													<SelectItem key={color.id} value={color.id}>
														{color.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={`productVariant.${index}.sizeId` as const}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Size</FormLabel>
										<Select
											disabled={loading}
											onValueChange={field.onChange}
											value={field.value}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a size" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{sizes.map((size) => (
													<SelectItem key={size.id} value={size.id}>
														{size.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={`productVariant.${index}.quantity` as const}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Quantity</FormLabel>
										<FormControl>
											<Input
												type="number"
												disabled={loading}
												placeholder="0"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={`productVariant.${index}.price` as const}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Price ({currencyCode})</FormLabel>
										<FormControl>
											<Input
												type="number"
												disabled={loading}
												placeholder="9.99"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={`productVariant.${index}.discountedPrice` as const}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Discounted Price</FormLabel>
										<FormControl>
											<Input
												type="number"
												disabled={loading}
												placeholder="9.99"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<br />
							<FormField
								control={form.control}
								name={`productVariant.${index}.images` as const}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Images</FormLabel>
										<FormControl>
											<ImageUpload
												value={field.value.map((image) => image.url)}
												disabled={loading}
												onChange={(url) =>
													field.onChange([...field.value, { url }])
												}
												onRemove={(url) =>
													field.onChange([
														...field.value.filter(
															(current) => current.url !== url
														),
													])
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
				))}

				<div className="flex items-center">
					<Button
						type="button"
						onClick={addProductVariant}
						className="shadow-lg">
						Add Product Variants +
					</Button>
				</div>

				<Separator />
				<div className="gap-8 md:grid md:grid-cols-3">
					<FormField
						control={form.control}
						name="isFeatured"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
								<FormControl>
									<Checkbox
										disabled={loading}
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>Featured</FormLabel>
									<FormDescription>
										This product will appear on the home page
									</FormDescription>
								</div>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="isArchived"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>Archived</FormLabel>
									<FormDescription>
										This product will not appear anywhere in the store.
									</FormDescription>
								</div>
							</FormItem>
						)}
					/>
				</div>
				<Button disabled={loading} className="ml-auto" type="submit">
					{loading
						? "Processing.."
						: isEditing
							? "Save changes"
							: "Create Product"}
				</Button>
			</form>
		</Form>
	);
};
