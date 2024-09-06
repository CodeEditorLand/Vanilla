import { Dimension } from "vs/base/browser/dom";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { EditorPane } from "vs/workbench/browser/parts/editor/editorPane";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IDebugService, IDebugSession } from "vs/workbench/contrib/debug/common/debug";
import { IEditorGroup } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
export declare class DisassemblyView extends EditorPane {
    private readonly _configurationService;
    private readonly _instantiationService;
    private readonly _debugService;
    private static readonly NUM_INSTRUCTIONS_TO_LOAD;
    private _fontInfo;
    private _disassembledInstructions;
    private _onDidChangeStackFrame;
    private _previousDebuggingState;
    private _instructionBpList;
    private _enableSourceCodeRender;
    private _loadingLock;
    private readonly _referenceToMemoryAddress;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService, _configurationService: IConfigurationService, _instantiationService: IInstantiationService, _debugService: IDebugService);
    get fontInfo(): any;
    private createFontInfo;
    get currentInstructionAddresses(): any;
    get focusedCurrentInstructionReference(): any;
    get focusedCurrentInstructionAddress(): bigint | undefined;
    get focusedInstructionReference(): any;
    get focusedInstructionAddress(): bigint | undefined;
    get isSourceCodeRender(): boolean;
    get debugSession(): IDebugSession | undefined;
    get onDidChangeStackFrame(): any;
    get focusedAddressAndOffset(): {
        reference: any;
        offset: number;
        address: any;
    } | undefined;
    protected createEditor(parent: HTMLElement): void;
    layout(dimension: Dimension): void;
    goToInstructionAndOffset(instructionReference: string, offset: number, focus?: boolean): Promise<void>;
    /** Gets the address associated with the instruction reference. */
    getReferenceAddress(instructionReference: string): bigint | undefined;
    /**
     * Go to the address provided. If no address is provided, reveal the address of the currently focused stack frame. Returns false if that address is not available.
     */
    private goToAddress;
    private scrollUp_LoadDisassembledInstructions;
    private scrollDown_LoadDisassembledInstructions;
    /**
     * Sets the memory reference address. We don't just loadDisassembledInstructions
     * for this, since we can't really deal with discontiguous ranges (we can't
     * detect _if_ a range is discontiguous since we don't know how much memory
     * comes between instructions.)
     */
    private primeMemoryReference;
    /** Loads disasembled instructions. Returns the number of instructions that were loaded. */
    private loadDisassembledInstructions;
    private getIndexFromReferenceAndOffset;
    private getIndexFromAddress;
    /**
     * Clears the table and reload instructions near the target address
     */
    private reloadDisassembly;
    private clear;
}
export declare class DisassemblyViewContribution implements IWorkbenchContribution {
    private readonly _onDidActiveEditorChangeListener;
    private _onDidChangeModelLanguage;
    private _languageSupportsDisassembleRequest;
    constructor(editorService: IEditorService, debugService: IDebugService, contextKeyService: IContextKeyService);
    dispose(): void;
}
