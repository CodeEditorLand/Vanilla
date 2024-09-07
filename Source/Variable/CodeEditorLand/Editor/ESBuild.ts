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
							// Const declarations must have an initialized value.biome(parse)
							// const definition inside a .d.ts file 😞
							"Source/vs/base/test/common/filters.perf.data.d.ts",

							// We do not want all the tests
							"Source/vs/base/parts/ipc/test",
							"Source/vs/base/parts/request/test",
							"Source/vs/base/parts/sandbox/test",
							"Source/vs/base/parts/storage/test",
							"Source/vs/base/test",
							"Source/vs/editor/contrib/bracketMatching/test",
							"Source/vs/editor/contrib/caretOperations/test",
							"Source/vs/editor/contrib/codeAction/test",
							"Source/vs/editor/contrib/comment/test",
							"Source/vs/editor/contrib/cursorUndo/test",
							"Source/vs/editor/contrib/documentSymbols/test",
							"Source/vs/editor/contrib/dropOrPasteInto/test",
							"Source/vs/editor/contrib/editorState/test",
							"Source/vs/editor/contrib/find/test",
							"Source/vs/editor/contrib/folding/test",
							"Source/vs/editor/contrib/gotoSymbol/test",
							"Source/vs/editor/contrib/hover/test",
							"Source/vs/editor/contrib/indentation/test",
							"Source/vs/editor/contrib/inlineCompletions/test",
							"Source/vs/editor/contrib/lineSelection/test",
							"Source/vs/editor/contrib/linesOperations/test",
							"Source/vs/editor/contrib/linkedEditing/test",
							"Source/vs/editor/contrib/multicursor/test",
							"Source/vs/editor/contrib/parameterHints/test",
							"Source/vs/editor/contrib/semanticTokens/test",
							"Source/vs/editor/contrib/smartSelect/test",
							"Source/vs/editor/contrib/snippet/test",
							"Source/vs/editor/contrib/stickyScroll/test",
							"Source/vs/editor/contrib/suggest/test",
							"Source/vs/editor/contrib/wordOperations/test",
							"Source/vs/editor/contrib/wordPartOperations/test",
							"Source/vs/editor/standalone/test",
							"Source/vs/editor/test",
							"Source/vs/editor/test/node/diffing/fixtures/ts-unit-test",
							"Source/vs/platform/accessibility/test",
							"Source/vs/platform/actions/test",
							"Source/vs/platform/backup/test",
							"Source/vs/platform/checksum/test",
							"Source/vs/platform/clipboard/test",
							"Source/vs/platform/commands/test",
							"Source/vs/platform/configuration/test",
							"Source/vs/platform/contextkey/test",
							"Source/vs/platform/dialogs/test",
							"Source/vs/platform/environment/test",
							"Source/vs/platform/extensionManagement/test",
							"Source/vs/platform/extensions/test",
							"Source/vs/platform/externalTerminal/test",
							"Source/vs/platform/files/test",
							"Source/vs/platform/hover/test",
							"Source/vs/platform/instantiation/test",
							"Source/vs/platform/keybinding/test",
							"Source/vs/platform/markers/test",
							"Source/vs/platform/notification/test",
							"Source/vs/platform/opener/test",
							"Source/vs/platform/progress/test",
							"Source/vs/platform/quickinput/test",
							"Source/vs/platform/registry/test",
							"Source/vs/platform/remote/test",
							"Source/vs/platform/secrets/test",
							"Source/vs/platform/state/test",
							"Source/vs/platform/storage/test",
							"Source/vs/platform/telemetry/test",
							"Source/vs/platform/terminal/test",
							"Source/vs/platform/test",
							"Source/vs/platform/theme/test",
							"Source/vs/platform/tunnel/test",
							"Source/vs/platform/undoRedo/test",
							"Source/vs/platform/uriIdentity/test",
							"Source/vs/platform/userData/test",
							"Source/vs/platform/userDataProfile/test",
							"Source/vs/platform/userDataSync/test",
							"Source/vs/platform/windows/test",
							"Source/vs/platform/workspace/test",
							"Source/vs/platform/workspaces/test",
							"Source/vs/server/test",
							"Source/vs/workbench/api/test",
							"Source/vs/workbench/contrib/bulkEdit/test",
							"Source/vs/workbench/contrib/chat/test",
							"Source/vs/workbench/contrib/codeEditor/test",
							"Source/vs/workbench/contrib/comments/test",
							"Source/vs/workbench/contrib/debug/test",
							"Source/vs/workbench/contrib/editSessions/test",
							"Source/vs/workbench/contrib/emmet/test",
							"Source/vs/workbench/contrib/extensions/test",
							"Source/vs/workbench/contrib/externalUriOpener/test",
							"Source/vs/workbench/contrib/files/test",
							"Source/vs/workbench/contrib/inlineChat/test",
							"Source/vs/workbench/contrib/issue/test",
							"Source/vs/workbench/contrib/markdown/test",
							"Source/vs/workbench/contrib/markers/test",
							"Source/vs/workbench/contrib/mergeEditor/test",
							"Source/vs/workbench/contrib/notebook/test",
							"Source/vs/workbench/contrib/output/test",
							"Source/vs/workbench/contrib/preferences/test",
							"Source/vs/workbench/contrib/scm/test",
							"Source/vs/workbench/contrib/search/test",
							"Source/vs/workbench/contrib/snippets/test",
							"Source/vs/workbench/contrib/speech/test",
							"Source/vs/workbench/contrib/tags/test",
							"Source/vs/workbench/contrib/tasks/test",
							"Source/vs/workbench/contrib/terminal/test",
							"Source/vs/workbench/contrib/terminalContrib/accessibility/test",
							"Source/vs/workbench/contrib/terminalContrib/chat/test",
							"Source/vs/workbench/contrib/terminalContrib/links/test",
							"Source/vs/workbench/contrib/terminalContrib/quickFix/test",
							"Source/vs/workbench/contrib/terminalContrib/suggest/test",
							"Source/vs/workbench/contrib/terminalContrib/typeAhead/test",
							"Source/vs/workbench/contrib/testing",
							"Source/vs/workbench/contrib/testing/browser/testResultsView",
							"Source/vs/workbench/contrib/testing/test",
							"Source/vs/workbench/contrib/themes/test",
							"Source/vs/workbench/contrib/url/test",
							"Source/vs/workbench/contrib/welcomeGettingStarted/test",
							"Source/vs/workbench/services/aiRelatedInformation/test",
							"Source/vs/workbench/services/assignment/test",
							"Source/vs/workbench/services/authentication/test",
							"Source/vs/workbench/services/commands/test",
							"Source/vs/workbench/services/configuration/test",
							"Source/vs/workbench/services/configurationResolver/test",
							"Source/vs/workbench/services/decorations/test",
							"Source/vs/workbench/services/dialogs/test",
							"Source/vs/workbench/services/editor/test",
							"Source/vs/workbench/services/extensionManagement/test",
							"Source/vs/workbench/services/extensions/test",
							"Source/vs/workbench/services/history/test",
							"Source/vs/workbench/services/keybinding/test",
							"Source/vs/workbench/services/label/test",
							"Source/vs/workbench/services/lifecycle/test",
							"Source/vs/workbench/services/preferences/test",
							"Source/vs/workbench/services/progress/test",
							"Source/vs/workbench/services/search/test",
							"Source/vs/workbench/services/storage/test",
							"Source/vs/workbench/services/telemetry/test",
							"Source/vs/workbench/services/textMate/test",
							"Source/vs/workbench/services/textfile/test",
							"Source/vs/workbench/services/textmodelResolver/test",
							"Source/vs/workbench/services/themes/test",
							"Source/vs/workbench/services/untitled/test",
							"Source/vs/workbench/services/userActivity/test",
							"Source/vs/workbench/services/views/test",
							"Source/vs/workbench/services/workingCopy/test",
							"Source/vs/workbench/services/workspaces/test",
							"Source/vs/workbench/test",
						].some((Search) =>
							path.split(sep).join(posix.sep).includes(Search),
						)
					) {
						return { contents: "", loader: "js" };
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
					to: ["./JavaScript/"],
				},
			],
		}),
	],
} satisfies BuildOptions as BuildOptions;

export const { sep, posix } = await import("path");
