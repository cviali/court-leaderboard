export const sports = ["padel", "tennis", "badminton"] as const;
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://board-api.vlocityarena.com";
export const getImageUrl = (url: string | null | undefined) => {
	if (!url) return undefined;
	if (url.startsWith("http")) return url;
	if (url.startsWith("/api/assets/")) {
		return `${API_URL}/assets/${url.replace("/api/assets/", "")}`;
	}
	if (url.startsWith("/assets/")) {
		return `${API_URL}${url}`;
	}
	return url;
};
