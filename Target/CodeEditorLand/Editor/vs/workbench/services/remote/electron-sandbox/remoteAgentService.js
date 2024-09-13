var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { URI } from "../../../../base/common/uri.js";
import * as nls from "../../../../nls.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import {
  INotificationService,
  Severity
} from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import {
  IRemoteAuthorityResolverService,
  RemoteAuthorityResolverError,
  RemoteConnectionType
} from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { IRemoteSocketFactoryService } from "../../../../platform/remote/common/remoteSocketFactoryService.js";
import { ISignService } from "../../../../platform/sign/common/sign.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  WorkbenchPhase,
  registerWorkbenchContribution2
} from "../../../common/contributions.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
import { AbstractRemoteAgentService } from "../common/abstractRemoteAgentService.js";
import { IRemoteAgentService } from "../common/remoteAgentService.js";
let RemoteAgentService = class extends AbstractRemoteAgentService {
  static {
    __name(this, "RemoteAgentService");
  }
  constructor(remoteSocketFactoryService, userDataProfileService, environmentService, productService, remoteAuthorityResolverService, signService, logService) {
    super(
      remoteSocketFactoryService,
      userDataProfileService,
      environmentService,
      productService,
      remoteAuthorityResolverService,
      signService,
      logService
    );
  }
};
RemoteAgentService = __decorateClass([
  __decorateParam(0, IRemoteSocketFactoryService),
  __decorateParam(1, IUserDataProfileService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IProductService),
  __decorateParam(4, IRemoteAuthorityResolverService),
  __decorateParam(5, ISignService),
  __decorateParam(6, ILogService)
], RemoteAgentService);
let RemoteConnectionFailureNotificationContribution = class {
  constructor(_remoteAgentService, notificationService, environmentService, telemetryService, nativeHostService, _remoteAuthorityResolverService, openerService) {
    this._remoteAgentService = _remoteAgentService;
    this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
    this._remoteAgentService.getRawEnvironment().then(void 0, (err) => {
      if (!RemoteAuthorityResolverError.isHandled(err)) {
        const choices = [
          {
            label: nls.localize("devTools", "Open Developer Tools"),
            run: /* @__PURE__ */ __name(() => nativeHostService.openDevTools(), "run")
          }
        ];
        const troubleshootingURL = this._getTroubleshootingURL();
        if (troubleshootingURL) {
          choices.push({
            label: nls.localize("directUrl", "Open in browser"),
            run: /* @__PURE__ */ __name(() => openerService.open(troubleshootingURL, { openExternal: true }), "run")
          });
        }
        notificationService.prompt(
          Severity.Error,
          nls.localize("connectionError", "Failed to connect to the remote extension host server (Error: {0})", err ? err.message : ""),
          choices
        );
      }
    });
  }
  static {
    __name(this, "RemoteConnectionFailureNotificationContribution");
  }
  static ID = "workbench.contrib.nativeRemoteConnectionFailureNotification";
  _getTroubleshootingURL() {
    const remoteAgentConnection = this._remoteAgentService.getConnection();
    if (!remoteAgentConnection) {
      return null;
    }
    const connectionData = this._remoteAuthorityResolverService.getConnectionData(
      remoteAgentConnection.remoteAuthority
    );
    if (!connectionData || connectionData.connectTo.type !== RemoteConnectionType.WebSocket) {
      return null;
    }
    return URI.from({
      scheme: "http",
      authority: `${connectionData.connectTo.host}:${connectionData.connectTo.port}`,
      path: `/version`
    });
  }
};
RemoteConnectionFailureNotificationContribution = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, INotificationService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, INativeHostService),
  __decorateParam(5, IRemoteAuthorityResolverService),
  __decorateParam(6, IOpenerService)
], RemoteConnectionFailureNotificationContribution);
registerWorkbenchContribution2(
  RemoteConnectionFailureNotificationContribution.ID,
  RemoteConnectionFailureNotificationContribution,
  WorkbenchPhase.BlockRestore
);
export {
  RemoteAgentService
};
//# sourceMappingURL=remoteAgentService.js.map
