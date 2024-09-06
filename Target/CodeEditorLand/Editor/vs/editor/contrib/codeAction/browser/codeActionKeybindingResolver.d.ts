import { ResolvedKeybinding } from "vs/base/common/keybindings";
import { CodeAction } from "vs/editor/common/languages";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
export declare class CodeActionKeybindingResolver {
    private readonly keybindingService;
    private static readonly codeActionCommands;
    constructor(keybindingService: IKeybindingService);
    getResolver(): (action: CodeAction) => ResolvedKeybinding | undefined;
    private bestKeybindingForCodeAction;
}
