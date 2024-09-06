import { IMarkdownString } from "vs/base/common/htmlContent";
import { IDisposable } from "vs/base/common/lifecycle";
import "vs/css!./media/testMessageColorizer";
import { CodeEditorWidget } from "vs/editor/browser/widget/codeEditor/codeEditorWidget";
export declare const renderTestMessageAsText: (tm: string | IMarkdownString) => any;
/**
 * Applies decorations based on ANSI styles from the test message in the editor.
 * ANSI sequences are stripped from the text displayed in editor, and this
 * re-applies their colorization.
 *
 * This uses decorations rather than language features because the string
 * rendered in the editor lacks the ANSI codes needed to actually apply the
 * colorization.
 *
 * Note: does not support TrueColor.
 */
export declare const colorizeTestMessageInEditor: (message: string, editor: CodeEditorWidget) => IDisposable;
