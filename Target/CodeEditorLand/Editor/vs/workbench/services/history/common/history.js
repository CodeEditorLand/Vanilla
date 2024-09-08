import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const IHistoryService = createDecorator("historyService");
var GoFilter = /* @__PURE__ */ ((GoFilter2) => {
  GoFilter2[GoFilter2["NONE"] = 0] = "NONE";
  GoFilter2[GoFilter2["EDITS"] = 1] = "EDITS";
  GoFilter2[GoFilter2["NAVIGATION"] = 2] = "NAVIGATION";
  return GoFilter2;
})(GoFilter || {});
var GoScope = /* @__PURE__ */ ((GoScope2) => {
  GoScope2[GoScope2["DEFAULT"] = 0] = "DEFAULT";
  GoScope2[GoScope2["EDITOR_GROUP"] = 1] = "EDITOR_GROUP";
  GoScope2[GoScope2["EDITOR"] = 2] = "EDITOR";
  return GoScope2;
})(GoScope || {});
export {
  GoFilter,
  GoScope,
  IHistoryService
};
