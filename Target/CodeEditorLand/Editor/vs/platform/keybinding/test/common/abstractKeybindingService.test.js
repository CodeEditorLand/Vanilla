import assert from "assert";
import { KeyChord, KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import {
  KeyCodeChord,
  createSimpleKeybinding
} from "../../../../base/common/keybindings.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { OS } from "../../../../base/common/platform.js";
import Severity from "../../../../base/common/severity.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import {
  ContextKeyExpr
} from "../../../contextkey/common/contextkey.js";
import { NullLogService } from "../../../log/common/log.js";
import {
  NoOpNotification
} from "../../../notification/common/notification.js";
import { NullTelemetryService } from "../../../telemetry/common/telemetryUtils.js";
import { AbstractKeybindingService } from "../../common/abstractKeybindingService.js";
import { KeybindingResolver } from "../../common/keybindingResolver.js";
import { ResolvedKeybindingItem } from "../../common/resolvedKeybindingItem.js";
import { USLayoutResolvedKeybinding } from "../../common/usLayoutResolvedKeybinding.js";
import { createUSLayoutResolvedKeybinding } from "./keybindingsTestUtils.js";
function createContext(ctx) {
  return {
    getValue: (key) => {
      return ctx[key];
    }
  };
}
suite("AbstractKeybindingService", () => {
  class TestKeybindingService extends AbstractKeybindingService {
    _resolver;
    constructor(resolver, contextKeyService, commandService, notificationService) {
      super(
        contextKeyService,
        commandService,
        NullTelemetryService,
        notificationService,
        new NullLogService()
      );
      this._resolver = resolver;
    }
    _getResolver() {
      return this._resolver;
    }
    _documentHasFocus() {
      return true;
    }
    resolveKeybinding(kb) {
      return USLayoutResolvedKeybinding.resolveKeybinding(kb, OS);
    }
    resolveKeyboardEvent(keyboardEvent) {
      const chord = new KeyCodeChord(
        keyboardEvent.ctrlKey,
        keyboardEvent.shiftKey,
        keyboardEvent.altKey,
        keyboardEvent.metaKey,
        keyboardEvent.keyCode
      ).toKeybinding();
      return this.resolveKeybinding(chord)[0];
    }
    resolveUserBinding(userBinding) {
      return [];
    }
    testDispatch(kb) {
      const keybinding = createSimpleKeybinding(kb, OS);
      return this._dispatch(
        {
          _standardKeyboardEventBrand: true,
          ctrlKey: keybinding.ctrlKey,
          shiftKey: keybinding.shiftKey,
          altKey: keybinding.altKey,
          metaKey: keybinding.metaKey,
          altGraphKey: false,
          keyCode: keybinding.keyCode,
          code: null
        },
        null
      );
    }
    _dumpDebugInfo() {
      return "";
    }
    _dumpDebugInfoJSON() {
      return "";
    }
    registerSchemaContribution() {
    }
    enableKeybindingHoldMode() {
      return void 0;
    }
  }
  let createTestKeybindingService = null;
  let currentContextValue = null;
  let executeCommandCalls = null;
  let showMessageCalls = null;
  let statusMessageCalls = null;
  let statusMessageCallsDisposed = null;
  teardown(() => {
    currentContextValue = null;
    executeCommandCalls = null;
    showMessageCalls = null;
    createTestKeybindingService = null;
    statusMessageCalls = null;
    statusMessageCallsDisposed = null;
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    executeCommandCalls = [];
    showMessageCalls = [];
    statusMessageCalls = [];
    statusMessageCallsDisposed = [];
    createTestKeybindingService = (items) => {
      const contextKeyService = {
        _serviceBrand: void 0,
        onDidChangeContext: void 0,
        bufferChangeEvents() {
        },
        createKey: void 0,
        contextMatchesRules: void 0,
        getContextKeyValue: void 0,
        createScoped: void 0,
        createOverlay: void 0,
        getContext: (target) => {
          return currentContextValue;
        },
        updateParent: () => {
        }
      };
      const commandService = {
        _serviceBrand: void 0,
        onWillExecuteCommand: () => Disposable.None,
        onDidExecuteCommand: () => Disposable.None,
        executeCommand: (commandId, ...args) => {
          executeCommandCalls.push({
            commandId,
            args
          });
          return Promise.resolve(void 0);
        }
      };
      const notificationService = {
        _serviceBrand: void 0,
        onDidAddNotification: void 0,
        onDidRemoveNotification: void 0,
        onDidChangeFilter: void 0,
        notify: (notification) => {
          showMessageCalls.push({
            sev: notification.severity,
            message: notification.message
          });
          return new NoOpNotification();
        },
        info: (message) => {
          showMessageCalls.push({ sev: Severity.Info, message });
          return new NoOpNotification();
        },
        warn: (message) => {
          showMessageCalls.push({ sev: Severity.Warning, message });
          return new NoOpNotification();
        },
        error: (message) => {
          showMessageCalls.push({ sev: Severity.Error, message });
          return new NoOpNotification();
        },
        prompt(severity, message, choices, options) {
          throw new Error("not implemented");
        },
        status(message, options) {
          statusMessageCalls.push(message);
          return {
            dispose: () => {
              statusMessageCallsDisposed.push(message);
            }
          };
        },
        setFilter() {
          throw new Error("not implemented");
        },
        getFilter() {
          throw new Error("not implemented");
        },
        getFilters() {
          throw new Error("not implemented");
        },
        removeFilter() {
          throw new Error("not implemented");
        }
      };
      const resolver = new KeybindingResolver(items, [], () => {
      });
      return new TestKeybindingService(
        resolver,
        contextKeyService,
        commandService,
        notificationService
      );
    };
  });
  function kbItem(keybinding, command, when) {
    return new ResolvedKeybindingItem(
      createUSLayoutResolvedKeybinding(keybinding, OS),
      command,
      null,
      when,
      true,
      null,
      false
    );
  }
  function toUsLabel(keybinding) {
    return createUSLayoutResolvedKeybinding(keybinding, OS).getLabel();
  }
  suite(
    "simple tests: single- and multi-chord keybindings are dispatched",
    () => {
      test("a single-chord keybinding is dispatched correctly; this test makes sure the dispatch in general works before we test empty-string/null command ID", () => {
        const key = KeyMod.CtrlCmd | KeyCode.KeyK;
        const kbService = createTestKeybindingService([
          kbItem(key, "myCommand")
        ]);
        currentContextValue = createContext({});
        const shouldPreventDefault = kbService.testDispatch(key);
        assert.deepStrictEqual(shouldPreventDefault, true);
        assert.deepStrictEqual(executeCommandCalls, [
          { commandId: "myCommand", args: [null] }
        ]);
        assert.deepStrictEqual(showMessageCalls, []);
        assert.deepStrictEqual(statusMessageCalls, []);
        assert.deepStrictEqual(statusMessageCallsDisposed, []);
        kbService.dispose();
      });
      test("a multi-chord keybinding is dispatched correctly", () => {
        const chord0 = KeyMod.CtrlCmd | KeyCode.KeyK;
        const chord1 = KeyMod.CtrlCmd | KeyCode.KeyI;
        const key = [chord0, chord1];
        const kbService = createTestKeybindingService([
          kbItem(key, "myCommand")
        ]);
        currentContextValue = createContext({});
        let shouldPreventDefault = kbService.testDispatch(chord0);
        assert.deepStrictEqual(shouldPreventDefault, true);
        assert.deepStrictEqual(executeCommandCalls, []);
        assert.deepStrictEqual(showMessageCalls, []);
        assert.deepStrictEqual(statusMessageCalls, [
          `(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`
        ]);
        assert.deepStrictEqual(statusMessageCallsDisposed, []);
        shouldPreventDefault = kbService.testDispatch(chord1);
        assert.deepStrictEqual(shouldPreventDefault, true);
        assert.deepStrictEqual(executeCommandCalls, [
          { commandId: "myCommand", args: [null] }
        ]);
        assert.deepStrictEqual(showMessageCalls, []);
        assert.deepStrictEqual(statusMessageCalls, [
          `(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`
        ]);
        assert.deepStrictEqual(statusMessageCallsDisposed, [
          `(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`
        ]);
        kbService.dispose();
      });
    }
  );
  suite("keybindings with empty-string/null command ID", () => {
    test("a single-chord keybinding with an empty string command ID unbinds the keybinding (shouldPreventDefault = false)", () => {
      const kbService = createTestKeybindingService([
        kbItem(KeyMod.CtrlCmd | KeyCode.KeyK, "myCommand"),
        kbItem(KeyMod.CtrlCmd | KeyCode.KeyK, "")
      ]);
      currentContextValue = createContext({});
      const shouldPreventDefault = kbService.testDispatch(
        KeyMod.CtrlCmd | KeyCode.KeyK
      );
      assert.deepStrictEqual(shouldPreventDefault, false);
      assert.deepStrictEqual(executeCommandCalls, []);
      assert.deepStrictEqual(showMessageCalls, []);
      assert.deepStrictEqual(statusMessageCalls, []);
      assert.deepStrictEqual(statusMessageCallsDisposed, []);
      kbService.dispose();
    });
    test("a single-chord keybinding with a null command ID unbinds the keybinding (shouldPreventDefault = false)", () => {
      const kbService = createTestKeybindingService([
        kbItem(KeyMod.CtrlCmd | KeyCode.KeyK, "myCommand"),
        kbItem(KeyMod.CtrlCmd | KeyCode.KeyK, null)
      ]);
      currentContextValue = createContext({});
      const shouldPreventDefault = kbService.testDispatch(
        KeyMod.CtrlCmd | KeyCode.KeyK
      );
      assert.deepStrictEqual(shouldPreventDefault, false);
      assert.deepStrictEqual(executeCommandCalls, []);
      assert.deepStrictEqual(showMessageCalls, []);
      assert.deepStrictEqual(statusMessageCalls, []);
      assert.deepStrictEqual(statusMessageCallsDisposed, []);
      kbService.dispose();
    });
    test("a multi-chord keybinding with an empty-string command ID keeps the keybinding (shouldPreventDefault = true)", () => {
      const chord0 = KeyMod.CtrlCmd | KeyCode.KeyK;
      const chord1 = KeyMod.CtrlCmd | KeyCode.KeyI;
      const key = [chord0, chord1];
      const kbService = createTestKeybindingService([
        kbItem(key, "myCommand"),
        kbItem(key, "")
      ]);
      currentContextValue = createContext({});
      let shouldPreventDefault = kbService.testDispatch(
        KeyMod.CtrlCmd | KeyCode.KeyK
      );
      assert.deepStrictEqual(shouldPreventDefault, true);
      assert.deepStrictEqual(executeCommandCalls, []);
      assert.deepStrictEqual(showMessageCalls, []);
      assert.deepStrictEqual(statusMessageCalls, [
        `(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`
      ]);
      assert.deepStrictEqual(statusMessageCallsDisposed, []);
      shouldPreventDefault = kbService.testDispatch(
        KeyMod.CtrlCmd | KeyCode.KeyI
      );
      assert.deepStrictEqual(shouldPreventDefault, true);
      assert.deepStrictEqual(executeCommandCalls, []);
      assert.deepStrictEqual(showMessageCalls, []);
      assert.deepStrictEqual(statusMessageCalls, [
        `(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`,
        `The key combination (${toUsLabel(chord0)}, ${toUsLabel(chord1)}) is not a command.`
      ]);
      assert.deepStrictEqual(statusMessageCallsDisposed, [
        `(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`
      ]);
      kbService.dispose();
    });
    test("a multi-chord keybinding with a null command ID keeps the keybinding (shouldPreventDefault = true)", () => {
      const chord0 = KeyMod.CtrlCmd | KeyCode.KeyK;
      const chord1 = KeyMod.CtrlCmd | KeyCode.KeyI;
      const key = [chord0, chord1];
      const kbService = createTestKeybindingService([
        kbItem(key, "myCommand"),
        kbItem(key, null)
      ]);
      currentContextValue = createContext({});
      let shouldPreventDefault = kbService.testDispatch(
        KeyMod.CtrlCmd | KeyCode.KeyK
      );
      assert.deepStrictEqual(shouldPreventDefault, true);
      assert.deepStrictEqual(executeCommandCalls, []);
      assert.deepStrictEqual(showMessageCalls, []);
      assert.deepStrictEqual(statusMessageCalls, [
        `(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`
      ]);
      assert.deepStrictEqual(statusMessageCallsDisposed, []);
      shouldPreventDefault = kbService.testDispatch(
        KeyMod.CtrlCmd | KeyCode.KeyI
      );
      assert.deepStrictEqual(shouldPreventDefault, true);
      assert.deepStrictEqual(executeCommandCalls, []);
      assert.deepStrictEqual(showMessageCalls, []);
      assert.deepStrictEqual(statusMessageCalls, [
        `(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`,
        `The key combination (${toUsLabel(chord0)}, ${toUsLabel(chord1)}) is not a command.`
      ]);
      assert.deepStrictEqual(statusMessageCallsDisposed, [
        `(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`
      ]);
      kbService.dispose();
    });
  });
  test("issue #16498: chord mode is quit for invalid chords", () => {
    const kbService = createTestKeybindingService([
      kbItem(
        KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyCode.KeyX
        ),
        "chordCommand"
      ),
      kbItem(KeyCode.Backspace, "simpleCommand")
    ]);
    let shouldPreventDefault = kbService.testDispatch(
      KeyMod.CtrlCmd | KeyCode.KeyK
    );
    assert.strictEqual(shouldPreventDefault, true);
    assert.deepStrictEqual(executeCommandCalls, []);
    assert.deepStrictEqual(showMessageCalls, []);
    assert.deepStrictEqual(statusMessageCalls, [
      `(${toUsLabel(KeyMod.CtrlCmd | KeyCode.KeyK)}) was pressed. Waiting for second key of chord...`
    ]);
    assert.deepStrictEqual(statusMessageCallsDisposed, []);
    executeCommandCalls = [];
    showMessageCalls = [];
    statusMessageCalls = [];
    statusMessageCallsDisposed = [];
    shouldPreventDefault = kbService.testDispatch(KeyCode.Backspace);
    assert.strictEqual(shouldPreventDefault, true);
    assert.deepStrictEqual(executeCommandCalls, []);
    assert.deepStrictEqual(showMessageCalls, []);
    assert.deepStrictEqual(statusMessageCalls, [
      `The key combination (${toUsLabel(KeyMod.CtrlCmd | KeyCode.KeyK)}, ${toUsLabel(KeyCode.Backspace)}) is not a command.`
    ]);
    assert.deepStrictEqual(statusMessageCallsDisposed, [
      `(${toUsLabel(KeyMod.CtrlCmd | KeyCode.KeyK)}) was pressed. Waiting for second key of chord...`
    ]);
    executeCommandCalls = [];
    showMessageCalls = [];
    statusMessageCalls = [];
    statusMessageCallsDisposed = [];
    shouldPreventDefault = kbService.testDispatch(KeyCode.Backspace);
    assert.strictEqual(shouldPreventDefault, true);
    assert.deepStrictEqual(executeCommandCalls, [
      {
        commandId: "simpleCommand",
        args: [null]
      }
    ]);
    assert.deepStrictEqual(showMessageCalls, []);
    assert.deepStrictEqual(statusMessageCalls, []);
    assert.deepStrictEqual(statusMessageCallsDisposed, []);
    executeCommandCalls = [];
    showMessageCalls = [];
    statusMessageCalls = [];
    statusMessageCallsDisposed = [];
    kbService.dispose();
  });
  test("issue #16833: Keybinding service should not testDispatch on modifier keys", () => {
    const kbService = createTestKeybindingService([
      kbItem(KeyCode.Ctrl, "nope"),
      kbItem(KeyCode.Meta, "nope"),
      kbItem(KeyCode.Alt, "nope"),
      kbItem(KeyCode.Shift, "nope"),
      kbItem(KeyMod.CtrlCmd, "nope"),
      kbItem(KeyMod.WinCtrl, "nope"),
      kbItem(KeyMod.Alt, "nope"),
      kbItem(KeyMod.Shift, "nope")
    ]);
    function assertIsIgnored(keybinding) {
      const shouldPreventDefault = kbService.testDispatch(keybinding);
      assert.strictEqual(shouldPreventDefault, false);
      assert.deepStrictEqual(executeCommandCalls, []);
      assert.deepStrictEqual(showMessageCalls, []);
      assert.deepStrictEqual(statusMessageCalls, []);
      assert.deepStrictEqual(statusMessageCallsDisposed, []);
      executeCommandCalls = [];
      showMessageCalls = [];
      statusMessageCalls = [];
      statusMessageCallsDisposed = [];
    }
    assertIsIgnored(KeyCode.Ctrl);
    assertIsIgnored(KeyCode.Meta);
    assertIsIgnored(KeyCode.Alt);
    assertIsIgnored(KeyCode.Shift);
    assertIsIgnored(KeyMod.CtrlCmd);
    assertIsIgnored(KeyMod.WinCtrl);
    assertIsIgnored(KeyMod.Alt);
    assertIsIgnored(KeyMod.Shift);
    kbService.dispose();
  });
  test("can trigger command that is sharing keybinding with chord", () => {
    const kbService = createTestKeybindingService([
      kbItem(
        KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyCode.KeyX
        ),
        "chordCommand"
      ),
      kbItem(
        KeyMod.CtrlCmd | KeyCode.KeyK,
        "simpleCommand",
        ContextKeyExpr.has("key1")
      )
    ]);
    currentContextValue = createContext({
      key1: true
    });
    let shouldPreventDefault = kbService.testDispatch(
      KeyMod.CtrlCmd | KeyCode.KeyK
    );
    assert.strictEqual(shouldPreventDefault, true);
    assert.deepStrictEqual(executeCommandCalls, [
      {
        commandId: "simpleCommand",
        args: [null]
      }
    ]);
    assert.deepStrictEqual(showMessageCalls, []);
    assert.deepStrictEqual(statusMessageCalls, []);
    assert.deepStrictEqual(statusMessageCallsDisposed, []);
    executeCommandCalls = [];
    showMessageCalls = [];
    statusMessageCalls = [];
    statusMessageCallsDisposed = [];
    currentContextValue = createContext({});
    shouldPreventDefault = kbService.testDispatch(
      KeyMod.CtrlCmd | KeyCode.KeyK
    );
    assert.strictEqual(shouldPreventDefault, true);
    assert.deepStrictEqual(executeCommandCalls, []);
    assert.deepStrictEqual(showMessageCalls, []);
    assert.deepStrictEqual(statusMessageCalls, [
      `(${toUsLabel(KeyMod.CtrlCmd | KeyCode.KeyK)}) was pressed. Waiting for second key of chord...`
    ]);
    assert.deepStrictEqual(statusMessageCallsDisposed, []);
    executeCommandCalls = [];
    showMessageCalls = [];
    statusMessageCalls = [];
    statusMessageCallsDisposed = [];
    currentContextValue = createContext({});
    shouldPreventDefault = kbService.testDispatch(
      KeyMod.CtrlCmd | KeyCode.KeyX
    );
    assert.strictEqual(shouldPreventDefault, true);
    assert.deepStrictEqual(executeCommandCalls, [
      {
        commandId: "chordCommand",
        args: [null]
      }
    ]);
    assert.deepStrictEqual(showMessageCalls, []);
    assert.deepStrictEqual(statusMessageCalls, []);
    assert.deepStrictEqual(statusMessageCallsDisposed, [
      `(${toUsLabel(KeyMod.CtrlCmd | KeyCode.KeyK)}) was pressed. Waiting for second key of chord...`
    ]);
    executeCommandCalls = [];
    showMessageCalls = [];
    statusMessageCalls = [];
    statusMessageCallsDisposed = [];
    kbService.dispose();
  });
  test("cannot trigger chord if command is overwriting", () => {
    const kbService = createTestKeybindingService([
      kbItem(
        KeyChord(
          KeyMod.CtrlCmd | KeyCode.KeyK,
          KeyMod.CtrlCmd | KeyCode.KeyX
        ),
        "chordCommand",
        ContextKeyExpr.has("key1")
      ),
      kbItem(KeyMod.CtrlCmd | KeyCode.KeyK, "simpleCommand")
    ]);
    currentContextValue = createContext({});
    let shouldPreventDefault = kbService.testDispatch(
      KeyMod.CtrlCmd | KeyCode.KeyK
    );
    assert.strictEqual(shouldPreventDefault, true);
    assert.deepStrictEqual(executeCommandCalls, [
      {
        commandId: "simpleCommand",
        args: [null]
      }
    ]);
    assert.deepStrictEqual(showMessageCalls, []);
    assert.deepStrictEqual(statusMessageCalls, []);
    assert.deepStrictEqual(statusMessageCallsDisposed, []);
    executeCommandCalls = [];
    showMessageCalls = [];
    statusMessageCalls = [];
    statusMessageCallsDisposed = [];
    currentContextValue = createContext({
      key1: true
    });
    shouldPreventDefault = kbService.testDispatch(
      KeyMod.CtrlCmd | KeyCode.KeyK
    );
    assert.strictEqual(shouldPreventDefault, true);
    assert.deepStrictEqual(executeCommandCalls, [
      {
        commandId: "simpleCommand",
        args: [null]
      }
    ]);
    assert.deepStrictEqual(showMessageCalls, []);
    assert.deepStrictEqual(statusMessageCalls, []);
    assert.deepStrictEqual(statusMessageCallsDisposed, []);
    executeCommandCalls = [];
    showMessageCalls = [];
    statusMessageCalls = [];
    statusMessageCallsDisposed = [];
    currentContextValue = createContext({
      key1: true
    });
    shouldPreventDefault = kbService.testDispatch(
      KeyMod.CtrlCmd | KeyCode.KeyX
    );
    assert.strictEqual(shouldPreventDefault, false);
    assert.deepStrictEqual(executeCommandCalls, []);
    assert.deepStrictEqual(showMessageCalls, []);
    assert.deepStrictEqual(statusMessageCalls, []);
    assert.deepStrictEqual(statusMessageCallsDisposed, []);
    executeCommandCalls = [];
    showMessageCalls = [];
    statusMessageCalls = [];
    statusMessageCallsDisposed = [];
    kbService.dispose();
  });
  test("can have spying command", () => {
    const kbService = createTestKeybindingService([
      kbItem(KeyMod.CtrlCmd | KeyCode.KeyK, "^simpleCommand")
    ]);
    currentContextValue = createContext({});
    const shouldPreventDefault = kbService.testDispatch(
      KeyMod.CtrlCmd | KeyCode.KeyK
    );
    assert.strictEqual(shouldPreventDefault, false);
    assert.deepStrictEqual(executeCommandCalls, [
      {
        commandId: "simpleCommand",
        args: [null]
      }
    ]);
    assert.deepStrictEqual(showMessageCalls, []);
    assert.deepStrictEqual(statusMessageCalls, []);
    assert.deepStrictEqual(statusMessageCallsDisposed, []);
    executeCommandCalls = [];
    showMessageCalls = [];
    statusMessageCalls = [];
    statusMessageCallsDisposed = [];
    kbService.dispose();
  });
});
