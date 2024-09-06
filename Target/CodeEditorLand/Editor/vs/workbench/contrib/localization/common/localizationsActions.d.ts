import { Action2 } from "vs/platform/actions/common/actions";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
export declare class ConfigureDisplayLanguageAction extends Action2 {
    static readonly ID = "workbench.action.configureLocale";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
    private withMoreInfoButton;
}
export declare class ClearDisplayLanguageAction extends Action2 {
    static readonly ID = "workbench.action.clearLocalePreference";
    static readonly LABEL: any;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
