/**
 * Insert Cloudinary delivery transforms after `/upload/` when missing.
 * AVIF (and HEIC) sources often fail through `next/image` optimization;
 * `f_auto` lets Cloudinary serve a browser-safe derivative.
 */
export function withCloudinaryTransforms(
	url: string,
	transforms = "f_auto,q_auto",
): string {
	try {
		const parsed = new URL(url);
		if (!parsed.hostname.includes("cloudinary.com")) return url;

		const marker = "/upload/";
		const uploadIndex = parsed.pathname.indexOf(marker);
		if (uploadIndex === -1) return url;

		const afterUpload = parsed.pathname.slice(uploadIndex + marker.length);
		const firstSegment = afterUpload.split("/")[0] ?? "";
		// Already has transforms (e.g. f_auto,q_auto or w_200).
		if (firstSegment.includes("_") && !firstSegment.startsWith("v")) {
			return url;
		}

		parsed.pathname = parsed.pathname.replace(
			marker,
			`${marker}${transforms}/`,
		);
		return parsed.toString();
	} catch {
		return url;
	}
}
