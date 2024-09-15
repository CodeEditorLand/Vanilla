import * as nls from "../../../../nls.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
const getStartedIcon = registerIcon(
  "remote-explorer-get-started",
  Codicon.star,
  nls.localize(
    "getStartedIcon",
    "Getting started icon in the remote explorer view."
  )
);
const documentationIcon = registerIcon(
  "remote-explorer-documentation",
  Codicon.book,
  nls.localize(
    "documentationIcon",
    "Documentation icon in the remote explorer view."
  )
);
const feedbackIcon = registerIcon(
  "remote-explorer-feedback",
  Codicon.twitter,
  nls.localize("feedbackIcon", "Feedback icon in the remote explorer view.")
);
const reviewIssuesIcon = registerIcon(
  "remote-explorer-review-issues",
  Codicon.issues,
  nls.localize(
    "reviewIssuesIcon",
    "Review issue icon in the remote explorer view."
  )
);
const reportIssuesIcon = registerIcon(
  "remote-explorer-report-issues",
  Codicon.comment,
  nls.localize(
    "reportIssuesIcon",
    "Report issue icon in the remote explorer view."
  )
);
const remoteExplorerViewIcon = registerIcon(
  "remote-explorer-view-icon",
  Codicon.remoteExplorer,
  nls.localize(
    "remoteExplorerViewIcon",
    "View icon of the remote explorer view."
  )
);
const portsViewIcon = registerIcon(
  "ports-view-icon",
  Codicon.plug,
  nls.localize("portsViewIcon", "View icon of the remote ports view.")
);
const portIcon = registerIcon(
  "ports-view-icon",
  Codicon.plug,
  nls.localize("portIcon", "Icon representing a remote port.")
);
const privatePortIcon = registerIcon(
  "private-ports-view-icon",
  Codicon.lock,
  nls.localize("privatePortIcon", "Icon representing a private remote port.")
);
const forwardPortIcon = registerIcon(
  "ports-forward-icon",
  Codicon.plus,
  nls.localize("forwardPortIcon", "Icon for the forward action.")
);
const stopForwardIcon = registerIcon(
  "ports-stop-forward-icon",
  Codicon.x,
  nls.localize("stopForwardIcon", "Icon for the stop forwarding action.")
);
const openBrowserIcon = registerIcon(
  "ports-open-browser-icon",
  Codicon.globe,
  nls.localize("openBrowserIcon", "Icon for the open browser action.")
);
const openPreviewIcon = registerIcon(
  "ports-open-preview-icon",
  Codicon.openPreview,
  nls.localize("openPreviewIcon", "Icon for the open preview action.")
);
const copyAddressIcon = registerIcon(
  "ports-copy-address-icon",
  Codicon.clippy,
  nls.localize("copyAddressIcon", "Icon for the copy local address action.")
);
const labelPortIcon = registerIcon(
  "ports-label-icon",
  Codicon.tag,
  nls.localize("labelPortIcon", "Icon for the label port action.")
);
const forwardedPortWithoutProcessIcon = registerIcon(
  "ports-forwarded-without-process-icon",
  Codicon.circleOutline,
  nls.localize(
    "forwardedPortWithoutProcessIcon",
    "Icon for forwarded ports that don't have a running process."
  )
);
const forwardedPortWithProcessIcon = registerIcon(
  "ports-forwarded-with-process-icon",
  Codicon.circleFilled,
  nls.localize(
    "forwardedPortWithProcessIcon",
    "Icon for forwarded ports that do have a running process."
  )
);
export {
  copyAddressIcon,
  documentationIcon,
  feedbackIcon,
  forwardPortIcon,
  forwardedPortWithProcessIcon,
  forwardedPortWithoutProcessIcon,
  getStartedIcon,
  labelPortIcon,
  openBrowserIcon,
  openPreviewIcon,
  portIcon,
  portsViewIcon,
  privatePortIcon,
  remoteExplorerViewIcon,
  reportIssuesIcon,
  reviewIssuesIcon,
  stopForwardIcon
};
//# sourceMappingURL=remoteIcons.js.map
