import { ReportExtensionIssueAction } from "../common/reportExtensionIssueAction.js";
import {
  AbstractRuntimeExtensionsEditor
} from "./abstractRuntimeExtensionsEditor.js";
class RuntimeExtensionsEditor extends AbstractRuntimeExtensionsEditor {
  _getProfileInfo() {
    return null;
  }
  _getUnresponsiveProfile(extensionId) {
    return void 0;
  }
  _createSlowExtensionAction(element) {
    return null;
  }
  _createReportExtensionIssueAction(element) {
    if (element.marketplaceInfo) {
      return this._instantiationService.createInstance(
        ReportExtensionIssueAction,
        element.description
      );
    }
    return null;
  }
  _createSaveExtensionHostProfileAction() {
    return null;
  }
  _createProfileAction() {
    return null;
  }
}
export {
  RuntimeExtensionsEditor
};
