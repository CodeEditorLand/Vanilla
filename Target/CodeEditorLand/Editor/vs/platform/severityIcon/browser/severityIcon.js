import "./media/severityIcon.css";
import { Codicon } from "../../../base/common/codicons.js";
import Severity from "../../../base/common/severity.js";
import { ThemeIcon } from "../../../base/common/themables.js";
var SeverityIcon;
((SeverityIcon2) => {
  function className(severity) {
    switch (severity) {
      case Severity.Ignore:
        return "severity-ignore " + ThemeIcon.asClassName(Codicon.info);
      case Severity.Info:
        return ThemeIcon.asClassName(Codicon.info);
      case Severity.Warning:
        return ThemeIcon.asClassName(Codicon.warning);
      case Severity.Error:
        return ThemeIcon.asClassName(Codicon.error);
      default:
        return "";
    }
  }
  SeverityIcon2.className = className;
})(SeverityIcon || (SeverityIcon = {}));
export {
  SeverityIcon
};
