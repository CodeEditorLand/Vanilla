export const { default: Config } = await import("./ESBuild.js");
/**
 * @module ESBuild
 *
 */
export default (await import("deepmerge-ts")).deepmergeCustom({
    mergeArrays: false,
})(Config, {
    minify: false,
});
export const { sep, posix } = await import("path");
