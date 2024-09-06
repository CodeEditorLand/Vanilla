import { IAction } from "vs/base/common/actions";
import { Disposable } from "vs/base/common/lifecycle";
import { IObservable, ITransaction } from "vs/base/common/observable";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { InputState, ModifiedBaseRange } from "vs/workbench/contrib/mergeEditor/browser/model/modifiedBaseRange";
import { MergeEditorViewModel } from "vs/workbench/contrib/mergeEditor/browser/view/viewModel";
import { IGutterItemInfo, IGutterItemView } from "../editorGutter";
import { CodeEditorView } from "./codeEditorView";
export declare class InputCodeEditorView extends CodeEditorView {
    readonly inputNumber: 1 | 2;
    readonly otherInputNumber: number;
    constructor(inputNumber: 1 | 2, viewModel: IObservable<MergeEditorViewModel | undefined>, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, configurationService: IConfigurationService);
    private readonly modifiedBaseRangeGutterItemInfos;
    private readonly decorations;
}
export declare class ModifiedBaseRangeGutterItemModel implements IGutterItemInfo {
    readonly id: string;
    private readonly baseRange;
    private readonly inputNumber;
    private readonly viewModel;
    private readonly model;
    readonly range: any;
    constructor(id: string, baseRange: ModifiedBaseRange, inputNumber: 1 | 2, viewModel: MergeEditorViewModel);
    readonly enabled: any;
    readonly toggleState: IObservable<InputState>;
    readonly state: IObservable<{
        handled: boolean;
        focused: boolean;
    }>;
    setState(value: boolean, tx: ITransaction): void;
    toggleBothSides(): void;
    getContextMenuActions(): readonly IAction[];
}
export declare class MergeConflictGutterItemView extends Disposable implements IGutterItemView<ModifiedBaseRangeGutterItemModel> {
    private readonly item;
    private readonly checkboxDiv;
    private readonly isMultiLine;
    constructor(item: ModifiedBaseRangeGutterItemModel, target: HTMLElement, contextMenuService: IContextMenuService);
    layout(top: number, height: number, viewTop: number, viewHeight: number): void;
    update(baseRange: ModifiedBaseRangeGutterItemModel): void;
}
