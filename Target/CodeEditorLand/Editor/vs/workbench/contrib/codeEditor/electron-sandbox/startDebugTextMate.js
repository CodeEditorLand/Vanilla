var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { joinPath } from "../../../../base/common/resources.js";
import { Constants } from "../../../../base/common/uint.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { Range } from "../../../../editor/common/core/range.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import * as nls from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILoggerService } from "../../../../platform/log/common/log.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { INativeWorkbenchEnvironmentService } from "../../../services/environment/electron-sandbox/environmentService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { ITextMateTokenizationService } from "../../../services/textMate/browser/textMateTokenizationFeature.js";
class StartDebugTextMate extends Action2 {
  static {
    __name(this, "StartDebugTextMate");
  }
  static resource = URI.parse(`inmemory:///tm-log.txt`);
  constructor() {
    super({
      id: "editor.action.startDebugTextMate",
      title: nls.localize2(
        "startDebugTextMate",
        "Start TextMate Syntax Grammar Logging"
      ),
      category: Categories.Developer,
      f1: true
    });
  }
  _getOrCreateModel(modelService) {
    const model = modelService.getModel(StartDebugTextMate.resource);
    if (model) {
      return model;
    }
    return modelService.createModel("", null, StartDebugTextMate.resource);
  }
  _append(model, str) {
    const lineCount = model.getLineCount();
    model.applyEdits([
      {
        range: new Range(
          lineCount,
          Constants.MAX_SAFE_SMALL_INTEGER,
          lineCount,
          Constants.MAX_SAFE_SMALL_INTEGER
        ),
        text: str
      }
    ]);
  }
  async run(accessor) {
    const textMateService = accessor.get(ITextMateTokenizationService);
    const modelService = accessor.get(IModelService);
    const editorService = accessor.get(IEditorService);
    const codeEditorService = accessor.get(ICodeEditorService);
    const hostService = accessor.get(IHostService);
    const environmentService = accessor.get(
      INativeWorkbenchEnvironmentService
    );
    const loggerService = accessor.get(ILoggerService);
    const fileService = accessor.get(IFileService);
    const pathInTemp = joinPath(
      environmentService.tmpDir,
      `vcode-tm-log-${generateUuid()}.txt`
    );
    await fileService.createFile(pathInTemp);
    const logger = loggerService.createLogger(pathInTemp, {
      name: "debug textmate"
    });
    const model = this._getOrCreateModel(modelService);
    const append = /* @__PURE__ */ __name((str) => {
      this._append(model, str + "\n");
      scrollEditor();
      logger.info(str);
      logger.flush();
    }, "append");
    await hostService.openWindow([{ fileUri: pathInTemp }], {
      forceNewWindow: true
    });
    const textEditorPane = await editorService.openEditor({
      resource: model.uri,
      options: { pinned: true }
    });
    if (!textEditorPane) {
      return;
    }
    const scrollEditor = /* @__PURE__ */ __name(() => {
      const editors = codeEditorService.listCodeEditors();
      for (const editor of editors) {
        if (editor.hasModel()) {
          if (editor.getModel().uri.toString() === StartDebugTextMate.resource.toString()) {
            editor.revealLine(editor.getModel().getLineCount());
          }
        }
      }
    }, "scrollEditor");
    append(`// Open the file you want to test to the side and watch here`);
    append(`// Output mirrored at ${pathInTemp}`);
    textMateService.startDebugMode(
      (str) => {
        this._append(model, str + "\n");
        scrollEditor();
        logger.info(str);
        logger.flush();
      },
      () => {
      }
    );
  }
}
registerAction2(StartDebugTextMate);
//# sourceMappingURL=startDebugTextMate.js.map
