import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationPropertySchema } from "vs/platform/configuration/common/configurationRegistry";
import { IProductService } from "vs/platform/product/common/productService";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { AccessibilityVoiceSettingId, ISpeechService } from "vs/workbench/contrib/speech/common/speechService";
export declare const accessibilityHelpIsShown: any;
export declare const accessibleViewIsShown: any;
export declare const accessibleViewSupportsNavigation: any;
export declare const accessibleViewVerbosityEnabled: any;
export declare const accessibleViewGoToSymbolSupported: any;
export declare const accessibleViewOnLastLine: any;
export declare const accessibleViewCurrentProviderId: any;
export declare const accessibleViewInCodeBlock: any;
export declare const accessibleViewContainsCodeBlocks: any;
export declare const accessibleViewHasUnassignedKeybindings: any;
export declare const accessibleViewHasAssignedKeybindings: any;
/**
 * Miscellaneous settings tagged with accessibility and implemented in the accessibility contrib but
 * were better to live under workbench for discoverability.
 */
export declare const enum AccessibilityWorkbenchSettingId {
    DimUnfocusedEnabled = "accessibility.dimUnfocused.enabled",
    DimUnfocusedOpacity = "accessibility.dimUnfocused.opacity",
    HideAccessibleView = "accessibility.hideAccessibleView",
    AccessibleViewCloseOnKeyPress = "accessibility.accessibleView.closeOnKeyPress"
}
export declare const enum ViewDimUnfocusedOpacityProperties {
    Default = 0.75,
    Minimum = 0.2,
    Maximum = 1
}
export declare const enum AccessibilityVerbositySettingId {
    Terminal = "accessibility.verbosity.terminal",
    DiffEditor = "accessibility.verbosity.diffEditor",
    Chat = "accessibility.verbosity.panelChat",
    InlineChat = "accessibility.verbosity.inlineChat",
    TerminalChat = "accessibility.verbosity.terminalChat",
    InlineCompletions = "accessibility.verbosity.inlineCompletions",
    KeybindingsEditor = "accessibility.verbosity.keybindingsEditor",
    Notebook = "accessibility.verbosity.notebook",
    Editor = "accessibility.verbosity.editor",
    Hover = "accessibility.verbosity.hover",
    Notification = "accessibility.verbosity.notification",
    EmptyEditorHint = "accessibility.verbosity.emptyEditorHint",
    ReplInputHint = "accessibility.verbosity.replInputHint",
    Comments = "accessibility.verbosity.comments",
    DiffEditorActive = "accessibility.verbosity.diffEditorActive",
    Debug = "accessibility.verbosity.debug"
}
export declare const accessibilityConfigurationNodeBase: IConfigurationNode;
export declare const soundFeatureBase: IConfigurationPropertySchema;
export declare const announcementFeatureBase: IConfigurationPropertySchema;
export declare function registerAccessibilityConfiguration(): void;
export { AccessibilityVoiceSettingId };
export declare const SpeechTimeoutDefault = 1200;
export declare class DynamicSpeechAccessibilityConfiguration extends Disposable implements IWorkbenchContribution {
    private readonly speechService;
    private readonly productService;
    static readonly ID = "workbench.contrib.dynamicSpeechAccessibilityConfiguration";
    constructor(speechService: ISpeechService, productService: IProductService);
    private updateConfiguration;
    private getLanguages;
}
