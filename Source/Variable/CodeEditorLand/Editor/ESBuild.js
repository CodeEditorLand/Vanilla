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
    ],
};
