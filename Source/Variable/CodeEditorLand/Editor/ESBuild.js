/**
 * @module ESBuild
 *
 */
export default {
    color: true,
    format: "esm",
    logLevel: "error",
    metafile: true,
    minify: true,
    outdir: "Target/CodeEditorLand/Editor",
    platform: "node",
    target: "esnext",
    tsconfig: "Source/Notation/CodeEditorLand/Editor/tsconfig.json",
    write: true,
    legalComments: "none",
    bundle: true,
    external: [
        "../../../terminal/browser/xterm-private.js",
        "../xterm-private.js",
        "./webviewMessages.js",
        "@microsoft/1ds-core-js",
        "@microsoft/1ds-post-js",
        "@parcel/watcher",
        "@vscode/iconv-lite-umd",
        "@vscode/policy-watcher",
        "@vscode/proxy-agent",
        "@vscode/ripgrep",
        "@vscode/sudo-prompt",
        "@vscode/windows-mutex",
        "@vscode/windows-process-tree",
        "@vscode/windows-registry",
        "@xterm/addon-serialize",
        "@xterm/addon-unicode11",
        "@xterm/headless",
        "electron",
        "native-is-elevated",
        "native-keymap",
        "native-watchdog",
        "node-pty",
        "original-fs",
        "v8-inspect-profiler",
        "vscode",
        "vscode-regexpp",
        "yauzl",
        "yazl",
    ],
    loader: {
        ".ttf": "file",
        ".png": "file",
        ".svg": "file",
    },
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
                onLoad({ filter: /.*/ }, ({ path }) => {
                    if ([
                        "Source/vs/base/test/common/filters.perf.data.d.ts",
                        "Source/vs/platform/files/test/node/fixtures/resolver/examples",
                        "Source/vs/platform/files/test/node/fixtures/resolver/other/deep",
                        "Source/vs/platform/files/test/node/fixtures/resolver/other/deep/employee",
                        "Source/vs/platform/files/test/node/fixtures/service",
                        "Source/vs/platform/files/test/node/fixtures/service/deep",
                        "Source/vs/workbench/contrib/codeEditor/test/node",
                        "Source/vs/workbench/services/search/test/node/fixtures",
                        "Source/vs/workbench/services/search/test/node/fixtures/examples",
                        "Source/vs/workbench/services/textfile/test/node/encoding/fixtures",
                        "Source/vs/platform/files/test/node/fixtures/resolver/examples",
                        ".d.ts",
                    ].some((Search) => path.split(sep).join(posix.sep).includes(Search))) {
                        return {
                            contents: "",
                            loader: "empty",
                        };
                    }
                    return null;
                });
            },
        },
        // (await import("esbuild-plugin-copy")).copy({
        // 	resolveFrom: "out",
        // 	assets: [
        // 		{
        // 			from: ["./Source/CodeEditorLand/Editor/Source/**/*.js"],
        // 			to: ["./CodeEditorLand/Editor/"],
        // 		},
        // 		{
        // 			from: ["./Source/CodeEditorLand/Editor/Source/**/*.css"],
        // 			to: ["./CodeEditorLand/Editor/"],
        // 		},
        // 	],
        // 	copyOnStart: true,
        // }),
    ],
};
export const { sep, posix } = await import("path");
