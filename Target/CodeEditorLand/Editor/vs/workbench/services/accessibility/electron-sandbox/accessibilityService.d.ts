import { AccessibilityService } from "../../../../platform/accessibility/browser/accessibilityService.js";
import { AccessibilitySupport, IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-sandbox/environmentService.js";
export declare class NativeAccessibilityService extends AccessibilityService implements IAccessibilityService {
    private readonly _telemetryService;
    private readonly nativeHostService;
    private didSendTelemetry;
    private shouldAlwaysUnderlineAccessKeys;
    constructor(environmentService: INativeWorkbenchEnvironmentService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, _layoutService: ILayoutService, _telemetryService: ITelemetryService, nativeHostService: INativeHostService);
    alwaysUnderlineAccessKeys(): Promise<boolean>;
    setAccessibilitySupport(accessibilitySupport: AccessibilitySupport): void;
}