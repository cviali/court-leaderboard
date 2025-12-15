import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		unoptimized: true,
	},
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: "https://court-leaderboard-api.christian-d59.workers.dev/:path*",
			},
		];
	},
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
