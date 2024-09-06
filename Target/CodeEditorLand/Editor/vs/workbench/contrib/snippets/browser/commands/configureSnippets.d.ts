import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { SnippetsAction } from "vs/workbench/contrib/snippets/browser/commands/abstractSnippetsActions";
export declare class ConfigureSnippetsAction extends SnippetsAction {
    constructor();
    run(accessor: ServicesAccessor): Promise<any>;
}
