import minimist from "minimist";
import { isWindows } from "../../../base/common/platform.js";
import { localize } from "../../../nls.js";
const helpCategories = {
  o: localize("optionsUpperCase", "Options"),
  e: localize("extensionsManagement", "Extensions Management"),
  t: localize("troubleshooting", "Troubleshooting")
};
const NATIVE_CLI_COMMANDS = ["tunnel", "serve-web"];
const OPTIONS = {
  tunnel: {
    type: "subcommand",
    description: "Make the current machine accessible from vscode.dev or other machines through a secure tunnel",
    options: {
      "cli-data-dir": {
        type: "string",
        args: "dir",
        description: localize(
          "cliDataDir",
          "Directory where CLI metadata should be stored."
        )
      },
      "disable-telemetry": { type: "boolean" },
      "telemetry-level": { type: "string" },
      user: {
        type: "subcommand",
        options: {
          login: {
            type: "subcommand",
            options: {
              provider: { type: "string" },
              "access-token": { type: "string" }
            }
          }
        }
      }
    }
  },
  "serve-web": {
    type: "subcommand",
    description: "Run a server that displays the editor UI in browsers.",
    options: {
      "cli-data-dir": {
        type: "string",
        args: "dir",
        description: localize(
          "cliDataDir",
          "Directory where CLI metadata should be stored."
        )
      },
      "disable-telemetry": { type: "boolean" },
      "telemetry-level": { type: "string" }
    }
  },
  diff: {
    type: "boolean",
    cat: "o",
    alias: "d",
    args: ["file", "file"],
    description: localize("diff", "Compare two files with each other.")
  },
  merge: {
    type: "boolean",
    cat: "o",
    alias: "m",
    args: ["path1", "path2", "base", "result"],
    description: localize(
      "merge",
      "Perform a three-way merge by providing paths for two modified versions of a file, the common origin of both modified versions and the output file to save merge results."
    )
  },
  add: {
    type: "boolean",
    cat: "o",
    alias: "a",
    args: "folder",
    description: localize(
      "add",
      "Add folder(s) to the last active window."
    )
  },
  goto: {
    type: "boolean",
    cat: "o",
    alias: "g",
    args: "file:line[:character]",
    description: localize(
      "goto",
      "Open a file at the path on the specified line and character position."
    )
  },
  "new-window": {
    type: "boolean",
    cat: "o",
    alias: "n",
    description: localize("newWindow", "Force to open a new window.")
  },
  "reuse-window": {
    type: "boolean",
    cat: "o",
    alias: "r",
    description: localize(
      "reuseWindow",
      "Force to open a file or folder in an already opened window."
    )
  },
  wait: {
    type: "boolean",
    cat: "o",
    alias: "w",
    description: localize(
      "wait",
      "Wait for the files to be closed before returning."
    )
  },
  waitMarkerFilePath: { type: "string" },
  locale: {
    type: "string",
    cat: "o",
    args: "locale",
    description: localize(
      "locale",
      "The locale to use (e.g. en-US or zh-TW)."
    )
  },
  "user-data-dir": {
    type: "string",
    cat: "o",
    args: "dir",
    description: localize(
      "userDataDir",
      "Specifies the directory that user data is kept in. Can be used to open multiple distinct instances of Code."
    )
  },
  profile: {
    type: "string",
    cat: "o",
    args: "profileName",
    description: localize(
      "profileName",
      "Opens the provided folder or workspace with the given profile and associates the profile with the workspace. If the profile does not exist, a new empty one is created."
    )
  },
  help: {
    type: "boolean",
    cat: "o",
    alias: "h",
    description: localize("help", "Print usage.")
  },
  "extensions-dir": {
    type: "string",
    deprecates: ["extensionHomePath"],
    cat: "e",
    args: "dir",
    description: localize(
      "extensionHomePath",
      "Set the root path for extensions."
    )
  },
  "extensions-download-dir": { type: "string" },
  "builtin-extensions-dir": { type: "string" },
  "list-extensions": {
    type: "boolean",
    cat: "e",
    description: localize(
      "listExtensions",
      "List the installed extensions."
    )
  },
  "show-versions": {
    type: "boolean",
    cat: "e",
    description: localize(
      "showVersions",
      "Show versions of installed extensions, when using --list-extensions."
    )
  },
  category: {
    type: "string",
    allowEmptyValue: true,
    cat: "e",
    description: localize(
      "category",
      "Filters installed extensions by provided category, when using --list-extensions."
    ),
    args: "category"
  },
  "install-extension": {
    type: "string[]",
    cat: "e",
    args: "ext-id | path",
    description: localize(
      "installExtension",
      "Installs or updates an extension. The argument is either an extension id or a path to a VSIX. The identifier of an extension is '${publisher}.${name}'. Use '--force' argument to update to latest version. To install a specific version provide '@${version}'. For example: 'vscode.csharp@1.2.3'."
    )
  },
  "pre-release": {
    type: "boolean",
    cat: "e",
    description: localize(
      "install prerelease",
      "Installs the pre-release version of the extension, when using --install-extension"
    )
  },
  "uninstall-extension": {
    type: "string[]",
    cat: "e",
    args: "ext-id",
    description: localize("uninstallExtension", "Uninstalls an extension.")
  },
  "update-extensions": {
    type: "boolean",
    cat: "e",
    description: localize(
      "updateExtensions",
      "Update the installed extensions."
    )
  },
  "enable-proposed-api": {
    type: "string[]",
    allowEmptyValue: true,
    cat: "e",
    args: "ext-id",
    description: localize(
      "experimentalApis",
      "Enables proposed API features for extensions. Can receive one or more extension IDs to enable individually."
    )
  },
  version: {
    type: "boolean",
    cat: "t",
    alias: "v",
    description: localize("version", "Print version.")
  },
  verbose: {
    type: "boolean",
    cat: "t",
    global: true,
    description: localize(
      "verbose",
      "Print verbose output (implies --wait)."
    )
  },
  log: {
    type: "string[]",
    cat: "t",
    args: "level",
    global: true,
    description: localize(
      "log",
      "Log level to use. Default is 'info'. Allowed values are 'critical', 'error', 'warn', 'info', 'debug', 'trace', 'off'. You can also configure the log level of an extension by passing extension id and log level in the following format: '${publisher}.${name}:${logLevel}'. For example: 'vscode.csharp:trace'. Can receive one or more such entries."
    )
  },
  status: {
    type: "boolean",
    alias: "s",
    cat: "t",
    description: localize(
      "status",
      "Print process usage and diagnostics information."
    )
  },
  "prof-startup": {
    type: "boolean",
    cat: "t",
    description: localize(
      "prof-startup",
      "Run CPU profiler during startup."
    )
  },
  "prof-append-timers": { type: "string" },
  "prof-duration-markers": { type: "string[]" },
  "prof-duration-markers-file": { type: "string" },
  "no-cached-data": { type: "boolean" },
  "prof-startup-prefix": { type: "string" },
  "prof-v8-extensions": { type: "boolean" },
  "disable-extensions": {
    type: "boolean",
    deprecates: ["disableExtensions"],
    cat: "t",
    description: localize(
      "disableExtensions",
      "Disable all installed extensions. This option is not persisted and is effective only when the command opens a new window."
    )
  },
  "disable-extension": {
    type: "string[]",
    cat: "t",
    args: "ext-id",
    description: localize(
      "disableExtension",
      "Disable the provided extension. This option is not persisted and is effective only when the command opens a new window."
    )
  },
  sync: {
    type: "string",
    cat: "t",
    description: localize("turn sync", "Turn sync on or off."),
    args: ["on | off"]
  },
  "inspect-extensions": {
    type: "string",
    allowEmptyValue: true,
    deprecates: ["debugPluginHost"],
    args: "port",
    cat: "t",
    description: localize(
      "inspect-extensions",
      "Allow debugging and profiling of extensions. Check the developer tools for the connection URI."
    )
  },
  "inspect-brk-extensions": {
    type: "string",
    allowEmptyValue: true,
    deprecates: ["debugBrkPluginHost"],
    args: "port",
    cat: "t",
    description: localize(
      "inspect-brk-extensions",
      "Allow debugging and profiling of extensions with the extension host being paused after start. Check the developer tools for the connection URI."
    )
  },
  "disable-lcd-text": {
    type: "boolean",
    cat: "t",
    description: localize("disableLCDText", "Disable LCD font rendering.")
  },
  "disable-gpu": {
    type: "boolean",
    cat: "t",
    description: localize(
      "disableGPU",
      "Disable GPU hardware acceleration."
    )
  },
  "disable-chromium-sandbox": {
    type: "boolean",
    cat: "t",
    description: localize(
      "disableChromiumSandbox",
      "Use this option only when there is requirement to launch the application as sudo user on Linux or when running as an elevated user in an applocker environment on Windows."
    )
  },
  sandbox: { type: "boolean" },
  telemetry: {
    type: "boolean",
    cat: "t",
    description: localize(
      "telemetry",
      "Shows all telemetry events which VS code collects."
    )
  },
  remote: { type: "string", allowEmptyValue: true },
  "folder-uri": { type: "string[]", cat: "o", args: "uri" },
  "file-uri": { type: "string[]", cat: "o", args: "uri" },
  "locate-extension": { type: "string[]" },
  extensionDevelopmentPath: { type: "string[]" },
  extensionDevelopmentKind: { type: "string[]" },
  extensionTestsPath: { type: "string" },
  extensionEnvironment: { type: "string" },
  debugId: { type: "string" },
  debugRenderer: { type: "boolean" },
  "inspect-ptyhost": { type: "string", allowEmptyValue: true },
  "inspect-brk-ptyhost": { type: "string", allowEmptyValue: true },
  "inspect-search": {
    type: "string",
    deprecates: ["debugSearch"],
    allowEmptyValue: true
  },
  "inspect-brk-search": {
    type: "string",
    deprecates: ["debugBrkSearch"],
    allowEmptyValue: true
  },
  "inspect-sharedprocess": { type: "string", allowEmptyValue: true },
  "inspect-brk-sharedprocess": { type: "string", allowEmptyValue: true },
  "export-default-configuration": { type: "string" },
  "install-source": { type: "string" },
  "enable-smoke-test-driver": { type: "boolean" },
  logExtensionHostCommunication: { type: "boolean" },
  "skip-release-notes": { type: "boolean" },
  "skip-welcome": { type: "boolean" },
  "disable-telemetry": { type: "boolean" },
  "disable-updates": { type: "boolean" },
  "use-inmemory-secretstorage": {
    type: "boolean",
    deprecates: ["disable-keytar"]
  },
  "password-store": { type: "string" },
  "disable-workspace-trust": { type: "boolean" },
  "disable-crash-reporter": { type: "boolean" },
  "crash-reporter-directory": { type: "string" },
  "crash-reporter-id": { type: "string" },
  "skip-add-to-recently-opened": { type: "boolean" },
  "open-url": { type: "boolean" },
  "file-write": { type: "boolean" },
  "file-chmod": { type: "boolean" },
  "install-builtin-extension": { type: "string[]" },
  force: { type: "boolean" },
  "do-not-sync": { type: "boolean" },
  trace: { type: "boolean" },
  "trace-category-filter": { type: "string" },
  "trace-options": { type: "string" },
  "preserve-env": { type: "boolean" },
  "force-user-env": { type: "boolean" },
  "force-disable-user-env": { type: "boolean" },
  "open-devtools": { type: "boolean" },
  "disable-gpu-sandbox": { type: "boolean" },
  logsPath: { type: "string" },
  "__enable-file-policy": { type: "boolean" },
  editSessionId: { type: "string" },
  continueOn: { type: "string" },
  "locate-shell-integration-path": {
    type: "string",
    args: ["bash", "pwsh", "zsh", "fish"]
  },
  "enable-coi": { type: "boolean" },
  // chromium flags
  "no-proxy-server": { type: "boolean" },
  // Minimist incorrectly parses keys that start with `--no`
  // https://github.com/substack/minimist/blob/aeb3e27dae0412de5c0494e9563a5f10c82cc7a9/index.js#L118-L121
  // If --no-sandbox is passed via cli wrapper it will be treated as --sandbox which is incorrect, we use
  // the alias here to make sure --no-sandbox is always respected.
  // For https://github.com/microsoft/vscode/issues/128279
  "no-sandbox": { type: "boolean", alias: "sandbox" },
  "proxy-server": { type: "string" },
  "proxy-bypass-list": { type: "string" },
  "proxy-pac-url": { type: "string" },
  "js-flags": { type: "string" },
  // chrome js flags
  inspect: { type: "string", allowEmptyValue: true },
  "inspect-brk": { type: "string", allowEmptyValue: true },
  nolazy: { type: "boolean" },
  // node inspect
  "force-device-scale-factor": { type: "string" },
  "force-renderer-accessibility": { type: "boolean" },
  "ignore-certificate-errors": { type: "boolean" },
  "allow-insecure-localhost": { type: "boolean" },
  "log-net-log": { type: "string" },
  vmodule: { type: "string" },
  _urls: { type: "string[]" },
  "disable-dev-shm-usage": { type: "boolean" },
  "profile-temp": { type: "boolean" },
  "ozone-platform": { type: "string" },
  "enable-tracing": { type: "string" },
  "trace-startup-format": { type: "string" },
  "trace-startup-file": { type: "string" },
  "trace-startup-duration": { type: "string" },
  _: { type: "string[]" }
  // main arguments
};
const ignoringReporter = {
  onUnknownOption: () => {
  },
  onMultipleValues: () => {
  },
  onEmptyValue: () => {
  },
  onDeprecatedOption: () => {
  }
};
function parseArgs(args, options, errorReporter = ignoringReporter) {
  const firstArg = args.find((a) => a.length > 0 && a[0] !== "-");
  const alias = {};
  const stringOptions = ["_"];
  const booleanOptions = [];
  const globalOptions = {};
  let command;
  for (const optionId in options) {
    const o = options[optionId];
    if (o.type === "subcommand") {
      if (optionId === firstArg) {
        command = o;
      }
    } else {
      if (o.alias) {
        alias[optionId] = o.alias;
      }
      if (o.type === "string" || o.type === "string[]") {
        stringOptions.push(optionId);
        if (o.deprecates) {
          stringOptions.push(...o.deprecates);
        }
      } else if (o.type === "boolean") {
        booleanOptions.push(optionId);
        if (o.deprecates) {
          booleanOptions.push(...o.deprecates);
        }
      }
      if (o.global) {
        globalOptions[optionId] = o;
      }
    }
  }
  if (command && firstArg) {
    const options2 = globalOptions;
    for (const optionId in command.options) {
      options2[optionId] = command.options[optionId];
    }
    const newArgs = args.filter((a) => a !== firstArg);
    const reporter = errorReporter.getSubcommandReporter ? errorReporter.getSubcommandReporter(firstArg) : void 0;
    const subcommandOptions = parseArgs(newArgs, options2, reporter);
    return {
      [firstArg]: subcommandOptions,
      _: []
    };
  }
  const parsedArgs = minimist(args, {
    string: stringOptions,
    boolean: booleanOptions,
    alias
  });
  const cleanedArgs = {};
  const remainingArgs = parsedArgs;
  cleanedArgs._ = parsedArgs._.map((arg) => String(arg)).filter(
    (arg) => arg.length > 0
  );
  delete remainingArgs._;
  for (const optionId in options) {
    const o = options[optionId];
    if (o.type === "subcommand") {
      continue;
    }
    if (o.alias) {
      delete remainingArgs[o.alias];
    }
    let val = remainingArgs[optionId];
    if (o.deprecates) {
      for (const deprecatedId of o.deprecates) {
        if (remainingArgs.hasOwnProperty(deprecatedId)) {
          if (!val) {
            val = remainingArgs[deprecatedId];
            if (val) {
              errorReporter.onDeprecatedOption(
                deprecatedId,
                o.deprecationMessage || localize(
                  "deprecated.useInstead",
                  "Use {0} instead.",
                  optionId
                )
              );
            }
          }
          delete remainingArgs[deprecatedId];
        }
      }
    }
    if (typeof val !== "undefined") {
      if (o.type === "string[]") {
        if (!Array.isArray(val)) {
          val = [val];
        }
        if (!o.allowEmptyValue) {
          const sanitized = val.filter((v) => v.length > 0);
          if (sanitized.length !== val.length) {
            errorReporter.onEmptyValue(optionId);
            val = sanitized.length > 0 ? sanitized : void 0;
          }
        }
      } else if (o.type === "string") {
        if (Array.isArray(val)) {
          val = val.pop();
          errorReporter.onMultipleValues(optionId, val);
        } else if (!val && !o.allowEmptyValue) {
          errorReporter.onEmptyValue(optionId);
          val = void 0;
        }
      }
      cleanedArgs[optionId] = val;
      if (o.deprecationMessage) {
        errorReporter.onDeprecatedOption(
          optionId,
          o.deprecationMessage
        );
      }
    }
    delete remainingArgs[optionId];
  }
  for (const key in remainingArgs) {
    errorReporter.onUnknownOption(key);
  }
  return cleanedArgs;
}
function formatUsage(optionId, option) {
  let args = "";
  if (option.args) {
    if (Array.isArray(option.args)) {
      args = ` <${option.args.join("> <")}>`;
    } else {
      args = ` <${option.args}>`;
    }
  }
  if (option.alias) {
    return `-${option.alias} --${optionId}${args}`;
  }
  return `--${optionId}${args}`;
}
function formatOptions(options, columns) {
  const usageTexts = [];
  for (const optionId in options) {
    const o = options[optionId];
    const usageText = formatUsage(optionId, o);
    usageTexts.push([usageText, o.description]);
  }
  return formatUsageTexts(usageTexts, columns);
}
function formatUsageTexts(usageTexts, columns) {
  const maxLength = usageTexts.reduce(
    (previous, e) => Math.max(previous, e[0].length),
    12
  );
  const argLength = maxLength + 2 + 1;
  if (columns - argLength < 25) {
    return usageTexts.reduce(
      (r, ut) => r.concat([`  ${ut[0]}`, `      ${ut[1]}`]),
      []
    );
  }
  const descriptionColumns = columns - argLength - 1;
  const result = [];
  for (const ut of usageTexts) {
    const usage = ut[0];
    const wrappedDescription = wrapText(ut[1], descriptionColumns);
    const keyPadding = indent(
      argLength - usage.length - 2
    );
    result.push("  " + usage + keyPadding + wrappedDescription[0]);
    for (let i = 1; i < wrappedDescription.length; i++) {
      result.push(indent(argLength) + wrappedDescription[i]);
    }
  }
  return result;
}
function indent(count) {
  return " ".repeat(count);
}
function wrapText(text, columns) {
  const lines = [];
  while (text.length) {
    const index = text.length < columns ? text.length : text.lastIndexOf(" ", columns);
    const line = text.slice(0, index).trim();
    text = text.slice(index);
    lines.push(line);
  }
  return lines;
}
function buildHelpMessage(productName, executableName, version, options, capabilities) {
  const columns = process.stdout.isTTY && process.stdout.columns || 80;
  const inputFiles = capabilities?.noInputFiles !== true ? `[${localize("paths", "paths")}...]` : "";
  const help = [`${productName} ${version}`];
  help.push("");
  help.push(
    `${localize("usage", "Usage")}: ${executableName} [${localize("options", "options")}]${inputFiles}`
  );
  help.push("");
  if (capabilities?.noPipe !== true) {
    if (isWindows) {
      help.push(
        localize(
          "stdinWindows",
          "To read output from another program, append '-' (e.g. 'echo Hello World | {0} -')",
          executableName
        )
      );
    } else {
      help.push(
        localize(
          "stdinUnix",
          "To read from stdin, append '-' (e.g. 'ps aux | grep code | {0} -')",
          executableName
        )
      );
    }
    help.push("");
  }
  const optionsByCategory = {};
  const subcommands = [];
  for (const optionId in options) {
    const o = options[optionId];
    if (o.type === "subcommand") {
      if (o.description) {
        subcommands.push({
          command: optionId,
          description: o.description
        });
      }
    } else if (o.description && o.cat) {
      let optionsByCat = optionsByCategory[o.cat];
      if (!optionsByCat) {
        optionsByCategory[o.cat] = optionsByCat = {};
      }
      optionsByCat[optionId] = o;
    }
  }
  for (const helpCategoryKey in optionsByCategory) {
    const key = helpCategoryKey;
    const categoryOptions = optionsByCategory[key];
    if (categoryOptions) {
      help.push(helpCategories[key]);
      help.push(...formatOptions(categoryOptions, columns));
      help.push("");
    }
  }
  if (subcommands.length) {
    help.push(localize("subcommands", "Subcommands"));
    help.push(
      ...formatUsageTexts(
        subcommands.map((s) => [s.command, s.description]),
        columns
      )
    );
    help.push("");
  }
  return help.join("\n");
}
function buildVersionMessage(version, commit) {
  return `${version || localize("unknownVersion", "Unknown version")}
${commit || localize("unknownCommit", "Unknown commit")}
${process.arch}`;
}
export {
  NATIVE_CLI_COMMANDS,
  OPTIONS,
  buildHelpMessage,
  buildVersionMessage,
  formatOptions,
  parseArgs
};
