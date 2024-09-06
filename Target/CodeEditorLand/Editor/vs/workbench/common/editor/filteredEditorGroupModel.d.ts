import { Disposable } from "vs/base/common/lifecycle";
import { EditorsOrder, GroupIdentifier, IMatchEditorOptions, IUntypedEditorInput } from "vs/workbench/common/editor";
import { IReadonlyEditorGroupModel } from "vs/workbench/common/editor/editorGroupModel";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
declare abstract class FilteredEditorGroupModel extends Disposable implements IReadonlyEditorGroupModel {
    protected readonly model: IReadonlyEditorGroupModel;
    private readonly _onDidModelChange;
    readonly onDidModelChange: any;
    constructor(model: IReadonlyEditorGroupModel);
    get id(): GroupIdentifier;
    get isLocked(): boolean;
    get stickyCount(): number;
    get activeEditor(): EditorInput | null;
    get previewEditor(): EditorInput | null;
    get selectedEditors(): EditorInput[];
    isPinned(editorOrIndex: EditorInput | number): boolean;
    isTransient(editorOrIndex: EditorInput | number): boolean;
    isSticky(editorOrIndex: EditorInput | number): boolean;
    isActive(editor: EditorInput | IUntypedEditorInput): boolean;
    isSelected(editorOrIndex: EditorInput | number): boolean;
    isFirst(editor: EditorInput): boolean;
    isLast(editor: EditorInput): boolean;
    getEditors(order: EditorsOrder, options?: {
        excludeSticky?: boolean;
    }): EditorInput[];
    findEditor(candidate: EditorInput | null, options?: IMatchEditorOptions): [EditorInput, number] | undefined;
    abstract get count(): number;
    abstract getEditorByIndex(index: number): EditorInput | undefined;
    abstract indexOf(editor: EditorInput | IUntypedEditorInput | null, editors?: EditorInput[], options?: IMatchEditorOptions): number;
    abstract contains(editor: EditorInput | IUntypedEditorInput, options?: IMatchEditorOptions): boolean;
    protected abstract filter(editorOrIndex: EditorInput | number): boolean;
}
export declare class StickyEditorGroupModel extends FilteredEditorGroupModel {
    get count(): number;
    getEditors(order: EditorsOrder, options?: {
        excludeSticky?: boolean;
    }): EditorInput[];
    isSticky(editorOrIndex: number | EditorInput): boolean;
    getEditorByIndex(index: number): EditorInput | undefined;
    indexOf(editor: EditorInput | IUntypedEditorInput | null, editors?: EditorInput[], options?: IMatchEditorOptions): number;
    contains(candidate: EditorInput | IUntypedEditorInput, options?: IMatchEditorOptions): boolean;
    protected filter(candidateOrIndex: EditorInput | number): boolean;
}
export declare class UnstickyEditorGroupModel extends FilteredEditorGroupModel {
    get count(): number;
    get stickyCount(): number;
    isSticky(editorOrIndex: number | EditorInput): boolean;
    getEditors(order: EditorsOrder, options?: {
        excludeSticky?: boolean;
    }): EditorInput[];
    getEditorByIndex(index: number): EditorInput | undefined;
    indexOf(editor: EditorInput | IUntypedEditorInput | null, editors?: EditorInput[], options?: IMatchEditorOptions): number;
    contains(candidate: EditorInput | IUntypedEditorInput, options?: IMatchEditorOptions): boolean;
    protected filter(candidateOrIndex: EditorInput | number): boolean;
}
export {};
