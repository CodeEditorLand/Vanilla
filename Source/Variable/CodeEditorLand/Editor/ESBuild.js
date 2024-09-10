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
    // bundle: false,
    bundle: true,
    external: [
        // TODO: LOG WHERE THEY'RE USED
        // Local project files related to terminal functionality and webview messaging
        "../../../terminal/browser/xterm-private.js",
        "../xterm-private.js",
        "./webviewMessages.js",
        // Microsoft's 1DS (One Data Strategy) telemetry system
        "@microsoft/1ds-core-js",
        "@microsoft/1ds-post-js",
        // File watcher used by Parcel bundler
        "@parcel/watcher",
        // VS Code-specific packages for various functionalities
        "@vscode/iconv-lite-umd", // Character encoding
        "@vscode/policy-watcher", // Policy watching
        "@vscode/proxy-agent", // Proxy handling
        "@vscode/ripgrep", // Text searching
        "@vscode/sudo-prompt", // Elevated permissions
        "@vscode/windows-mutex", // Windows-specific utility
        "@vscode/windows-process-tree", // Windows process management
        "@vscode/windows-registry", // Windows registry access
        // Add-ons for xterm.js terminal emulator
        "@xterm/addon-serialize", // Serialization support
        "@xterm/addon-unicode11", // Unicode 11 support
        "@xterm/headless", // Headless functionality
        // Framework for building cross-platform desktop applications
        "electron",
        // Native Node.js addons
        "native-is-elevated", // Checking elevated permissions
        "native-keymap", // Handling keymaps
        "native-watchdog", // Watchdog functionality
        // Pseudoterminal (pty) support for Node.js
        "node-pty",
        // Access to original Node.js 'fs' module
        "original-fs",
        // Profiling tool for V8 JavaScript engine
        "v8-inspect-profiler",
        // VS Code extension API
        "vscode",
        // Regular expression parser and AST generator
        "vscode-regexpp",
        // Libraries for reading (yauzl) and writing (yazl) ZIP files
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
