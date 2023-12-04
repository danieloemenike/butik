"use client";

import * as z from "zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { Trash, TrashIcon } from "lucide-react";
import {
	Category,
	Color,
	Image,
	Product,
	ProductVariant,
	Size,
} from "@prisma/client";
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
import { useAddProductMutation } from "@/reduxStore/services/productApiSlice";
import { useGetCategoriesQuery } from "@/reduxStore/services/categoryApiSlice";
import { useGetColorsQuery } from "@/reduxStore/services/colorApiSlice";
import { useGetSizesQuery } from "@/reduxStore/services/sizeApiSlice";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
	name: z.string().min(1).max(50),
	slug: z.string(),
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
	productVariant: z
		.object({
			colorId: z.string().min(1),
			sizeId: z.string().min(1),
			quantity: z.coerce.number().min(1),
			price: z.coerce.number().min(1),
			discountedPrice: z.coerce.number().optional(),
			images: z
				.object({ url: z.string() })
				.array()
				.refine((data) => data.length > 0, {
					message: "Product variant image is required",
				}),
		})
		.array(),
	quantity: z.coerce.number().min(1),
	price: z.coerce.number().min(1),
	discountedPrice: z.coerce.number().optional(),
	categoryId: z.string().min(1),
	subcategoryId: z.string().min(1),
	colorId: z.string().min(1),
	sizeId: z.string().min(1),
	isFeatured: z.boolean().default(false).optional(),
	isArchived: z.boolean().default(false).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

type ProductProps = {
	categories: {
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
	}[];
};
// type TProductVariantSchema = {

//   colorId: string;
//   sizeId: string;
//   quantity: number | null;
//   price: number;
//   discountedPrice: number;
//   images: {
//     url:string
//   }[]

// }

export const ProductForm = ({ categories }: ProductProps) => {
	const { toast } = useToast();
	const params = useParams();
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const [addProduct, { isLoading, isError, isSuccess }] =
		useAddProductMutation();
	
	// const { data: categories = [], error, isLoading: isBillboardLoading, isFetching, isSuccess: isBillboardSuccessful, isError: isBillboardError } = useGetCategoriesQuery(`${params.storeId}`, { refetchOnMountOrArgChange: true });

	const {
		data: colors = [],
		error: colorError,
		isLoading: isColorLoading,
		isFetching: isColorFetching,
		isSuccess: isColorSuccessful,
		isError: isColorError,
	} = useGetColorsQuery(`${params.storeId}`, {
		refetchOnMountOrArgChange: true,
	});

	const {
		data: sizes = [],
		error: sizeError,
		isLoading: isSizeLoading,
		isFetching: isSizeFetching,
		isSuccess: isSizeSuccessful,
		isError: isSizeError,
	} = useGetSizesQuery(`${params.storeId}`, {
		refetchOnMountOrArgChange: true,
	});

	const defaultValues = {
		name: "",
		slug: "",
		description: "",
		images: [],
		quantity: 0,
		productVariant: [
			// {
			//   colorId: '',
			//   sizeId: '',
			//   quantity: 0,
			//   price: 0,
			//   discountedPrice: 0,
			//   images: [],
			// },
		],

		price: 0,
		categoryId: "",
		subcategoryId: "",
		colorId: "",
		sizeId: "",
		isFeatured: false,
		isArchived: false,
	};

	const form = useForm<ProductFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});
	
// Slug
const businessNameValue = useWatch({ control: form.control, name: 'name' });
const [businessSlugDisplay, setBusinessSlugDisplay] = useState('');
	const [businessSlugSubmission, setBusinessSlugSubmission] = useState('');

	useEffect(() => {
        // Initialize businessSlug with the initial value of businessSlugName
        const slug = businessNameValue.replace(/\s+/g, "_").toLowerCase();

        // const fullSlug = defaultUrl + slug;

        setBusinessSlugDisplay(slug);

        // Set the slug without the default URL for submission
        setBusinessSlugSubmission(slug);
    
        form.setValue("slug", slug);
	}, [businessNameValue, form]);
	
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

	// State to store the selected category
	const [selectedCategory, setSelectedCategory] = useState("");
	// State to store the filtered subcategories based on the selected category
	const [filteredSubcategories, setFilteredSubcategories] = useState<
		{
			id: string;
			name: string;
			createdAt: Date;
			updatedAt: Date;
			categoryId: string;
		}[]
	>([]);
	// const [productVariant, setProductVariants] = useState<TProductVariantSchema[]>([
	//   {
	//     colorId: '',
	//     sizeId: '',
	//     quantity: 0,
	//     price: 0,
	//     discountedPrice: 0,
	//     images: []
	//     // ... (other fields)
	//   },
	// ]);;

	// Function to add a new product variant
	// const addProductVariant = () => {
	//   setProductVariants((prevVariants) => [
	//     ...prevVariants,
	//     {
	//       colorId: '',
	//       sizeId: '',
	//       quantity: 0,
	//       price: 0,
	//       discountedPrice: 0,
	//       images:[]
	//       // ... (other fields)
	//     },
	//   ]);
	// };

	// Effect to update filtered subcategories when the selected category changes
	useEffect(() => {
		if (selectedCategory) {
			// Find the selected category in the fetched data
			const selectedCategoryData = categories?.find(
				(category) => category.id === selectedCategory
			);

			// Update filtered subcategories based on the selected category
			setFilteredSubcategories(selectedCategoryData?.subcategories || []);
		} else {
			// If no category is selected, show all subcategories
			setFilteredSubcategories(
				categories.flatMap((category) => category.subcategories || [])
			);
		}
	}, [selectedCategory, categories]);
	const onSubmit = async (data: ProductFormValues) => {
		try {
			// await addProduct({ storeId: params.storeId, data }).unwrap();
			const response = await axios.post(
				`/api/${params.storeId}/products/v1`,
				data
			);
			if (response) {
				router.refresh();
				toast({
					description: "Your Product has been created successfully.",
				});
				router.push(`/store/${params.storeId}/products`);
			} else {
				toast({
					variant: "destructive",
					title: "Uh oh! Something went wrong.",
					description:
						"There was a problem with your request. Please try again",
				});
				console.log("Something went wrong ");
			}
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Uh oh! Something went wrong.",
				description: "There was a problem with your request.",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-8 w-full">
					<div className="md:grid md:grid-cols-3 gap-12">
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
              ) } />
             
                      <FormField control={form.control} name = "slug" render={ ({ field }) => (
                              <FormItem>
                                  <FormLabel>
                                      Product Unique Slug <span className="text-red-600 font-bold">(Please Don't Edit!)</span>
                                  </FormLabel>
                                  <FormControl>
                                      <Input placeholder="Unique Business UserName" value = {businessSlugDisplay} readOnly />
                               </FormControl>
                                 <FormMessage defaultValue="Dont Edit This" />
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
											placeholder="9.99"
											{...field}
										/>
									</FormControl>
									<FormDescription className="capitalize">
										How Many Do You Have in stock?
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
												className="resize-y max-w-full h-[180px] "
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
										<Input
											type="number"
											disabled={loading}
											placeholder="9.99"
											{...field}
										/>
									</FormControl>
									<FormDescription className="capitalize">
										Your Product Actual Selling Price
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
										<Input
											type="number"
											disabled={loading}
											placeholder="9.99"
											{...field}
										/>
									</FormControl>
									<FormDescription className="capitalize">
										Give a discount price here to encourage sales(optional).
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
										}}
										value={field.value}
										defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													defaultValue={field.value}
													placeholder="Select a category"
												/>
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
												<SelectValue
													defaultValue={field.value}
													placeholder="Select a SubCategory"
												/>
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
							name="sizeId"
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
												<SelectValue
													defaultValue={field.value}
													placeholder="Select a size"
												/>
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
												<SelectValue
													defaultValue={field.value}
													placeholder="Select a color"
												/>
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

					{/* PRODUCT VARIANT  */}
					<div className="flex flex-col">
						<h2 className="text-lg font-semibold">Product Variants</h2>
						<p className="capitalize text-muted-foreground">
							{" "}
							Ignore This if you don't have a product variant
						</p>
					</div>

					{fields.map((variant, index) => (
						<>
							<Separator />
							<Button
								type="button"
								onClick={() => remove(index)}
								variant="destructive"
								className="shadow-lg">
								Remove Variant
							</Button>
							<div key={index} className="md:grid md:grid-cols-3 gap-8">
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
														<SelectValue
															defaultValue={field.value}
															placeholder="Select a color"
														/>
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{/* ... (options for colors) */}
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
														<SelectValue
															defaultValue={field.value}
															placeholder="Select a size"
														/>
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
									name={`productVariant.${index}.price` as const}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Price</FormLabel>
											<FormControl>
												<Input
													type="number "
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

								{/* Add more fields for quantity, price, discountedPrice, etc. */}
							</div>
						</>
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
					<div className="md:grid md:grid-cols-3 gap-8">
						<FormField
							control={form.control}
							name="isFeatured"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
									<FormControl>
										<Checkbox
											disabled={loading}
											checked={field.value}
											// @ts-ignore
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
											// @ts-ignore
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
						{loading ? "Processing.." : "Create Product"}
					</Button>
				</form>
			</Form>
		</>
	);
};
