import { Color } from "vs/base/common/color";
import { Disposable } from "vs/base/common/lifecycle";
import { IBracketPairColorizationOptions } from "vs/editor/common/config/editorOptions";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IViewDescriptorService } from "vs/workbench/common/views";
export interface IChatConfiguration {
    editor: {
        readonly fontSize: number;
        readonly fontFamily: string;
        readonly lineHeight: number;
        readonly fontWeight: string;
        readonly wordWrap: "off" | "on";
    };
}
export interface IChatEditorConfiguration {
    readonly foreground: Color | undefined;
    readonly inputEditor: IChatInputEditorOptions;
    readonly resultEditor: IChatResultEditorOptions;
}
export interface IChatInputEditorOptions {
    readonly backgroundColor: Color | undefined;
    readonly accessibilitySupport: string;
}
export interface IChatResultEditorOptions {
    readonly fontSize: number;
    readonly fontFamily: string | undefined;
    readonly lineHeight: number;
    readonly fontWeight: string;
    readonly backgroundColor: Color | undefined;
    readonly bracketPairColorization: IBracketPairColorizationOptions;
    readonly fontLigatures: boolean | string | undefined;
    readonly wordWrap: "off" | "on";
}
export declare class ChatEditorOptions extends Disposable {
    private readonly foreground;
    private readonly inputEditorBackgroundColor;
    private readonly resultEditorBackgroundColor;
    private readonly configurationService;
    private readonly themeService;
    private readonly viewDescriptorService;
    private static readonly lineHeightEm;
    private readonly _onDidChange;
    readonly onDidChange: any;
    private _config;
    get configuration(): IChatEditorConfiguration;
    private static readonly relevantSettingIds;
    constructor(viewId: string | undefined, foreground: string, inputEditorBackgroundColor: string, resultEditorBackgroundColor: string, configurationService: IConfigurationService, themeService: IThemeService, viewDescriptorService: IViewDescriptorService);
    private update;
}
