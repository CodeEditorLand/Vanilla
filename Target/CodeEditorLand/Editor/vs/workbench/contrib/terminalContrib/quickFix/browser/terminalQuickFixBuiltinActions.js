import { URI } from "../../../../../base/common/uri.js";
import { localize } from "../../../../../nls.js";
import {
  ITerminalCommandMatchResult,
  ITerminalQuickFixInternalOptions,
  ITerminalQuickFixTerminalCommandAction,
  TerminalQuickFixActionInternal,
  TerminalQuickFixType
} from "./quickFix.js";
const GitCommandLineRegex = /git/;
const GitPullOutputRegex = /and can be fast-forwarded/;
const GitPushCommandLineRegex = /git\s+push/;
const GitTwoDashesRegex = /error: did you mean `--(.+)` \(with two dashes\)\?/;
const GitSimilarOutputRegex = /(?:(most similar commands? (is|are)))/;
const FreePortOutputRegex = /(?:address already in use (?:0\.0\.0\.0|127\.0\.0\.1|localhost|::):|Unable to bind [^ ]*:|can't listen on port |listen EADDRINUSE [^ ]*:)(?<portNumber>\d{4,5})/;
const GitPushOutputRegex = /git push --set-upstream origin (?<branchName>[^\s]+)/;
const GitCreatePrOutputRegex = /remote:\s*(?<link>https:\/\/github\.com\/.+\/.+\/pull\/new\/.+)/;
const PwshGeneralErrorOutputRegex = /Suggestion \[General\]:/;
const PwshUnixCommandNotFoundErrorOutputRegex = /Suggestion \[cmd-not-found\]:/;
var QuickFixSource = /* @__PURE__ */ ((QuickFixSource2) => {
  QuickFixSource2["Builtin"] = "builtin";
  return QuickFixSource2;
})(QuickFixSource || {});
function gitSimilar() {
  return {
    id: "Git Similar",
    type: "internal",
    commandLineMatcher: GitCommandLineRegex,
    outputMatcher: {
      lineMatcher: GitSimilarOutputRegex,
      anchor: "bottom",
      offset: 0,
      length: 10
    },
    commandExitResult: "error",
    getQuickFixes: (matchResult) => {
      const regexMatch = matchResult.outputMatch?.regexMatch[0];
      if (!regexMatch || !matchResult.outputMatch) {
        return;
      }
      const actions = [];
      const startIndex = matchResult.outputMatch.outputLines.findIndex(
        (l) => l.includes(regexMatch)
      ) + 1;
      const results = matchResult.outputMatch.outputLines.map(
        (r) => r.trim()
      );
      for (let i = startIndex; i < results.length; i++) {
        const fixedCommand = results[i];
        if (fixedCommand) {
          actions.push({
            id: "Git Similar",
            type: TerminalQuickFixType.TerminalCommand,
            terminalCommand: matchResult.commandLine.replace(
              /git\s+[^\s]+/,
              () => `git ${fixedCommand}`
            ),
            shouldExecute: true,
            source: "builtin" /* Builtin */
          });
        }
      }
      return actions;
    }
  };
}
function gitPull() {
  return {
    id: "Git Pull",
    type: "internal",
    commandLineMatcher: GitCommandLineRegex,
    outputMatcher: {
      lineMatcher: GitPullOutputRegex,
      anchor: "bottom",
      offset: 0,
      length: 8
    },
    commandExitResult: "success",
    getQuickFixes: (matchResult) => {
      return {
        type: TerminalQuickFixType.TerminalCommand,
        id: "Git Pull",
        terminalCommand: `git pull`,
        shouldExecute: true,
        source: "builtin" /* Builtin */
      };
    }
  };
}
function gitTwoDashes() {
  return {
    id: "Git Two Dashes",
    type: "internal",
    commandLineMatcher: GitCommandLineRegex,
    outputMatcher: {
      lineMatcher: GitTwoDashesRegex,
      anchor: "bottom",
      offset: 0,
      length: 2
    },
    commandExitResult: "error",
    getQuickFixes: (matchResult) => {
      const problemArg = matchResult?.outputMatch?.regexMatch?.[1];
      if (!problemArg) {
        return;
      }
      return {
        type: TerminalQuickFixType.TerminalCommand,
        id: "Git Two Dashes",
        terminalCommand: matchResult.commandLine.replace(
          ` -${problemArg}`,
          () => ` --${problemArg}`
        ),
        shouldExecute: true,
        source: "builtin" /* Builtin */
      };
    }
  };
}
function freePort(runCallback) {
  return {
    id: "Free Port",
    type: "internal",
    commandLineMatcher: /.+/,
    outputMatcher: {
      lineMatcher: FreePortOutputRegex,
      anchor: "bottom",
      offset: 0,
      length: 30
    },
    commandExitResult: "error",
    getQuickFixes: (matchResult) => {
      const port = matchResult?.outputMatch?.regexMatch?.groups?.portNumber;
      if (!port) {
        return;
      }
      const label = localize("terminal.freePort", "Free port {0}", port);
      return {
        type: TerminalQuickFixType.Port,
        class: void 0,
        tooltip: label,
        id: "Free Port",
        label,
        enabled: true,
        source: "builtin" /* Builtin */,
        run: () => runCallback(port, matchResult.commandLine)
      };
    }
  };
}
function gitPushSetUpstream() {
  return {
    id: "Git Push Set Upstream",
    type: "internal",
    commandLineMatcher: GitPushCommandLineRegex,
    /**
    			Example output on Windows:
    			8: PS C:\Users\merogge\repos\xterm.js> git push
    			7: fatal: The current branch sdjfskdjfdslkjf has no upstream branch.
    			6: To push the current branch and set the remote as upstream, use
    			5:
    			4:	git push --set-upstream origin sdjfskdjfdslkjf
    			3:
    			2: To have this happen automatically for branches without a tracking
    			1: upstream, see 'push.autoSetupRemote' in 'git help config'.
    			0:
    
    			Example output on macOS:
    			5: meganrogge@Megans-MacBook-Pro xterm.js % git push
    			4: fatal: The current branch merogge/asjdkfsjdkfsdjf has no upstream branch.
    			3: To push the current branch and set the remote as upstream, use
    			2:
    			1:	git push --set-upstream origin merogge/asjdkfsjdkfsdjf
    			0:
    		 */
    outputMatcher: {
      lineMatcher: GitPushOutputRegex,
      anchor: "bottom",
      offset: 0,
      length: 8
    },
    commandExitResult: "error",
    getQuickFixes: (matchResult) => {
      const matches = matchResult.outputMatch;
      const commandToRun = "git push --set-upstream origin ${group:branchName}";
      if (!matches) {
        return;
      }
      const groups = matches.regexMatch.groups;
      if (!groups) {
        return;
      }
      const actions = [];
      let fixedCommand = commandToRun;
      for (const [key, value] of Object.entries(groups)) {
        const varToResolve = `\${group:${key}}`;
        if (!commandToRun.includes(varToResolve)) {
          return [];
        }
        fixedCommand = fixedCommand.replaceAll(
          varToResolve,
          () => value
        );
      }
      if (fixedCommand) {
        actions.push({
          type: TerminalQuickFixType.TerminalCommand,
          id: "Git Push Set Upstream",
          terminalCommand: fixedCommand,
          shouldExecute: true,
          source: "builtin" /* Builtin */
        });
        return actions;
      }
      return;
    }
  };
}
function gitCreatePr() {
  return {
    id: "Git Create Pr",
    type: "internal",
    commandLineMatcher: GitPushCommandLineRegex,
    // Example output:
    // ...
    // 10: remote:
    // 9:  remote: Create a pull request for 'my_branch' on GitHub by visiting:
    // 8:  remote:      https://github.com/microsoft/vscode/pull/new/my_branch
    // 7:  remote:
    // 6:  remote: GitHub found x vulnerabilities on microsoft/vscode's default branch (...). To find out more, visit:
    // 5:  remote:      https://github.com/microsoft/vscode/security/dependabot
    // 4:  remote:
    // 3:  To https://github.com/microsoft/vscode
    // 2:  * [new branch]              my_branch -> my_branch
    // 1:  Branch 'my_branch' set up to track remote branch 'my_branch' from 'origin'.
    // 0:
    outputMatcher: {
      lineMatcher: GitCreatePrOutputRegex,
      anchor: "bottom",
      offset: 4,
      // ~6 should only be needed here for security alerts, but the git provider can customize
      // the text, so use 12 to be safe.
      length: 12
    },
    commandExitResult: "success",
    getQuickFixes: (matchResult) => {
      const link = matchResult?.outputMatch?.regexMatch?.groups?.link?.trimEnd();
      if (!link) {
        return;
      }
      const label = localize("terminal.createPR", "Create PR {0}", link);
      return {
        id: "Git Create Pr",
        label,
        enabled: true,
        type: TerminalQuickFixType.Opener,
        uri: URI.parse(link),
        source: "builtin" /* Builtin */
      };
    }
  };
}
function pwshGeneralError() {
  return {
    id: "Pwsh General Error",
    type: "internal",
    commandLineMatcher: /.+/,
    outputMatcher: {
      lineMatcher: PwshGeneralErrorOutputRegex,
      anchor: "bottom",
      offset: 0,
      length: 10
    },
    commandExitResult: "error",
    getQuickFixes: (matchResult) => {
      const lines = matchResult.outputMatch?.regexMatch.input?.split("\n");
      if (!lines) {
        return;
      }
      let i = 0;
      let inFeedbackProvider = false;
      for (; i < lines.length; i++) {
        if (lines[i].match(PwshGeneralErrorOutputRegex)) {
          inFeedbackProvider = true;
          break;
        }
      }
      if (!inFeedbackProvider) {
        return;
      }
      const suggestions = lines[i + 1].match(/The most similar commands are: (?<values>.+)./)?.groups?.values?.split(", ");
      if (!suggestions) {
        return;
      }
      const result = [];
      for (const suggestion of suggestions) {
        result.push({
          id: "Pwsh General Error",
          type: TerminalQuickFixType.TerminalCommand,
          terminalCommand: suggestion,
          source: "builtin" /* Builtin */
        });
      }
      return result;
    }
  };
}
function pwshUnixCommandNotFoundError() {
  return {
    id: "Unix Command Not Found",
    type: "internal",
    commandLineMatcher: /.+/,
    outputMatcher: {
      lineMatcher: PwshUnixCommandNotFoundErrorOutputRegex,
      anchor: "bottom",
      offset: 0,
      length: 10
    },
    commandExitResult: "error",
    getQuickFixes: (matchResult) => {
      const lines = matchResult.outputMatch?.regexMatch.input?.split("\n");
      if (!lines) {
        return;
      }
      let i = 0;
      let inFeedbackProvider = false;
      for (; i < lines.length; i++) {
        if (lines[i].match(PwshUnixCommandNotFoundErrorOutputRegex)) {
          inFeedbackProvider = true;
          break;
        }
      }
      if (!inFeedbackProvider) {
        return;
      }
      const result = [];
      let inSuggestions = false;
      for (; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.length === 0) {
          break;
        }
        const installCommand = line.match(
          /You also have .+ installed, you can run '(?<command>.+)' instead./
        )?.groups?.command;
        if (installCommand) {
          result.push({
            id: "Pwsh Unix Command Not Found Error",
            type: TerminalQuickFixType.TerminalCommand,
            terminalCommand: installCommand,
            source: "builtin" /* Builtin */
          });
          inSuggestions = false;
          continue;
        }
        if (line.match(
          /Command '.+' not found, but can be installed with:/
        )) {
          inSuggestions = true;
          continue;
        }
        if (inSuggestions) {
          result.push({
            id: "Pwsh Unix Command Not Found Error",
            type: TerminalQuickFixType.TerminalCommand,
            terminalCommand: line.trim(),
            source: "builtin" /* Builtin */
          });
        }
      }
      return result;
    }
  };
}
export {
  FreePortOutputRegex,
  GitCommandLineRegex,
  GitCreatePrOutputRegex,
  GitPullOutputRegex,
  GitPushCommandLineRegex,
  GitPushOutputRegex,
  GitSimilarOutputRegex,
  GitTwoDashesRegex,
  PwshGeneralErrorOutputRegex,
  PwshUnixCommandNotFoundErrorOutputRegex,
  QuickFixSource,
  freePort,
  gitCreatePr,
  gitPull,
  gitPushSetUpstream,
  gitSimilar,
  gitTwoDashes,
  pwshGeneralError,
  pwshUnixCommandNotFoundError
};
