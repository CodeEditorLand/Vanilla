import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
const ITextModelService = createDecorator("textModelService");
function isResolvedTextEditorModel(model) {
  const candidate = model;
  return !!candidate.textEditorModel;
}
export {
  ITextModelService,
  isResolvedTextEditorModel
};
