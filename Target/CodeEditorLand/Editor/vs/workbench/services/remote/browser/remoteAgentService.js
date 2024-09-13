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
import * as nls from "../../../../nls.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { Severity } from "../../../../platform/notification/common/notification.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import {
  IRemoteAuthorityResolverService,
  RemoteAuthorityResolverError
} from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { IRemoteSocketFactoryService } from "../../../../platform/remote/common/remoteSocketFactoryService.js";
import { ISignService } from "../../../../platform/sign/common/sign.js";
import {
  WorkbenchPhase,
  registerWorkbenchContribution2
} from "../../../common/contributions.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IHostService } from "../../host/browser/host.js";
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
  constructor(remoteAgentService, _dialogService, _hostService) {
    this._dialogService = _dialogService;
    this._hostService = _hostService;
    remoteAgentService.getRawEnvironment().then(void 0, (err) => {
      if (!RemoteAuthorityResolverError.isHandled(err)) {
        this._presentConnectionError(err);
      }
    });
  }
  static {
    __name(this, "RemoteConnectionFailureNotificationContribution");
  }
  static ID = "workbench.contrib.browserRemoteConnectionFailureNotification";
  async _presentConnectionError(err) {
    await this._dialogService.prompt({
      type: Severity.Error,
      message: nls.localize(
        "connectionError",
        "An unexpected error occurred that requires a reload of this page."
      ),
      detail: nls.localize(
        "connectionErrorDetail",
        "The workbench failed to connect to the server (Error: {0})",
        err ? err.message : ""
      ),
      buttons: [
        {
          label: nls.localize(
            { key: "reload", comment: ["&& denotes a mnemonic"] },
            "&&Reload"
          ),
          run: /* @__PURE__ */ __name(() => this._hostService.reload(), "run")
        }
      ]
    });
  }
};
RemoteConnectionFailureNotificationContribution = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, IDialogService),
  __decorateParam(2, IHostService)
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
