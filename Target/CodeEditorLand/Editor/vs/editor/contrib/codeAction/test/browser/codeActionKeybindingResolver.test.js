import assert from "assert";
import { KeyCode } from "../../../../../base/common/keyCodes.js";
import { KeyCodeChord } from "../../../../../base/common/keybindings.js";
import { OperatingSystem } from "../../../../../base/common/platform.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { ResolvedKeybindingItem } from "../../../../../platform/keybinding/common/resolvedKeybindingItem.js";
import { USLayoutResolvedKeybinding } from "../../../../../platform/keybinding/common/usLayoutResolvedKeybinding.js";
import {
  organizeImportsCommandId,
  refactorCommandId
} from "../../browser/codeAction.js";
import { CodeActionKeybindingResolver } from "../../browser/codeActionKeybindingResolver.js";
import { CodeActionKind } from "../../common/types.js";
suite("CodeActionKeybindingResolver", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const refactorKeybinding = createCodeActionKeybinding(
    KeyCode.KeyA,
    refactorCommandId,
    { kind: CodeActionKind.Refactor.value }
  );
  const refactorExtractKeybinding = createCodeActionKeybinding(
    KeyCode.KeyB,
    refactorCommandId,
    { kind: CodeActionKind.Refactor.append("extract").value }
  );
  const organizeImportsKeybinding = createCodeActionKeybinding(
    KeyCode.KeyC,
    organizeImportsCommandId,
    void 0
  );
  test("Should match refactor keybindings", async () => {
    const resolver = new CodeActionKeybindingResolver(
      createMockKeyBindingService([refactorKeybinding])
    ).getResolver();
    assert.strictEqual(resolver({ title: "" }), void 0);
    assert.strictEqual(
      resolver({ title: "", kind: CodeActionKind.Refactor.value }),
      refactorKeybinding.resolvedKeybinding
    );
    assert.strictEqual(
      resolver({
        title: "",
        kind: CodeActionKind.Refactor.append("extract").value
      }),
      refactorKeybinding.resolvedKeybinding
    );
    assert.strictEqual(
      resolver({ title: "", kind: CodeActionKind.QuickFix.value }),
      void 0
    );
  });
  test("Should prefer most specific keybinding", async () => {
    const resolver = new CodeActionKeybindingResolver(
      createMockKeyBindingService([
        refactorKeybinding,
        refactorExtractKeybinding,
        organizeImportsKeybinding
      ])
    ).getResolver();
    assert.strictEqual(
      resolver({ title: "", kind: CodeActionKind.Refactor.value }),
      refactorKeybinding.resolvedKeybinding
    );
    assert.strictEqual(
      resolver({
        title: "",
        kind: CodeActionKind.Refactor.append("extract").value
      }),
      refactorExtractKeybinding.resolvedKeybinding
    );
  });
  test("Organize imports should still return a keybinding even though it does not have args", async () => {
    const resolver = new CodeActionKeybindingResolver(
      createMockKeyBindingService([
        refactorKeybinding,
        refactorExtractKeybinding,
        organizeImportsKeybinding
      ])
    ).getResolver();
    assert.strictEqual(
      resolver({
        title: "",
        kind: CodeActionKind.SourceOrganizeImports.value
      }),
      organizeImportsKeybinding.resolvedKeybinding
    );
  });
});
function createMockKeyBindingService(items) {
  return {
    getKeybindings: () => {
      return items;
    }
  };
}
function createCodeActionKeybinding(keycode, command, commandArgs) {
  return new ResolvedKeybindingItem(
    new USLayoutResolvedKeybinding(
      [new KeyCodeChord(false, true, false, false, keycode)],
      OperatingSystem.Linux
    ),
    command,
    commandArgs,
    void 0,
    false,
    null,
    false
  );
}
