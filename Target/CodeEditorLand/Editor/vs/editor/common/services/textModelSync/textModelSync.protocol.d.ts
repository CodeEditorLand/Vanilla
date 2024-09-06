import { IModelChangedEvent } from "vs/editor/common/model/mirrorTextModel";
export interface IWorkerTextModelSyncChannelServer {
    $acceptNewModel(data: IRawModelData): void;
    $acceptModelChanged(strURL: string, e: IModelChangedEvent): void;
    $acceptRemovedModel(strURL: string): void;
}
export interface IRawModelData {
    url: string;
    versionId: number;
    lines: string[];
    EOL: string;
}
