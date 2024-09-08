import type { VSBuffer } from "../../../../../base/common/buffer.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { type ICellOutput, type IOutputDto, type IOutputItemDto } from "../notebookCommon.js";
export declare class NotebookCellOutputTextModel extends Disposable implements ICellOutput {
    private _rawOutput;
    private _onDidChangeData;
    onDidChangeData: import("../../../../../base/common/event.js").Event<void>;
    get outputs(): IOutputItemDto[];
    get metadata(): Record<string, any> | undefined;
    get outputId(): string;
    /**
     * Alternative output id that's reused when the output is updated.
     */
    private _alternativeOutputId;
    get alternativeOutputId(): string;
    private _versionId;
    get versionId(): number;
    constructor(_rawOutput: IOutputDto);
    replaceData(rawData: IOutputDto): void;
    appendData(items: IOutputItemDto[]): void;
    private trackBufferLengths;
    private versionedBufferLengths;
    appendedSinceVersion(versionId: number, mime: string): VSBuffer | undefined;
    private optimizeOutputItems;
    asDto(): IOutputDto;
    bumpVersion(): void;
}
