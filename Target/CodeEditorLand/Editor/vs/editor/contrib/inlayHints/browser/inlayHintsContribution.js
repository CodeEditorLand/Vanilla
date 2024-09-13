import { EditorContributionInstantiation, registerEditorContribution } from "../../../browser/editorExtensions.js";
import { HoverParticipantRegistry } from "../../hover/browser/hoverTypes.js";
import { InlayHintsController } from "./inlayHintsController.js";
import { InlayHintsHover } from "./inlayHintsHover.js";
registerEditorContribution(InlayHintsController.ID, InlayHintsController, EditorContributionInstantiation.AfterFirstRender);
HoverParticipantRegistry.register(InlayHintsHover);
//# sourceMappingURL=inlayHintsContribution.js.map
