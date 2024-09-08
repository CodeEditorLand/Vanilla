import { createDecorator } from "../../instantiation/common/instantiation.js";
var OldIssueType = /* @__PURE__ */ ((OldIssueType2) => {
  OldIssueType2[OldIssueType2["Bug"] = 0] = "Bug";
  OldIssueType2[OldIssueType2["PerformanceIssue"] = 1] = "PerformanceIssue";
  OldIssueType2[OldIssueType2["FeatureRequest"] = 2] = "FeatureRequest";
  return OldIssueType2;
})(OldIssueType || {});
var IssueSource = /* @__PURE__ */ ((IssueSource2) => {
  IssueSource2["VSCode"] = "vscode";
  IssueSource2["Extension"] = "extension";
  IssueSource2["Marketplace"] = "marketplace";
  return IssueSource2;
})(IssueSource || {});
const IIssueMainService = createDecorator("issueService");
const IProcessMainService = createDecorator("processService");
export {
  IIssueMainService,
  IProcessMainService,
  IssueSource,
  OldIssueType
};
