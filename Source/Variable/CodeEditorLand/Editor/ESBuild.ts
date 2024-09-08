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
				onLoad({ filter: /.*/ }, ({ path }) => {
					if (
						[
							"src/vs/base/test/common/filters.perf.data.d.ts",

							"src/vs/platform/files/test/node/fixtures/resolver/examples",
							"src/vs/platform/files/test/node/fixtures/resolver/other/deep",
							"src/vs/platform/files/test/node/fixtures/resolver/other/deep/employee",
							"src/vs/platform/files/test/node/fixtures/service",
							"src/vs/platform/files/test/node/fixtures/service/deep",
							"src/vs/workbench/contrib/codeEditor/test/node",
							"src/vs/workbench/services/search/test/node/fixtures",
							"src/vs/workbench/services/search/test/node/fixtures/examples",
							"src/vs/workbench/services/textfile/test/node/encoding/fixtures",

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
					from: ["./CodeEditorLand/Editor/src/**/*.js"],
					to: ["./CodeEditorLand/Editor/"],
				},
				{
					from: ["./CodeEditorLand/Editor/src/**/*.css"],
					to: ["./CodeEditorLand/Editor/"],
				},
			],
		}),
	],
} satisfies BuildOptions as BuildOptions;

export const { sep, posix } = await import("path");
