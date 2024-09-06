import { URI } from "vs/base/common/uri";
import { ITextModel } from "vs/editor/common/model";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { SearchConfiguration } from "./searchEditorInput";
export type SearchEditorData = {
    resultsModel: ITextModel;
    configurationModel: SearchConfigurationModel;
};
export declare class SearchConfigurationModel {
    config: Readonly<SearchConfiguration>;
    private _onConfigDidUpdate;
    readonly onConfigDidUpdate: any;
    constructor(config: Readonly<SearchConfiguration>);
    updateConfig(config: SearchConfiguration): void;
}
export declare class SearchEditorModel {
    private resource;
    constructor(resource: URI);
    resolve(): Promise<SearchEditorData>;
}
declare class SearchEditorModelFactory {
    models: any;
    constructor();
    initializeModelFromExistingModel(accessor: ServicesAccessor, resource: URI, config: SearchConfiguration): void;
    initializeModelFromRawData(accessor: ServicesAccessor, resource: URI, config: SearchConfiguration, contents: string | undefined): void;
    initializeModelFromExistingFile(accessor: ServicesAccessor, resource: URI, existingFile: URI): void;
    private tryFetchModelFromBackupService;
}
export declare const searchEditorModelFactory: SearchEditorModelFactory;
export {};
