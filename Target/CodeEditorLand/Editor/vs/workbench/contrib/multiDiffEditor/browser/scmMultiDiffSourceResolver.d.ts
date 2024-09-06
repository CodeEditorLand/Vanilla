import { Disposable } from "vs/base/common/lifecycle";
import { URI, UriComponents } from "vs/base/common/uri";
import { IMultiDiffEditorOptions } from "vs/editor/browser/widget/multiDiffEditor/multiDiffEditorWidgetImpl";
import { Action2 } from "vs/platform/actions/common/actions";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IMultiDiffSourceResolver, IMultiDiffSourceResolverService, IResolvedMultiDiffSource } from "vs/workbench/contrib/multiDiffEditor/browser/multiDiffSourceResolverService";
import { ISCMService } from "vs/workbench/contrib/scm/common/scm";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
export declare class ScmMultiDiffSourceResolver implements IMultiDiffSourceResolver {
    private readonly _scmService;
    private static readonly _scheme;
    static getMultiDiffSourceUri(repositoryUri: string, groupId: string): URI;
    private static parseUri;
    constructor(_scmService: ISCMService);
    canHandleUri(uri: URI): boolean;
    resolveDiffSource(uri: URI): Promise<IResolvedMultiDiffSource>;
}
export declare class ScmMultiDiffSourceResolverContribution extends Disposable {
    static readonly ID = "workbench.contrib.scmMultiDiffSourceResolver";
    constructor(instantiationService: IInstantiationService, multiDiffSourceResolverService: IMultiDiffSourceResolverService);
}
interface OpenScmGroupActionOptions {
    title: string;
    repositoryUri: UriComponents;
    resourceGroupId: string;
}
export declare class OpenScmGroupAction extends Action2 {
    static openMultiFileDiffEditor(editorService: IEditorService, label: string, repositoryRootUri: URI | undefined, resourceGroupId: string, options?: IMultiDiffEditorOptions): Promise<any>;
    constructor();
    run(accessor: ServicesAccessor, options: OpenScmGroupActionOptions): Promise<void>;
}
export {};
