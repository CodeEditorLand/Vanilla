import { localize } from "../../../../nls.js";
import {
  MenuId,
  MenuRegistry,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { KeybindingsRegistry } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  EditorPaneDescriptor
} from "../../../browser/editor.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import {
  EditorExtensions
} from "../../../common/editor.js";
import { WalkThroughSnippetContentProvider } from "../common/walkThroughContentProvider.js";
import {
  EditorWalkThroughAction,
  EditorWalkThroughInputSerializer
} from "./editor/editorWalkThrough.js";
import {
  WalkThroughArrowDown,
  WalkThroughArrowUp,
  WalkThroughPageDown,
  WalkThroughPageUp
} from "./walkThroughActions.js";
import { WalkThroughInput } from "./walkThroughInput.js";
import { WalkThroughPart } from "./walkThroughPart.js";
Registry.as(
  EditorExtensions.EditorPane
).registerEditorPane(
  EditorPaneDescriptor.create(
    WalkThroughPart,
    WalkThroughPart.ID,
    localize("walkThrough.editor.label", "Playground")
  ),
  [new SyncDescriptor(WalkThroughInput)]
);
registerAction2(EditorWalkThroughAction);
Registry.as(
  EditorExtensions.EditorFactory
).registerEditorSerializer(
  EditorWalkThroughInputSerializer.ID,
  EditorWalkThroughInputSerializer
);
registerWorkbenchContribution2(
  WalkThroughSnippetContentProvider.ID,
  WalkThroughSnippetContentProvider,
  { editorTypeId: WalkThroughPart.ID }
);
KeybindingsRegistry.registerCommandAndKeybindingRule(WalkThroughArrowUp);
KeybindingsRegistry.registerCommandAndKeybindingRule(WalkThroughArrowDown);
KeybindingsRegistry.registerCommandAndKeybindingRule(WalkThroughPageUp);
KeybindingsRegistry.registerCommandAndKeybindingRule(WalkThroughPageDown);
MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
  group: "1_welcome",
  command: {
    id: "workbench.action.showInteractivePlayground",
    title: localize(
      { key: "miPlayground", comment: ["&& denotes a mnemonic"] },
      "Editor Playgrou&&nd"
    )
  },
  order: 3
});
