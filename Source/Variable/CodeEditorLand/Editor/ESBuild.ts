import type { BuildOptions } from "esbuild";

/**
 * @module ESBuild
 *
 */
export default {
	color: true,
	format: "esm",
	logLevel: "debug",
	metafile: true,
	minify: true,
	outdir: "Target",
	platform: "node",
	target: "esnext",
	tsconfig: "Source/Notation/CodeEditorLand/Editor/tsconfig.json",
	write: true,
	legalComments: "none",
	plugins: [
		{
			name: "Target",
			setup({ onStart, initialOptions: { outdir } }) {
				onStart(async () => {
					try {
						outdir
							? await (
									await import("fs/promises")
								).rm(outdir, {
									recursive: true,
								})
							: {};
					} catch (_Error) {
						console.log(_Error);
					}
				});
			},
		},
		{
			name: "Exclude",
			setup({ onLoad }) {
				// biome-ignore lint/nursery/useTopLevelRegex:
				onLoad({ filter: /.*/ }, async ({ path }) => {
					if (
						[
							"Source/vs/base/test/common/filters.perf.data.d.ts",

							"Source/tsconfig.vscode-dts.json",
							"Source/tsconfig.vscode-proposed-dts.json",
							"Source/vs/platform/files/test/node/fixtures/resolver/examples",
							"Source/vs/platform/files/test/node/fixtures/resolver/other/deep",
							"Source/vs/platform/files/test/node/fixtures/resolver/other/deep/employee",
							"Source/vs/platform/files/test/node/fixtures/service",
							"Source/vs/platform/files/test/node/fixtures/service/deep",
							"Source/vs/workbench/contrib/codeEditor/test/node",
							"Source/vs/workbench/services/search/test/node/fixtures",
							"Source/vs/workbench/services/search/test/node/fixtures/examples",
							"Source/vs/workbench/services/textfile/test/node/encoding/fixtures",

							".d.ts",
						].some((Search) =>
							path.split(sep).join(posix.sep).includes(Search),
						)
					) {
						return {
							contents: "",
							loader: "empty",
						};
					}

					return null;
				});
			},
		},
		(await import("esbuild-plugin-copy")).copy({
			resolveFrom: "out",
			assets: [
				{
					from: ["./CodeEditorLand/Editor/Source/**/*.js"],
					to: ["./CodeEditorLand/Editor/"],
				},
				{
					from: ["./CodeEditorLand/Editor/Source/**/*.css"],
					to: ["./CodeEditorLand/Editor/"],
				},
			],
		}),
	],
} satisfies BuildOptions as BuildOptions;

export const { sep, posix } = await import("path");
export const { readFile } = await import("node:fs/promises");
