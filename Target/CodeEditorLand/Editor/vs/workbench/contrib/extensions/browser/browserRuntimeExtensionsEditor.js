import"../../../../base/common/actions.js";import"../../../../platform/extensions/common/extensions.js";import"../../../services/extensions/common/extensions.js";import{ReportExtensionIssueAction as t}from"../common/reportExtensionIssueAction.js";import{AbstractRuntimeExtensionsEditor as n}from"./abstractRuntimeExtensionsEditor.js";class x extends n{_getProfileInfo(){return null}_getUnresponsiveProfile(e){}_createSlowExtensionAction(e){return null}_createReportExtensionIssueAction(e){return e.marketplaceInfo?this._instantiationService.createInstance(t,e.description):null}_createSaveExtensionHostProfileAction(){return null}_createProfileAction(){return null}}export{x as RuntimeExtensionsEditor};
