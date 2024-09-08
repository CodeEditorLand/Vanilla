import assert from "assert";
import { localize } from "../../../nls.js";
import {
  NATIVE_CLI_COMMANDS,
  OPTIONS,
  parseArgs
} from "./argv.js";
function parseAndValidate(cmdLineArgs, reportWarnings) {
  const onMultipleValues = (id, val) => {
    console.warn(
      localize(
        "multipleValues",
        "Option '{0}' is defined more than once. Using value '{1}'.",
        id,
        val
      )
    );
  };
  const onEmptyValue = (id) => {
    console.warn(
      localize(
        "emptyValue",
        "Option '{0}' requires a non empty value. Ignoring the option.",
        id
      )
    );
  };
  const onDeprecatedOption = (deprecatedOption, message) => {
    console.warn(
      localize(
        "deprecatedArgument",
        "Option '{0}' is deprecated: {1}",
        deprecatedOption,
        message
      )
    );
  };
  const getSubcommandReporter = (command) => ({
    onUnknownOption: (id) => {
      if (!NATIVE_CLI_COMMANDS.includes(command)) {
        console.warn(
          localize(
            "unknownSubCommandOption",
            "Warning: '{0}' is not in the list of known options for subcommand '{1}'",
            id,
            command
          )
        );
      }
    },
    onMultipleValues,
    onEmptyValue,
    onDeprecatedOption,
    getSubcommandReporter: NATIVE_CLI_COMMANDS.includes(command) ? getSubcommandReporter : void 0
  });
  const errorReporter = {
    onUnknownOption: (id) => {
      console.warn(
        localize(
          "unknownOption",
          "Warning: '{0}' is not in the list of known options, but still passed to Electron/Chromium.",
          id
        )
      );
    },
    onMultipleValues,
    onEmptyValue,
    onDeprecatedOption,
    getSubcommandReporter
  };
  const args = parseArgs(
    cmdLineArgs,
    OPTIONS,
    reportWarnings ? errorReporter : void 0
  );
  if (args.goto) {
    args._.forEach(
      (arg) => assert(
        /^(\w:)?[^:]+(:\d*){0,2}:?$/.test(arg),
        localize(
          "gotoValidation",
          "Arguments in `--goto` mode should be in the format of `FILE(:LINE(:CHARACTER))`."
        )
      )
    );
  }
  return args;
}
function stripAppPath(argv) {
  const index = argv.findIndex((a) => !/^-/.test(a));
  if (index > -1) {
    return [...argv.slice(0, index), ...argv.slice(index + 1)];
  }
  return void 0;
}
function parseMainProcessArgv(processArgv) {
  let [, ...args] = processArgv;
  if (process.env["VSCODE_DEV"]) {
    args = stripAppPath(args) || [];
  }
  const reportWarnings = !isLaunchedFromCli(process.env);
  return parseAndValidate(args, reportWarnings);
}
function parseCLIProcessArgv(processArgv) {
  let [, , ...args] = processArgv;
  if (process.env["VSCODE_DEV"]) {
    args = stripAppPath(args) || [];
  }
  return parseAndValidate(args, true);
}
function addArg(argv, ...args) {
  const endOfArgsMarkerIndex = argv.indexOf("--");
  if (endOfArgsMarkerIndex === -1) {
    argv.push(...args);
  } else {
    argv.splice(endOfArgsMarkerIndex, 0, ...args);
  }
  return argv;
}
function isLaunchedFromCli(env) {
  return env["VSCODE_CLI"] === "1";
}
export {
  addArg,
  isLaunchedFromCli,
  parseCLIProcessArgv,
  parseMainProcessArgv
};
