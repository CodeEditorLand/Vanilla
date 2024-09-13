var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "./uri.js";
function isRemoteConsoleLog(obj) {
  const entry = obj;
  return entry && typeof entry.type === "string" && typeof entry.severity === "string";
}
__name(isRemoteConsoleLog, "isRemoteConsoleLog");
function parse(entry) {
  const args = [];
  let stack;
  try {
    const parsedArguments = JSON.parse(entry.arguments);
    const stackArgument = parsedArguments[parsedArguments.length - 1];
    if (stackArgument && stackArgument.__$stack) {
      parsedArguments.pop();
      stack = stackArgument.__$stack;
    }
    args.push(...parsedArguments);
  } catch (error) {
    args.push("Unable to log remote console arguments", entry.arguments);
  }
  return { args, stack };
}
__name(parse, "parse");
function getFirstFrame(arg0) {
  if (typeof arg0 !== "string") {
    return getFirstFrame(parse(arg0).stack);
  }
  const stack = arg0;
  if (stack) {
    const topFrame = findFirstFrame(stack);
    const matches = /at [^/]*((?:(?:[a-zA-Z]+:)|(?:[/])|(?:\\\\))(?:.+)):(\d+):(\d+)/.exec(
      topFrame || ""
    );
    if (matches && matches.length === 4) {
      return {
        uri: URI.file(matches[1]),
        line: Number(matches[2]),
        column: Number(matches[3])
      };
    }
  }
  return void 0;
}
__name(getFirstFrame, "getFirstFrame");
function findFirstFrame(stack) {
  if (!stack) {
    return stack;
  }
  const newlineIndex = stack.indexOf("\n");
  if (newlineIndex === -1) {
    return stack;
  }
  return stack.substring(0, newlineIndex);
}
__name(findFirstFrame, "findFirstFrame");
function log(entry, label) {
  const { args, stack } = parse(entry);
  const isOneStringArg = typeof args[0] === "string" && args.length === 1;
  let topFrame = findFirstFrame(stack);
  if (topFrame) {
    topFrame = `(${topFrame.trim()})`;
  }
  let consoleArgs = [];
  if (typeof args[0] === "string") {
    if (topFrame && isOneStringArg) {
      consoleArgs = [
        `%c[${label}] %c${args[0]} %c${topFrame}`,
        color("blue"),
        color(""),
        color("grey")
      ];
    } else {
      consoleArgs = [
        `%c[${label}] %c${args[0]}`,
        color("blue"),
        color(""),
        ...args.slice(1)
      ];
    }
  } else {
    consoleArgs = [`%c[${label}]%`, color("blue"), ...args];
  }
  if (topFrame && !isOneStringArg) {
    consoleArgs.push(topFrame);
  }
  if (typeof console[entry.severity] !== "function") {
    throw new Error("Unknown console method");
  }
  console[entry.severity].apply(console, consoleArgs);
}
__name(log, "log");
function color(color2) {
  return `color: ${color2}`;
}
__name(color, "color");
export {
  getFirstFrame,
  isRemoteConsoleLog,
  log,
  parse
};
//# sourceMappingURL=console.js.map
