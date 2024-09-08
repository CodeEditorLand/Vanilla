import "../../../../base/browser/ui/codicons/codiconStyles.js";
import type { ResolvedKeybinding } from "../../../../base/common/keybindings.js";
import type { CodeAction } from "../../../common/languages.js";
import { type CodeActionItem } from "../common/types.js";
import "../../symbolIcons/browser/symbolIcons.js";
import { type IActionListItem } from "../../../../platform/actionWidget/browser/actionList.js";
export declare function toMenuItems(inputCodeActions: readonly CodeActionItem[], showHeaders: boolean, keybindingResolver: (action: CodeAction) => ResolvedKeybinding | undefined): IActionListItem<CodeActionItem>[];
