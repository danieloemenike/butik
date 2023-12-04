import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prismadb from "@/lib/prismadb";
import { ProductVariant, Product, Image } from "@prisma/client";

type TProductVariantSchema = {
	id?: string;
	colorId: string;
	sizeId: string;
	quantity: number | null;
	price: number;
	discountedPrice: number;
	images: Image[];
};

export async function POST(
	req: Request,
	{ params }: { params: { storeId: string } }
) {
	try {
		const { getUser, isAuthenticated } = getKindeServerSession();

		const userInfo = await getUser();
		const userId = userInfo?.id;

		const isAuth = await isAuthenticated();

		if (!isAuth) {
			return new NextResponse("unauthorized", { status: 401 });
		}
		if (!userId) {
			return new NextResponse("UnAuthorized", { status: 403 });
		}

		const body = await req.json();
		console.log(body);
		const {
			name,
			slug,
			price,
			discountedPrice,
			description,
			categoryId,
			subcategoryId,
			colorId,
			sizeId,
			images,
			isFeatured,
			isArchived,
			productVariant,
		} = body;

		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 403 });
		}

		if (!name) {
			return new NextResponse("Name is required", { status: 400 });
		}
		if (!slug) {
			return new NextResponse("Slug is required", { status: 400 });
		}
		if (!description) {
			return new NextResponse("Description is required", { status: 400 });
		}

		if (!images || !images.length) {
			return new NextResponse("Images are required", { status: 400 });
		}

		if (!price) {
			return new NextResponse("Price is required", { status: 400 });
		}

		if (!categoryId) {
			return new NextResponse("Category id is required", { status: 400 });
		}

		if (!subcategoryId) {
			return new NextResponse("Category id is required", { status: 400 });
		}

		if (!colorId) {
			return new NextResponse("Color id is required", { status: 400 });
		}

		if (!sizeId) {
			return new NextResponse("Size id is required", { status: 400 });
		}

		if (!params.storeId) {
			return new NextResponse("Store id is required", { status: 400 });
		}

		// const storeByUserId = await prismadb.store.findFirst({
		//   where: {
		//     id: params.storeId,
		//     userId
		//   }
		// });

		// if (!storeByUserId) {
		//   return new NextResponse("Unauthorized", { status: 405 });
		// }
		// const product =  await prismadb.$transaction(async (tx) => {
		//     const product = await tx.product.create({
		//       data: {
		//         name,
		//         price,
		//         discountedPrice,
		//         isFeatured,
		//         isArchived,
		//         categoryId,
		//         subcategoryId,
		//         colorId,
		//         sizeId,
		//         storeId: params.storeId,
		//       },
		//     });

		//     // Create product images
		//     const productImages = images.map((image: { url: string }) => ({
		//       url: image.url,
		//       product: { connect: { id: product.id } },
		//     }));

		//     await tx.image.createMany({
		//       data: productImages,
		//     });

		//     // Create product variants without images
		//     const productVariants = productVariant.map((variant:TProductVariantSchema) => ({
		//       colorId: variant.colorId,
		//       sizeId: variant.sizeId,
		//       quantity: variant.quantity,
		//       price: variant.price,
		//       discountedPrice: variant.discountedPrice,

		//       product: { connect: { id: product.id } },
		//     }));

		//     await tx.productVariant.createMany({
		//       data: productVariants,
		//     });

		//     // Create product variant images separately
		//     const variantImages = productVariant.map((variant:TProductVariantSchema) => ({
		//       url: variant.images.map((urlImage) => urlImage.url),
		//       productVariant: { connect: { id: variant.id } },
		//     }));

		//     await tx.image.createMany({
		//       data: variantImages,
		//     });
		//   });
		//WORKING
		// const productCreated = prismadb.product.create({
		//   data: {
		//     name,
		//     price,
		//     discountedPrice,
		//     isFeatured,
		//     isArchived,
		//     categoryId,
		//     subcategoryId,
		//     colorId,
		//     sizeId,
		//     storeId: params.storeId,
		//     images: {
		//       createMany: {
		//         data: [
		//           ...images.map((image: { url: string }) => ({
		//             url: image.url,
		//           })),
		//         ],
		//       },
		//     },

		//   },
		// });
		//   const productVariantCreated = prismadb.productVariant.create({
		//     data: productVariant.map((variant: TProductVariantSchema) => ({
		//       productId: productCreated.id,
		//       colorId: variant.colorId,
		//       sizeId: variant.sizeId,
		//       quantity: variant.quantity,
		//       price: variant.price,
		//       discountedPrice: variant.discountedPrice,
		//       images: {
		//         createMany: {
		//           data: [...variant.images.map((image: { url: string }) => ({
		//             url: image.url,
		//           }))],
		//         },
		//       },
		//     })),
		//   })
		//  const allProducts = await prismadb.$transaction([productCreated,productVariantCreated])

		//   const createdProducts = await prismadb.$transaction(async (tx) => {

		//   const productCreated = await tx.product.create({
		//     data: {
		//       name,
		//       price,
		//       discountedPrice,
		//       isFeatured,
		//       isArchived,
		//       categoryId,
		//       subcategoryId,
		//       colorId,
		//       sizeId,
		//       storeId: params.storeId,
		//       images: {
		//         createMany: {
		//           data: [
		//             ...images.map((image: { url: string }) => ({
		//               url: image.url,
		//             })),
		//           ],
		//         },
		//       },
		//     },
		//   });

		//   const productVariantCreated = await Promise.all(
		//     productVariant.map(async (variant: TProductVariantSchema) => {
		//       const createdVariant = await tx.productVariant.create({
		//         data: {
		//           productId: productCreated.id,
		//           colorId: variant.colorId,
		//           sizeId: variant.sizeId,
		//           quantity: variant.quantity,
		//           price: variant.price,
		//           discountedPrice: variant.discountedPrice,
		//           images: {
		//             createMany: {
		//               data: [...variant.images.map((image: { url: string }) => ({
		//                 url: image.url,
		//                 productId: productCreated.id,
		//               }))],
		//             },
		//           },
		//         },
		//       });

		//       return createdVariant;
		//     })
		//   );

		//   return [productCreated, ...productVariantCreated];
		// },
		const createdProducts = await prismadb.$transaction(async (tx) => {
			const productData = {
				name,
				slug,
				description,
				price,
				discountedPrice,
				isFeatured,
				isArchived,
				categoryId,
				subcategoryId,
				colorId,
				sizeId,
				storeId: params.storeId,
				images: {
					createMany: {
						data: [
							...images.map((image: { url: string }) => ({
								url: image.url,
							})),
						],
					},
				},
			};

			// Check if productVariant is present before including it in the data object
			// if (productVariant && productVariant.length > 0) {
			//   productData.productVariant = {
			//     createMany: {
			//       data: productVariant.map((variant: TProductVariantSchema) => ({
			//         colorId: variant.colorId,
			//         sizeId: variant.sizeId,
			//         quantity: variant.quantity,
			//         price: variant.price,
			//         discountedPrice: variant.discountedPrice,
			//         images: {
			//           createMany: {
			//             data: variant.images.map((image: { url: string }) => ({
			//               url: image.url,
			//               productId: productCreated.id,
			//             })),
			//           },
			//         },
			//       })),
			//     },
			//   };
			// }

			const productCreated = await tx.product.create({
				data: productData,
			});

			const productVariantCreated = await Promise.all(
				(productVariant || []).map(async (variant: TProductVariantSchema) => {
					const createdVariant = await tx.productVariant.create({
						data: {
							productId: productCreated.id,
							colorId: variant.colorId,
							sizeId: variant.sizeId,
							quantity: variant.quantity,
							price: variant.price,
							discountedPrice: variant.discountedPrice,
							images: {
								createMany: {
									data: (variant.images || []).map(
										(image: { url: string }) => ({
											url: image.url,
											productId: productCreated.id,
										})
									),
								},
							},
						},
					});

					return createdVariant;
				})
			);

			return [productCreated, ...productVariantCreated];
		});

		// 'createdProducts' contains the results of the transaction

		console.log(createdProducts);
		return NextResponse.json(createdProducts);
	} catch (error) {
		console.log("[PRODUCTS_POST]", error);
		return new NextResponse("Internal error", { status: 500 });
	}
}

export async function GET(
	req: Request,
	{ params }: { params: { storeId: string } }
) {
	try {
		const { searchParams } = new URL(req.url);
		const categoryId = searchParams.get("categoryId") || undefined;
		const colorId = searchParams.get("colorId") || undefined;
		const sizeId = searchParams.get("sizeId") || undefined;
		const isFeatured = searchParams.get("isFeatured");

		if (!params.storeId) {
			return new NextResponse("Store id is required", { status: 400 });
		}

		const products = await prismadb.product.findMany({
			where: {
				storeId: params.storeId,
				categoryId,
				colorId,
				sizeId,
				isFeatured: isFeatured ? true : undefined,
				isArchived: false,
			},
			include: {
				images: true,
				category: true,
				color: true,
				size: true,
				productVariant: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(products);
	} catch (error) {
		console.log("[PRODUCTS_GET]", error);
		return new NextResponse("Internal error", { status: 500 });
	}
}
