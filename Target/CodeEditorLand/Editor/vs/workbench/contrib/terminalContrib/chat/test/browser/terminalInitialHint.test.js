import { strictEqual } from "assert";
import { importAMDNodeModule } from "../../../../../../amdX.js";
import { getActiveDocument } from "../../../../../../base/browser/dom.js";
import { Emitter } from "../../../../../../base/common/event.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { ExtensionIdentifier } from "../../../../../../platform/extensions/common/extensions.js";
import { NullLogService } from "../../../../../../platform/log/common/log.js";
import { ShellIntegrationAddon } from "../../../../../../platform/terminal/common/xterm/shellIntegrationAddon.js";
import { workbenchInstantiationService } from "../../../../../test/browser/workbenchTestServices.js";
import {
  ChatAgentLocation
} from "../../../../chat/common/chatAgents.js";
import { InitialHintAddon } from "../../browser/terminal.initialHint.contribution.js";
suite("Terminal Initial Hint Addon", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let eventCount = 0;
  let xterm;
  let initialHintAddon;
  const _onDidChangeAgents = new Emitter();
  const onDidChangeAgents = _onDidChangeAgents.event;
  const agent = {
    id: "termminal",
    name: "terminal",
    extensionId: new ExtensionIdentifier("test"),
    extensionPublisherId: "test",
    extensionDisplayName: "test",
    metadata: {},
    slashCommands: [{ name: "test", description: "test" }],
    disambiguation: [],
    locations: [ChatAgentLocation.fromRaw("terminal")],
    invoke: async () => {
      return {};
    }
  };
  const editorAgent = {
    id: "editor",
    name: "editor",
    extensionId: new ExtensionIdentifier("test-editor"),
    extensionPublisherId: "test-editor",
    extensionDisplayName: "test-editor",
    metadata: {},
    slashCommands: [{ name: "test", description: "test" }],
    locations: [ChatAgentLocation.fromRaw("editor")],
    disambiguation: [],
    invoke: async () => {
      return {};
    }
  };
  setup(async () => {
    const instantiationService = workbenchInstantiationService({}, store);
    const TerminalCtor = (await importAMDNodeModule(
      "@xterm/xterm",
      "lib/xterm.js"
    )).Terminal;
    xterm = store.add(new TerminalCtor());
    const shellIntegrationAddon = store.add(
      new ShellIntegrationAddon(
        "",
        true,
        void 0,
        new NullLogService()
      )
    );
    initialHintAddon = store.add(
      instantiationService.createInstance(
        InitialHintAddon,
        shellIntegrationAddon.capabilities,
        onDidChangeAgents
      )
    );
    store.add(initialHintAddon.onDidRequestCreateHint(() => eventCount++));
    const testContainer = document.createElement("div");
    getActiveDocument().body.append(testContainer);
    xterm.open(testContainer);
    xterm.loadAddon(shellIntegrationAddon);
    xterm.loadAddon(initialHintAddon);
  });
  suite("Chat providers", () => {
    test("hint is not shown when there are no chat providers", () => {
      eventCount = 0;
      xterm.focus();
      strictEqual(eventCount, 0);
    });
    test("hint is not shown when there is just an editor agent", () => {
      eventCount = 0;
      _onDidChangeAgents.fire(editorAgent);
      xterm.focus();
      strictEqual(eventCount, 0);
    });
    test("hint is shown when there is a terminal chat agent", () => {
      eventCount = 0;
      _onDidChangeAgents.fire(editorAgent);
      xterm.focus();
      strictEqual(eventCount, 0);
      _onDidChangeAgents.fire(agent);
      strictEqual(eventCount, 1);
    });
    test("hint is not shown again when another terminal chat agent is added if it has already shown", () => {
      eventCount = 0;
      _onDidChangeAgents.fire(agent);
      xterm.focus();
      strictEqual(eventCount, 1);
      _onDidChangeAgents.fire(agent);
      strictEqual(eventCount, 1);
    });
  });
  suite("Input", () => {
    test("hint is not shown when there has been input", () => {
      _onDidChangeAgents.fire(agent);
      xterm.writeln("data");
      setTimeout(() => {
        xterm.focus();
        strictEqual(eventCount, 0);
      }, 50);
    });
  });
});
