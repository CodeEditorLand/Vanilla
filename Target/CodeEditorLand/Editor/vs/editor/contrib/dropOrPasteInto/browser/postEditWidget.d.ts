import { CancellationToken } from "vs/base/common/cancellation";
import { Disposable } from "vs/base/common/lifecycle";
import "vs/css!./postEditWidget";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IBulkEditService } from "vs/editor/browser/services/bulkEditService";
import { Range } from "vs/editor/common/core/range";
import { DocumentDropEdit, DocumentPasteEdit } from "vs/editor/common/languages";
import { RawContextKey } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { INotificationService } from "vs/platform/notification/common/notification";
interface EditSet<Edit extends DocumentPasteEdit | DocumentDropEdit> {
    readonly activeEditIndex: number;
    readonly allEdits: ReadonlyArray<Edit>;
}
interface ShowCommand {
    readonly id: string;
    readonly label: string;
}
export declare class PostEditWidgetManager<T extends DocumentPasteEdit | DocumentDropEdit> extends Disposable {
    private readonly _id;
    private readonly _editor;
    private readonly _visibleContext;
    private readonly _showCommand;
    private readonly _instantiationService;
    private readonly _bulkEditService;
    private readonly _notificationService;
    private readonly _currentWidget;
    constructor(_id: string, _editor: ICodeEditor, _visibleContext: RawContextKey<boolean>, _showCommand: ShowCommand, _instantiationService: IInstantiationService, _bulkEditService: IBulkEditService, _notificationService: INotificationService);
    applyEditAndShowIfNeeded(ranges: readonly Range[], edits: EditSet<T>, canShowWidget: boolean, resolve: (edit: T, token: CancellationToken) => Promise<T>, token: CancellationToken): Promise<void>;
    show(range: Range, edits: EditSet<T>, onDidSelectEdit: (newIndex: number) => void): void;
    clear(): void;
    tryShowSelector(): void;
}
export {};
