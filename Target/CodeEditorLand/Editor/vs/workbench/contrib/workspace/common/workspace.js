import { localize } from "../../../../nls.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
const WorkspaceTrustContext = {
  IsEnabled: new RawContextKey(
    "isWorkspaceTrustEnabled",
    false,
    localize(
      "workspaceTrustEnabledCtx",
      "Whether the workspace trust feature is enabled."
    )
  ),
  IsTrusted: new RawContextKey(
    "isWorkspaceTrusted",
    false,
    localize(
      "workspaceTrustedCtx",
      "Whether the current workspace has been trusted by the user."
    )
  )
};
const MANAGE_TRUST_COMMAND_ID = "workbench.trust.manage";
export {
  MANAGE_TRUST_COMMAND_ID,
  WorkspaceTrustContext
};
//# sourceMappingURL=workspace.js.map
