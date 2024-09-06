import { IAction } from "vs/base/common/actions";
import { Event } from "vs/base/common/event";
import { URI } from "vs/base/common/uri";
import { Position } from "vs/editor/common/core/position";
import { IModelDeltaDecoration } from "vs/editor/common/model";
import { ITestMessage } from "vs/workbench/contrib/testing/common/testTypes";
export interface ITestingDecorationsService {
    _serviceBrand: undefined;
    /**
     * Fires when something happened to change decorations in an editor.
     * Interested consumers should call {@link syncDecorations} to update them.
     */
    onDidChange: Event<void>;
    /**
     * Signals the code underlying a test message has changed, and it should
     * no longer be decorated in the source.
     */
    invalidateResultMessage(message: ITestMessage): void;
    /**
     * Ensures decorations in the given document URI are up to date,
     * and returns them.
     */
    syncDecorations(resource: URI): Iterable<ITestDecoration> & {
        readonly size: number;
        getById(decorationId: string): ITestDecoration | undefined;
    };
    /**
     * Gets the range where a test ID is displayed, in the given URI.
     * Returns undefined if there's no such decoration.
     */
    getDecoratedTestPosition(resource: URI, testId: string): Position | undefined;
    /**
     * Sets that alternative actions are displayed on the model.
     */
    updateDecorationsAlternateAction(resource: URI, isAlt: boolean): void;
}
export interface ITestDecoration {
    /**
     * ID of the decoration after being added to the editor, set after the
     * decoration is applied.
     */
    readonly id: string;
    /**
     * Original decoration line number.
     */
    readonly line: number;
    /**
     * Editor decoration instance.
     */
    readonly editorDecoration: IModelDeltaDecoration;
    getContextMenuActions(): {
        object: IAction[];
        dispose(): void;
    };
}
export declare class TestDecorations<T extends {
    id: string;
    line: number;
} = ITestDecoration> {
    value: T[];
    /**
     * Adds a new value to the decorations.
     */
    push(value: T): void;
    /**
     * Gets decorations on each line.
     */
    lines(): Iterable<[number, T[]]>;
}
export declare const ITestingDecorationsService: any;