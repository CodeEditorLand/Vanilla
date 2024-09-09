import type { BuildOptions } from "esbuild";

/**
 * @module ESBuild
 *
 */
export default (await import("deepmerge-ts")).deepmerge(
	(await import("./ESBuild.default.js")).default,
	{
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
		],
	},
) satisfies BuildOptions as BuildOptions;
