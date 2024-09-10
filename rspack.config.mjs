import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";

const Browser = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

const TypeScript = "Source/Notation/CodeEditorLand/Editor/tsconfig.json";

export const Current = dirname(fileURLToPath(import.meta.url));

/**
 * @type {string[]}
 */
export const Pipe = [];

for (const __File of await (
	await import("fast-glob")
).default("Dependency/CodeEditorLand/Editor/Source/**/*.{ts,tsx,js,jsx}")) {
	Pipe.push(resolve(Current, __File));
}

Pipe.reverse();

export default defineConfig({
	context: Current,
	entry: Pipe.splice(0, 220),
	target: "node",
	bail: false,
	infrastructureLogging: {
		debug: true,
		level: "verbose",
	},
	resolve: {
		extensions: ["...", ".ts", ".tsx", ".jsx", ".css"],
		extensionAlias: {
			".js": [".ts", ".js"],
		},
		tsConfig: resolve(Current, TypeScript),
	},
	output: {
		clean: true,
		// module: true,
		path: resolve(Current, "./Target/RSPack"),
	},
	module: {
		rules: [
			{
				test: /\.(svg|png)$/,
				type: "asset",
			},
			{
				test: /\.(jsx?|tsx?)$/,
				exclude: [/node_modules/],
				use: [
					{
						loader: "builtin:swc-loader",
						options: {
							jsc: {
								parser: {
									syntax: "typescript",
									tsx: true,
									decorators: true,
								},
								transform: {
									legacyDecorator: true,
									decoratorMetadata: true,
									// decoratorVersion: "2022-03",
								},
							},
							tsconfig: resolve(Current, TypeScript),
							env: { targets: Browser },
						},
					},
				],
			},
		],
	},
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
		// outputModule: true,
	},
});
