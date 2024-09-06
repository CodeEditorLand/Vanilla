import { AccessibilityService } from "vs/platform/accessibility/browser/accessibilityService";
import { AccessibilitySupport, IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ILayoutService } from "vs/platform/layout/browser/layoutService";
import { INativeHostService } from "vs/platform/native/common/native";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { INativeWorkbenchEnvironmentService } from "vs/workbench/services/environment/electron-sandbox/environmentService";
export declare class NativeAccessibilityService extends AccessibilityService implements IAccessibilityService {
    private readonly _telemetryService;
    private readonly nativeHostService;
    private didSendTelemetry;
    private shouldAlwaysUnderlineAccessKeys;
    constructor(environmentService: INativeWorkbenchEnvironmentService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, _layoutService: ILayoutService, _telemetryService: ITelemetryService, nativeHostService: INativeHostService);
    alwaysUnderlineAccessKeys(): Promise<boolean>;
    setAccessibilitySupport(accessibilitySupport: AccessibilitySupport): void;
}
