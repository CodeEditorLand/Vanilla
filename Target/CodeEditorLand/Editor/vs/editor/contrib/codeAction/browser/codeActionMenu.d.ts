import "vs/base/browser/ui/codicons/codiconStyles";
import { ResolvedKeybinding } from "vs/base/common/keybindings";
import { CodeAction } from "vs/editor/common/languages";
import { CodeActionItem } from "vs/editor/contrib/codeAction/common/types";
import "vs/editor/contrib/symbolIcons/browser/symbolIcons";
import { IActionListItem } from "vs/platform/actionWidget/browser/actionList";
export declare function toMenuItems(inputCodeActions: readonly CodeActionItem[], showHeaders: boolean, keybindingResolver: (action: CodeAction) => ResolvedKeybinding | undefined): IActionListItem<CodeActionItem>[];
