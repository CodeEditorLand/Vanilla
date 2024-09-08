import type { BuildOptions } from "esbuild";

export const { default: Config } = await import("./ESBuild.js");

/**
 * @module ESBuild
 *
 */
export default (await import("deepmerge-ts")).deepmergeCustom({
	mergeArrays: false,
})(Config, {
	minify: false,
}) satisfies BuildOptions as BuildOptions;

export const { sep, posix } = await import("path");
