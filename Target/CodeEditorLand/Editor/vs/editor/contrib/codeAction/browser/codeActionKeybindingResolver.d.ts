import type { ResolvedKeybinding } from "../../../../base/common/keybindings.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import type { CodeAction } from "../../../common/languages.js";
export declare class CodeActionKeybindingResolver {
    private readonly keybindingService;
    private static readonly codeActionCommands;
    constructor(keybindingService: IKeybindingService);
    getResolver(): (action: CodeAction) => ResolvedKeybinding | undefined;
    private bestKeybindingForCodeAction;
}
