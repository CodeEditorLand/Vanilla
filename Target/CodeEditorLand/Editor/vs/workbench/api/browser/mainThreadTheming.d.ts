import { IThemeService } from "../../../platform/theme/common/themeService.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type MainThreadThemingShape } from "../common/extHost.protocol.js";
export declare class MainThreadTheming implements MainThreadThemingShape {
    private readonly _themeService;
    private readonly _proxy;
    private readonly _themeChangeListener;
    constructor(extHostContext: IExtHostContext, themeService: IThemeService);
    dispose(): void;
}
