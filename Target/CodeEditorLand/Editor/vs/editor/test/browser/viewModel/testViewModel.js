var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IEditorOptions } from "../../../common/config/editorOptions.js";
import { TextModel } from "../../../common/model/textModel.js";
import { ViewModel } from "../../../common/viewModel/viewModelImpl.js";
import { TestConfiguration } from "../config/testConfiguration.js";
import { MonospaceLineBreaksComputerFactory } from "../../../common/viewModel/monospaceLineBreaksComputer.js";
import { createTextModel } from "../../common/testTextModel.js";
import { TestLanguageConfigurationService } from "../../common/modes/testLanguageConfigurationService.js";
import { TestThemeService } from "../../../../platform/theme/test/common/testThemeService.js";
function testViewModel(text, options, callback) {
  const EDITOR_ID = 1;
  const configuration = new TestConfiguration(options);
  const model = createTextModel(text.join("\n"));
  const monospaceLineBreaksComputerFactory = MonospaceLineBreaksComputerFactory.create(configuration.options);
  const testLanguageConfigurationService = new TestLanguageConfigurationService();
  const viewModel = new ViewModel(EDITOR_ID, configuration, model, monospaceLineBreaksComputerFactory, monospaceLineBreaksComputerFactory, null, testLanguageConfigurationService, new TestThemeService(), {
    setVisibleLines(visibleLines, stabilized) {
    }
  }, {
    batchChanges: /* @__PURE__ */ __name((cb) => cb(), "batchChanges")
  });
  callback(viewModel, model);
  viewModel.dispose();
  model.dispose();
  configuration.dispose();
  testLanguageConfigurationService.dispose();
}
__name(testViewModel, "testViewModel");
export {
  testViewModel
};
//# sourceMappingURL=testViewModel.js.map
