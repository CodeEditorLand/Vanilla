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
    plugins: [
        {
            name: "Target",
            setup({ onStart, initialOptions: { outdir } }) {
                onStart(async () => {
                    try {
                        outdir
                            ? await (await import("fs/promises")).rm(outdir, {
                                recursive: true,
                            })
                            : {};
                    }
                    catch (_Error) {
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
                    if ([
                        "Source/vs/base/test/common/filters.perf.data.d.ts",
                    ].some((Search) => path.split(sep).join(posix.sep).includes(Search))) {
                        return {
                            contents: await readFile(path, "utf8"),
                            loader: "text",
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
};
export const { sep, posix } = await import("path");
export const { readFile } = await import("node:fs/promises");