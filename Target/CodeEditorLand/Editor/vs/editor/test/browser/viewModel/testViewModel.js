import { TestThemeService } from "../../../../platform/theme/test/common/testThemeService.js";
import { MonospaceLineBreaksComputerFactory } from "../../../common/viewModel/monospaceLineBreaksComputer.js";
import { ViewModel } from "../../../common/viewModel/viewModelImpl.js";
import { TestLanguageConfigurationService } from "../../common/modes/testLanguageConfigurationService.js";
import { createTextModel } from "../../common/testTextModel.js";
import { TestConfiguration } from "../config/testConfiguration.js";
function testViewModel(text, options, callback) {
  const EDITOR_ID = 1;
  const configuration = new TestConfiguration(options);
  const model = createTextModel(text.join("\n"));
  const monospaceLineBreaksComputerFactory = MonospaceLineBreaksComputerFactory.create(configuration.options);
  const testLanguageConfigurationService = new TestLanguageConfigurationService();
  const viewModel = new ViewModel(
    EDITOR_ID,
    configuration,
    model,
    monospaceLineBreaksComputerFactory,
    monospaceLineBreaksComputerFactory,
    null,
    testLanguageConfigurationService,
    new TestThemeService(),
    {
      setVisibleLines(visibleLines, stabilized) {
      }
    },
    {
      batchChanges: (cb) => cb()
    }
  );
  callback(viewModel, model);
  viewModel.dispose();
  model.dispose();
  configuration.dispose();
  testLanguageConfigurationService.dispose();
}
export {
  testViewModel
};
