import { strictEqual } from "assert";
import { importAMDNodeModule } from "../../../../../../amdX.js";
import { Event } from "../../../../../../base/common/event.js";
import { isWindows } from "../../../../../../base/common/platform.js";
import { URI } from "../../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { TestCommandService } from "../../../../../../editor/test/browser/editorTestServices.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../../platform/configuration/test/common/testConfigurationService.js";
import { ContextMenuService } from "../../../../../../platform/contextview/browser/contextMenuService.js";
import { IContextMenuService } from "../../../../../../platform/contextview/browser/contextView.js";
import { TestInstantiationService } from "../../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { ILabelService } from "../../../../../../platform/label/common/label.js";
import {
  ILogService,
  NullLogService
} from "../../../../../../platform/log/common/log.js";
import { IOpenerService } from "../../../../../../platform/opener/common/opener.js";
import { IStorageService } from "../../../../../../platform/storage/common/storage.js";
import {
  TerminalCapability
} from "../../../../../../platform/terminal/common/capabilities/capabilities.js";
import { CommandDetectionCapability } from "../../../../../../platform/terminal/common/capabilities/commandDetectionCapability.js";
import { TerminalCapabilityStore } from "../../../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js";
import { TestStorageService } from "../../../../../test/common/workbenchTestServices.js";
import { ITerminalQuickFixService } from "../../browser/quickFix.js";
import {
  TerminalQuickFixAddon,
  getQuickFixesForCommand
} from "../../browser/quickFixAddon.js";
import {
  FreePortOutputRegex,
  GitCreatePrOutputRegex,
  GitPullOutputRegex,
  GitPushOutputRegex,
  GitSimilarOutputRegex,
  GitTwoDashesRegex,
  PwshGeneralErrorOutputRegex,
  PwshUnixCommandNotFoundErrorOutputRegex,
  freePort,
  gitCreatePr,
  gitPull,
  gitPushSetUpstream,
  gitSimilar,
  gitTwoDashes,
  pwshGeneralError,
  pwshUnixCommandNotFoundError
} from "../../browser/terminalQuickFixBuiltinActions.js";
suite("QuickFixAddon", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let quickFixAddon;
  let commandDetection;
  let commandService;
  let openerService;
  let labelService;
  let terminal;
  let instantiationService;
  setup(async () => {
    instantiationService = store.add(new TestInstantiationService());
    const TerminalCtor = (await importAMDNodeModule(
      "@xterm/xterm",
      "lib/xterm.js"
    )).Terminal;
    terminal = store.add(
      new TerminalCtor({
        allowProposedApi: true,
        cols: 80,
        rows: 30
      })
    );
    instantiationService.stub(
      IStorageService,
      store.add(new TestStorageService())
    );
    instantiationService.stub(ITerminalQuickFixService, {
      onDidRegisterProvider: Event.None,
      onDidUnregisterProvider: Event.None,
      onDidRegisterCommandSelector: Event.None,
      extensionQuickFixes: Promise.resolve([])
    });
    instantiationService.stub(
      IConfigurationService,
      new TestConfigurationService()
    );
    labelService = instantiationService.stub(
      ILabelService,
      {}
    );
    const capabilities = store.add(new TerminalCapabilityStore());
    instantiationService.stub(ILogService, new NullLogService());
    commandDetection = store.add(
      instantiationService.createInstance(
        CommandDetectionCapability,
        terminal
      )
    );
    capabilities.add(TerminalCapability.CommandDetection, commandDetection);
    instantiationService.stub(
      IContextMenuService,
      store.add(instantiationService.createInstance(ContextMenuService))
    );
    openerService = instantiationService.stub(
      IOpenerService,
      {}
    );
    commandService = new TestCommandService(instantiationService);
    quickFixAddon = instantiationService.createInstance(
      TerminalQuickFixAddon,
      [],
      capabilities
    );
    terminal.loadAddon(quickFixAddon);
  });
  suite("registerCommandFinishedListener & getMatchActions", () => {
    suite("gitSimilarCommand", () => {
      const expectedMap = /* @__PURE__ */ new Map();
      const command = `git sttatus`;
      let output = `git: 'sttatus' is not a git command. See 'git --help'.

			The most similar command is
			status`;
      const exitCode = 1;
      const actions = [
        {
          id: "Git Similar",
          enabled: true,
          label: "Run: git status",
          tooltip: "Run: git status",
          command: "git status"
        }
      ];
      const outputLines = output.split("\n");
      setup(() => {
        const command2 = gitSimilar();
        expectedMap.set(command2.commandLineMatcher.toString(), [
          command2
        ]);
        quickFixAddon.registerCommandFinishedListener(command2);
      });
      suite("returns undefined when", () => {
        test("output does not match", async () => {
          strictEqual(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                command,
                `invalid output`,
                GitSimilarOutputRegex,
                exitCode,
                [`invalid output`]
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            void 0
          );
        });
        test("command does not match", async () => {
          strictEqual(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                `gt sttatus`,
                output,
                GitSimilarOutputRegex,
                exitCode,
                outputLines
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            void 0
          );
        });
      });
      suite("returns actions when", () => {
        test("expected unix exit code", async () => {
          assertMatchOptions(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                command,
                output,
                GitSimilarOutputRegex,
                exitCode,
                outputLines
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            actions
          );
        });
        test("matching exit status", async () => {
          assertMatchOptions(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                command,
                output,
                GitSimilarOutputRegex,
                2,
                outputLines
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            actions
          );
        });
      });
      suite("returns match", () => {
        test("returns match", async () => {
          assertMatchOptions(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                command,
                output,
                GitSimilarOutputRegex,
                exitCode,
                outputLines
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            actions
          );
        });
        test("returns multiple match", async () => {
          output = `git: 'pu' is not a git command. See 'git --help'.
				The most similar commands are
						pull
						push`;
          const actions2 = [
            {
              id: "Git Similar",
              enabled: true,
              label: "Run: git pull",
              tooltip: "Run: git pull",
              command: "git pull"
            },
            {
              id: "Git Similar",
              enabled: true,
              label: "Run: git push",
              tooltip: "Run: git push",
              command: "git push"
            }
          ];
          assertMatchOptions(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                "git pu",
                output,
                GitSimilarOutputRegex,
                exitCode,
                output.split("\n")
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            actions2
          );
        });
        test("passes any arguments through", async () => {
          output = `git: 'checkoutt' is not a git command. See 'git --help'.
				The most similar commands are
						checkout`;
          assertMatchOptions(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                "git checkoutt .",
                output,
                GitSimilarOutputRegex,
                exitCode,
                output.split("\n")
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            [
              {
                id: "Git Similar",
                enabled: true,
                label: "Run: git checkout .",
                tooltip: "Run: git checkout .",
                command: "git checkout ."
              }
            ]
          );
        });
      });
    });
    suite("gitTwoDashes", () => {
      const expectedMap = /* @__PURE__ */ new Map();
      const command = `git add . -all`;
      const output = "error: did you mean `--all` (with two dashes)?";
      const exitCode = 1;
      const actions = [
        {
          id: "Git Two Dashes",
          enabled: true,
          label: "Run: git add . --all",
          tooltip: "Run: git add . --all",
          command: "git add . --all"
        }
      ];
      setup(() => {
        const command2 = gitTwoDashes();
        expectedMap.set(command2.commandLineMatcher.toString(), [
          command2
        ]);
        quickFixAddon.registerCommandFinishedListener(command2);
      });
      suite("returns undefined when", () => {
        test("output does not match", async () => {
          strictEqual(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                command,
                `invalid output`,
                GitTwoDashesRegex,
                exitCode
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            void 0
          );
        });
        test("command does not match", async () => {
          strictEqual(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                `gt sttatus`,
                output,
                GitTwoDashesRegex,
                exitCode
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            void 0
          );
        });
      });
      suite("returns actions when", () => {
        test("expected unix exit code", async () => {
          assertMatchOptions(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                command,
                output,
                GitTwoDashesRegex,
                exitCode
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            actions
          );
        });
        test("matching exit status", async () => {
          assertMatchOptions(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                command,
                output,
                GitTwoDashesRegex,
                2
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            actions
          );
        });
      });
    });
    suite("gitPull", () => {
      const expectedMap = /* @__PURE__ */ new Map();
      const command = `git checkout vnext`;
      const output = "Already on 'vnext' \n Your branch is behind 'origin/vnext' by 1 commit, and can be fast-forwarded.";
      const exitCode = 0;
      const actions = [
        {
          id: "Git Pull",
          enabled: true,
          label: "Run: git pull",
          tooltip: "Run: git pull",
          command: "git pull"
        }
      ];
      setup(() => {
        const command2 = gitPull();
        expectedMap.set(command2.commandLineMatcher.toString(), [
          command2
        ]);
        quickFixAddon.registerCommandFinishedListener(command2);
      });
      suite("returns undefined when", () => {
        test("output does not match", async () => {
          strictEqual(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                command,
                `invalid output`,
                GitPullOutputRegex,
                exitCode
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            void 0
          );
        });
        test("command does not match", async () => {
          strictEqual(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                `gt add`,
                output,
                GitPullOutputRegex,
                exitCode
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            void 0
          );
        });
        test("exit code does not match", async () => {
          strictEqual(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                command,
                output,
                GitPullOutputRegex,
                2
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            void 0
          );
        });
      });
      suite("returns actions when", () => {
        test("matching exit status, command, ouput", async () => {
          assertMatchOptions(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                command,
                output,
                GitPullOutputRegex,
                exitCode
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            actions
          );
        });
      });
    });
    if (!isWindows) {
      suite("freePort", () => {
        const expectedMap = /* @__PURE__ */ new Map();
        const portCommand = `yarn start dev`;
        const output = `yarn run v1.22.17
			warning ../../package.json: No license field
			Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
				at Server.setupListenHandle [as _listen2] (node:net:1315:16)
				at listenInCluster (node:net:1363:12)
				at doListen (node:net:1501:7)
				at processTicksAndRejections (node:internal/process/task_queues:84:21)
			Emitted 'error' event on WebSocketServer instance at:
				at Server.emit (node:events:394:28)
				at emitErrorNT (node:net:1342:8)
				at processTicksAndRejections (node:internal/process/task_queues:83:21) {
			}
			error Command failed with exit code 1.
			info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.`;
        const actionOptions = [
          {
            id: "Free Port",
            label: "Free port 3000",
            run: true,
            tooltip: "Free port 3000",
            enabled: true
          }
        ];
        setup(() => {
          const command = freePort(() => Promise.resolve());
          expectedMap.set(command.commandLineMatcher.toString(), [
            command
          ]);
          quickFixAddon.registerCommandFinishedListener(command);
        });
        suite("returns undefined when", () => {
          test("output does not match", async () => {
            strictEqual(
              await getQuickFixesForCommand(
                [],
                terminal,
                createCommand(
                  portCommand,
                  `invalid output`,
                  FreePortOutputRegex
                ),
                expectedMap,
                commandService,
                openerService,
                labelService
              ),
              void 0
            );
          });
        });
        test("returns actions", async () => {
          assertMatchOptions(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                portCommand,
                output,
                FreePortOutputRegex
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            actionOptions
          );
        });
      });
    }
    suite("gitPushSetUpstream", () => {
      const expectedMap = /* @__PURE__ */ new Map();
      const command = `git push`;
      const output = `fatal: The current branch test22 has no upstream branch.
			To push the current branch and set the remote as upstream, use

				git push --set-upstream origin test22`;
      const exitCode = 128;
      const actions = [
        {
          id: "Git Push Set Upstream",
          enabled: true,
          label: "Run: git push --set-upstream origin test22",
          tooltip: "Run: git push --set-upstream origin test22",
          command: "git push --set-upstream origin test22"
        }
      ];
      setup(() => {
        const command2 = gitPushSetUpstream();
        expectedMap.set(command2.commandLineMatcher.toString(), [
          command2
        ]);
        quickFixAddon.registerCommandFinishedListener(command2);
      });
      suite("returns undefined when", () => {
        test("output does not match", async () => {
          strictEqual(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                command,
                `invalid output`,
                GitPushOutputRegex,
                exitCode
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            void 0
          );
        });
        test("command does not match", async () => {
          strictEqual(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                `git status`,
                output,
                GitPushOutputRegex,
                exitCode
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            void 0
          );
        });
      });
      suite("returns actions when", () => {
        test("expected unix exit code", async () => {
          assertMatchOptions(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                command,
                output,
                GitPushOutputRegex,
                exitCode
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            actions
          );
        });
        test("matching exit status", async () => {
          assertMatchOptions(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                command,
                output,
                GitPushOutputRegex,
                2
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            actions
          );
        });
      });
    });
    suite("gitCreatePr", () => {
      const expectedMap = /* @__PURE__ */ new Map();
      const command = `git push`;
      const output = `Total 0 (delta 0), reused 0 (delta 0), pack-reused 0
			remote:
			remote: Create a pull request for 'test22' on GitHub by visiting:
			remote:      https://github.com/meganrogge/xterm.js/pull/new/test22
			remote:
			To https://github.com/meganrogge/xterm.js
			 * [new branch]        test22 -> test22
			Branch 'test22' set up to track remote branch 'test22' from 'origin'. `;
      const exitCode = 0;
      const actions = [
        {
          id: "Git Create Pr",
          enabled: true,
          label: "Open: https://github.com/meganrogge/xterm.js/pull/new/test22",
          tooltip: "Open: https://github.com/meganrogge/xterm.js/pull/new/test22",
          uri: URI.parse(
            "https://github.com/meganrogge/xterm.js/pull/new/test22"
          )
        }
      ];
      setup(() => {
        const command2 = gitCreatePr();
        expectedMap.set(command2.commandLineMatcher.toString(), [
          command2
        ]);
        quickFixAddon.registerCommandFinishedListener(command2);
      });
      suite("returns undefined when", () => {
        test("output does not match", async () => {
          strictEqual(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                command,
                `invalid output`,
                GitCreatePrOutputRegex,
                exitCode
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            void 0
          );
        });
        test("command does not match", async () => {
          strictEqual(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                `git status`,
                output,
                GitCreatePrOutputRegex,
                exitCode
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            void 0
          );
        });
        test("failure exit status", async () => {
          strictEqual(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                command,
                output,
                GitCreatePrOutputRegex,
                2
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            void 0
          );
        });
      });
      suite("returns actions when", () => {
        test("expected unix exit code", async () => {
          assertMatchOptions(
            await getQuickFixesForCommand(
              [],
              terminal,
              createCommand(
                command,
                output,
                GitCreatePrOutputRegex,
                exitCode
              ),
              expectedMap,
              commandService,
              openerService,
              labelService
            ),
            actions
          );
        });
      });
    });
  });
  suite("gitPush - multiple providers", () => {
    const expectedMap = /* @__PURE__ */ new Map();
    const command = `git push`;
    const output = `fatal: The current branch test22 has no upstream branch.
		To push the current branch and set the remote as upstream, use

			git push --set-upstream origin test22`;
    const exitCode = 128;
    const actions = [
      {
        id: "Git Push Set Upstream",
        enabled: true,
        label: "Run: git push --set-upstream origin test22",
        tooltip: "Run: git push --set-upstream origin test22",
        command: "git push --set-upstream origin test22"
      }
    ];
    setup(() => {
      const pushCommand = gitPushSetUpstream();
      const prCommand = gitCreatePr();
      quickFixAddon.registerCommandFinishedListener(prCommand);
      expectedMap.set(pushCommand.commandLineMatcher.toString(), [
        pushCommand,
        prCommand
      ]);
    });
    suite("returns undefined when", () => {
      test("output does not match", async () => {
        strictEqual(
          await getQuickFixesForCommand(
            [],
            terminal,
            createCommand(
              command,
              `invalid output`,
              GitPushOutputRegex,
              exitCode
            ),
            expectedMap,
            commandService,
            openerService,
            labelService
          ),
          void 0
        );
      });
      test("command does not match", async () => {
        strictEqual(
          await getQuickFixesForCommand(
            [],
            terminal,
            createCommand(
              `git status`,
              output,
              GitPushOutputRegex,
              exitCode
            ),
            expectedMap,
            commandService,
            openerService,
            labelService
          ),
          void 0
        );
      });
    });
    suite("returns actions when", () => {
      test("expected unix exit code", async () => {
        assertMatchOptions(
          await getQuickFixesForCommand(
            [],
            terminal,
            createCommand(
              command,
              output,
              GitPushOutputRegex,
              exitCode
            ),
            expectedMap,
            commandService,
            openerService,
            labelService
          ),
          actions
        );
      });
      test("matching exit status", async () => {
        assertMatchOptions(
          await getQuickFixesForCommand(
            [],
            terminal,
            createCommand(command, output, GitPushOutputRegex, 2),
            expectedMap,
            commandService,
            openerService,
            labelService
          ),
          actions
        );
      });
    });
  });
  suite("pwsh feedback providers", () => {
    suite("General", () => {
      const expectedMap = /* @__PURE__ */ new Map();
      const command = `not important`;
      const output = [
        `...`,
        ``,
        `Suggestion [General]:`,
        `  The most similar commands are: python3, python3m, pamon, python3.6, rtmon, echo, pushd, etsn, pwsh, pwconv.`,
        ``,
        `Suggestion [cmd-not-found]:`,
        `  Command 'python' not found, but can be installed with:`,
        `  sudo apt install python3`,
        `  sudo apt install python`,
        `  sudo apt install python-minimal`,
        `  You also have python3 installed, you can run 'python3' instead.'`,
        ``
      ].join("\n");
      const exitCode = 128;
      const actions = [
        "python3",
        "python3m",
        "pamon",
        "python3.6",
        "rtmon",
        "echo",
        "pushd",
        "etsn",
        "pwsh",
        "pwconv"
      ].map((command2) => {
        return {
          id: "Pwsh General Error",
          enabled: true,
          label: `Run: ${command2}`,
          tooltip: `Run: ${command2}`,
          command: command2
        };
      });
      setup(() => {
        const pushCommand = pwshGeneralError();
        quickFixAddon.registerCommandFinishedListener(pushCommand);
        expectedMap.set(pushCommand.commandLineMatcher.toString(), [
          pushCommand
        ]);
      });
      test("returns undefined when output does not match", async () => {
        strictEqual(
          await getQuickFixesForCommand(
            [],
            terminal,
            createCommand(
              command,
              `invalid output`,
              PwshGeneralErrorOutputRegex,
              exitCode
            ),
            expectedMap,
            commandService,
            openerService,
            labelService
          ),
          void 0
        );
      });
      test("returns actions when output matches", async () => {
        assertMatchOptions(
          await getQuickFixesForCommand(
            [],
            terminal,
            createCommand(
              command,
              output,
              PwshGeneralErrorOutputRegex,
              exitCode
            ),
            expectedMap,
            commandService,
            openerService,
            labelService
          ),
          actions
        );
      });
    });
    suite("Unix cmd-not-found", () => {
      const expectedMap = /* @__PURE__ */ new Map();
      const command = `not important`;
      const output = [
        `...`,
        ``,
        `Suggestion [General]`,
        `  The most similar commands are: python3, python3m, pamon, python3.6, rtmon, echo, pushd, etsn, pwsh, pwconv.`,
        ``,
        `Suggestion [cmd-not-found]:`,
        `  Command 'python' not found, but can be installed with:`,
        `  sudo apt install python3`,
        `  sudo apt install python`,
        `  sudo apt install python-minimal`,
        `  You also have python3 installed, you can run 'python3' instead.'`,
        ``
      ].join("\n");
      const exitCode = 128;
      const actions = [
        "sudo apt install python3",
        "sudo apt install python",
        "sudo apt install python-minimal",
        "python3"
      ].map((command2) => {
        return {
          id: "Pwsh Unix Command Not Found Error",
          enabled: true,
          label: `Run: ${command2}`,
          tooltip: `Run: ${command2}`,
          command: command2
        };
      });
      setup(() => {
        const pushCommand = pwshUnixCommandNotFoundError();
        quickFixAddon.registerCommandFinishedListener(pushCommand);
        expectedMap.set(pushCommand.commandLineMatcher.toString(), [
          pushCommand
        ]);
      });
      test("returns undefined when output does not match", async () => {
        strictEqual(
          await getQuickFixesForCommand(
            [],
            terminal,
            createCommand(
              command,
              `invalid output`,
              PwshUnixCommandNotFoundErrorOutputRegex,
              exitCode
            ),
            expectedMap,
            commandService,
            openerService,
            labelService
          ),
          void 0
        );
      });
      test("returns actions when output matches", async () => {
        assertMatchOptions(
          await getQuickFixesForCommand(
            [],
            terminal,
            createCommand(
              command,
              output,
              PwshUnixCommandNotFoundErrorOutputRegex,
              exitCode
            ),
            expectedMap,
            commandService,
            openerService,
            labelService
          ),
          actions
        );
      });
    });
  });
});
function createCommand(command, output, outputMatcher, exitCode, outputLines) {
  return {
    cwd: "",
    commandStartLineContent: "",
    markProperties: {},
    executedX: void 0,
    startX: void 0,
    command,
    isTrusted: true,
    exitCode,
    getOutput: () => {
      return output;
    },
    getOutputMatch: (_matcher) => {
      if (outputMatcher) {
        const regexMatch = output.match(outputMatcher) ?? void 0;
        if (regexMatch) {
          return outputLines ? { regexMatch, outputLines } : { regexMatch, outputLines: [] };
        }
      }
      return void 0;
    },
    timestamp: Date.now(),
    hasOutput: () => !!output
  };
}
function assertMatchOptions(actual, expected) {
  strictEqual(actual?.length, expected.length);
  for (let i = 0; i < expected.length; i++) {
    const expectedItem = expected[i];
    const actualItem = actual[i];
    strictEqual(actualItem.id, expectedItem.id, `ID`);
    strictEqual(actualItem.enabled, expectedItem.enabled, `enabled`);
    strictEqual(actualItem.label, expectedItem.label, `label`);
    strictEqual(actualItem.tooltip, expectedItem.tooltip, `tooltip`);
    if (expectedItem.command) {
      strictEqual(actualItem.command, expectedItem.command);
    }
    if (expectedItem.uri) {
      strictEqual(
        actualItem.uri.toString(),
        expectedItem.uri.toString()
      );
    }
  }
}
