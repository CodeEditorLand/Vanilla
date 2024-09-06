import { Disposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import "vs/css!./inlineEditSideBySideWidget";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IDiffProviderFactoryService } from "vs/editor/browser/widget/diffEditor/diffProviderFactoryService";
import { IInlineEdit } from "vs/editor/common/languages";
import { IModelService } from "vs/editor/common/services/model";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
export declare class InlineEditSideBySideWidget extends Disposable {
    private readonly _editor;
    private readonly _model;
    private readonly _instantiationService;
    private readonly _diffProviderFactoryService;
    private readonly _modelService;
    private static _modelId;
    private static _createUniqueUri;
    private readonly _position;
    private readonly _text;
    private readonly _originalModel;
    private readonly _modifiedModel;
    private readonly _diff;
    private readonly _diffPromise;
    constructor(_editor: ICodeEditor, _model: IObservable<IInlineEdit | undefined>, _instantiationService: IInstantiationService, _diffProviderFactoryService: IDiffProviderFactoryService, _modelService: IModelService);
}
