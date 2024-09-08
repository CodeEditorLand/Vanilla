import type { ILink } from "@xterm/xterm";
import { Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { IAccessibleViewService } from "../../../../../platform/accessibility/browser/accessibleView.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { IQuickInputService, type IQuickPickItem } from "../../../../../platform/quickinput/common/quickInput.js";
import { type IDetachedTerminalInstance, type ITerminalInstance } from "../../../terminal/browser/terminal.js";
import type { TerminalLink } from "./terminalLink.js";
import type { IDetectedLinks } from "./terminalLinkManager.js";
export declare class TerminalLinkQuickpick extends DisposableStore {
    private readonly _labelService;
    private readonly _quickInputService;
    private readonly _accessibleViewService;
    private readonly _editorSequencer;
    private readonly _editorViewState;
    private _instance;
    private readonly _onDidRequestMoreLinks;
    readonly onDidRequestMoreLinks: Event<void>;
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
