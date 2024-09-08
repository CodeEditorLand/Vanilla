import type { BuildOptions } from "esbuild";

/**
 * @module ESBuild
 *
 */
export default (await import("deepmerge-ts")).deepmergeCustom({
	mergeArrays: false,
})((await import("./ESBuild.js")).default, {
	minify: false,
}) satisfies BuildOptions as BuildOptions;
