export type ProductVariantInput = {
	colorId: string
	sizeId: string
	quantity: number | null
	price: number
	discountedPrice?: number | null
	images: { url: string }[]
}

/**
 * Build the variant set for selected sizes.
 *
 * - Keeps only "custom" manuals (different color than the product base color)
 *   whose size is still selected.
 * - Regenerates base-color variants from current price/qty/images for every
 *   selected size when multi-size (or when custom manuals exist).
 * - Single size + no customs → no variants (product-level size only).
 */
export function buildSizeVariants(args: {
	sizeIds: string[]
	colorId: string
	price: number
	discountedPrice?: number | null
	quantity: number | null
	images: { url: string }[]
	manualVariants?: ProductVariantInput[]
}): ProductVariantInput[] {
	const sizeIds = [...new Set(args.sizeIds.filter(Boolean))]
	const sizeSet = new Set(sizeIds)

	const customManual = (args.manualVariants ?? []).filter(
		(variant) =>
			sizeSet.has(variant.sizeId) && variant.colorId !== args.colorId
	)

	if (sizeIds.length === 1 && customManual.length === 0) {
		return []
	}

	const covered = new Set(
		customManual.map((variant) => `${variant.sizeId}:${variant.colorId}`)
	)

	const auto: ProductVariantInput[] = []
	for (const sizeId of sizeIds) {
		const key = `${sizeId}:${args.colorId}`
		if (covered.has(key)) continue
		auto.push({
			colorId: args.colorId,
			sizeId,
			quantity: args.quantity,
			price: args.price,
			discountedPrice: args.discountedPrice ?? undefined,
			images: args.images,
		})
		covered.add(key)
	}

	return [...customManual, ...auto]
}

/** Resolve primary sizeId + sizeIds from request body. */
export function resolveSizeSelection(body: {
	sizeId?: unknown
	sizeIds?: unknown
}): { sizeId: string; sizeIds: string[] } | { error: string } {
	const fromArray = Array.isArray(body.sizeIds)
		? body.sizeIds.filter((id): id is string => typeof id === "string" && !!id)
		: []
	const primary =
		typeof body.sizeId === "string" && body.sizeId
			? body.sizeId
			: fromArray[0]

	const sizeIds = [...new Set(fromArray.length ? fromArray : primary ? [primary] : [])]
	if (!sizeIds.length || !primary) {
		return { error: "Select at least one size." }
	}

	const sizeId = sizeIds.includes(primary) ? primary : sizeIds[0]!
	return { sizeId, sizeIds }
}
