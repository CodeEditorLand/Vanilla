import type { ILink } from "@xterm/xterm";
import { DisposableStore } from "vs/base/common/lifecycle";
import { IAccessibleViewService } from "vs/platform/accessibility/browser/accessibleView";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILabelService } from "vs/platform/label/common/label";
import { IQuickInputService, IQuickPickItem } from "vs/platform/quickinput/common/quickInput";
import { type IDetachedTerminalInstance, type ITerminalInstance } from "vs/workbench/contrib/terminal/browser/terminal";
import type { TerminalLink } from "vs/workbench/contrib/terminalContrib/links/browser/terminalLink";
import { IDetectedLinks } from "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkManager";
export declare class TerminalLinkQuickpick extends DisposableStore {
    private readonly _labelService;
    private readonly _quickInputService;
    private readonly _accessibleViewService;
    private readonly _editorSequencer;
    private readonly _editorViewState;
    private _instance;
    private readonly _onDidRequestMoreLinks;
    readonly onDidRequestMoreLinks: any;
    constructor(_labelService: ILabelService, _quickInputService: IQuickInputService, _accessibleViewService: IAccessibleViewService, instantiationService: IInstantiationService);
    show(instance: ITerminalInstance | IDetachedTerminalInstance, links: {
        viewport: IDetectedLinks;
        all: Promise<IDetectedLinks>;
    }): Promise<void>;
    /**
     * @param ignoreLinks Links with labels to not include in the picks.
     */
    private _generatePicks;
    private _previewItem;
    private _previewItemInEditor;
    private _terminalScrollStateSaved;
    private _previewItemInTerminal;
}
export interface ITerminalLinkQuickPickItem extends IQuickPickItem {
    link: ILink | TerminalLink;
}
