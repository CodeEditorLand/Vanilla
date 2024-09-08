import { CancellationToken } from "../../../../base/common/cancellation.js";
import { illegalArgument } from "../../../../base/common/errors.js";
import { URI } from "../../../../base/common/uri.js";
import { registerAction2 } from "../../../../platform/actions/common/actions.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import {
  EditorContributionInstantiation,
  registerEditorAction,
  registerEditorContribution
} from "../../../browser/editorExtensions.js";
import { Range } from "../../../common/core/range.js";
import { registerEditorFeature } from "../../../common/editorFeatures.js";
import { HoverParticipantRegistry } from "../../hover/browser/hoverTypes.js";
import {
  ColorPresentationsCollector,
  ExtColorDataCollector,
  _findColorData,
  _setupColorCommand
} from "./color.js";
import { ColorDetector } from "./colorDetector.js";
import { DefaultDocumentColorProviderFeature } from "./defaultDocumentColorProvider.js";
import { HoverColorPickerContribution } from "./hoverColorPicker/hoverColorPickerContribution.js";
import { HoverColorPickerParticipant } from "./hoverColorPicker/hoverColorPickerParticipant.js";
import {
  HideStandaloneColorPicker,
  InsertColorWithStandaloneColorPicker,
  ShowOrFocusStandaloneColorPicker
} from "./standaloneColorPicker/standaloneColorPickerActions.js";
import { StandaloneColorPickerController } from "./standaloneColorPicker/standaloneColorPickerController.js";
registerEditorAction(HideStandaloneColorPicker);
registerEditorAction(InsertColorWithStandaloneColorPicker);
registerAction2(ShowOrFocusStandaloneColorPicker);
registerEditorContribution(
  HoverColorPickerContribution.ID,
  HoverColorPickerContribution,
  EditorContributionInstantiation.BeforeFirstInteraction
);
registerEditorContribution(
  StandaloneColorPickerController.ID,
  StandaloneColorPickerController,
  EditorContributionInstantiation.AfterFirstRender
);
registerEditorContribution(
  ColorDetector.ID,
  ColorDetector,
  EditorContributionInstantiation.AfterFirstRender
);
registerEditorFeature(DefaultDocumentColorProviderFeature);
HoverParticipantRegistry.register(HoverColorPickerParticipant);
CommandsRegistry.registerCommand(
  "_executeDocumentColorProvider",
  (accessor, ...args) => {
    const [resource] = args;
    if (!(resource instanceof URI)) {
      throw illegalArgument();
    }
    const {
      model,
      colorProviderRegistry,
      isDefaultColorDecoratorsEnabled
    } = _setupColorCommand(accessor, resource);
    return _findColorData(
      new ExtColorDataCollector(),
      colorProviderRegistry,
      model,
      CancellationToken.None,
      isDefaultColorDecoratorsEnabled
    );
  }
);
CommandsRegistry.registerCommand(
  "_executeColorPresentationProvider",
  (accessor, ...args) => {
    const [color, context] = args;
    const { uri, range } = context;
    if (!(uri instanceof URI) || !Array.isArray(color) || color.length !== 4 || !Range.isIRange(range)) {
      throw illegalArgument();
    }
    const {
      model,
      colorProviderRegistry,
      isDefaultColorDecoratorsEnabled
    } = _setupColorCommand(accessor, uri);
    const [red, green, blue, alpha] = color;
    return _findColorData(
      new ColorPresentationsCollector({
        range,
        color: { red, green, blue, alpha }
      }),
      colorProviderRegistry,
      model,
      CancellationToken.None,
      isDefaultColorDecoratorsEnabled
    );
  }
);
