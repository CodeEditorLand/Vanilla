import type { BuildOptions } from "esbuild";

/**
 * @module ESBuild
 *
 */
export default (await import("deepmerge-ts")).deepmergeCustom({
	mergeArrays: false,
})((await import("./ESBuild.default.js")).default, {
	minify: false,
}) satisfies BuildOptions as BuildOptions;
