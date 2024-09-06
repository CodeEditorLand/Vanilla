import { URI } from "vs/base/common/uri";
import { ModelService } from "vs/editor/common/services/modelService";
import { ITextResourcePropertiesService } from "vs/editor/common/services/textResourceConfiguration";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IUndoRedoService } from "vs/platform/undoRedo/common/undoRedo";
import { IPathService } from "vs/workbench/services/path/common/pathService";
export declare class WorkbenchModelService extends ModelService {
    private readonly _pathService;
    constructor(configurationService: IConfigurationService, resourcePropertiesService: ITextResourcePropertiesService, undoRedoService: IUndoRedoService, _pathService: IPathService, instantiationService: IInstantiationService);
    protected _schemaShouldMaintainUndoRedoElements(resource: URI): any;
}
