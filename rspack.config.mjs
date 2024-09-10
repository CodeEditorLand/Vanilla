import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";
import RefreshPlugin from "@rspack/plugin-react-refresh";

const Development = process.env.NODE_ENV === "development";

const Browser = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

export const Pipe = [];

for (const __File of await (
	await import("fast-glob")
).default("Dependency/CodeEditorLand/Editor/Source/**/*.{ts,tsx,js,jsx}")) {
	Pipe.push(__File);
}

Pipe.reverse();

export default defineConfig({
	context: dirname(fileURLToPath(import.meta.url)),
	entry: Pipe,
	resolve: {
		extensions: ["...", ".ts", ".tsx", ".js", ".jsx", ".css"],
	},
	module: {
		rules: [
			{
				test: /\.(svg|png)$/,
				type: "asset",
			},
			{
				test: /\.(jsx?|tsx?)$/,
				use: [
					{
						loader: "builtin:swc-loader",
						options: {
							jsc: {
								parser: {
									syntax: "typescript",
									tsx: true,
								},
							},
							env: { targets: Browser },
						},
					},
				],
			},
		],
	},
	plugins: [Development ? new RefreshPlugin() : null].filter(Boolean),
	optimization: {
		minimizer: [
			new rspack.SwcJsMinimizerRspackPlugin(),
			new rspack.LightningCssMinimizerRspackPlugin({
				minimizerOptions: { targets: Browser },
			}),
		],
	},
	experiments: {
		css: true,
	},
});
