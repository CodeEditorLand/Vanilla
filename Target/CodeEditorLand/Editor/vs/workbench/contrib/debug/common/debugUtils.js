var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { equalsIgnoreCase } from "../../../../base/common/strings.js";
import { IDebuggerContribution, IDebugSession, IConfigPresentation } from "./debug.js";
import { URI as uri } from "../../../../base/common/uri.js";
import { isAbsolute } from "../../../../base/common/path.js";
import { deepClone } from "../../../../base/common/objects.js";
import { Schemas } from "../../../../base/common/network.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { Position } from "../../../../editor/common/core/position.js";
import { IRange, Range } from "../../../../editor/common/core/range.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { coalesce } from "../../../../base/common/arrays.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
const _formatPIIRegexp = /{([^}]+)}/g;
function formatPII(value, excludePII, args) {
  return value.replace(_formatPIIRegexp, function(match, group) {
    if (excludePII && group.length > 0 && group[0] !== "_") {
      return match;
    }
    return args && args.hasOwnProperty(group) ? args[group] : match;
  });
}
__name(formatPII, "formatPII");
function filterExceptionsFromTelemetry(data) {
  const output = {};
  for (const key of Object.keys(data)) {
    if (!key.startsWith("!")) {
      output[key] = data[key];
    }
  }
  return output;
}
__name(filterExceptionsFromTelemetry, "filterExceptionsFromTelemetry");
function isSessionAttach(session) {
  return session.configuration.request === "attach" && !getExtensionHostDebugSession(session) && (!session.parentSession || isSessionAttach(session.parentSession));
}
__name(isSessionAttach, "isSessionAttach");
function getExtensionHostDebugSession(session) {
  let type = session.configuration.type;
  if (!type) {
    return;
  }
  if (type === "vslsShare") {
    type = session.configuration.adapterProxy.configuration.type;
  }
  if (equalsIgnoreCase(type, "extensionhost") || equalsIgnoreCase(type, "pwa-extensionhost")) {
    return session;
  }
  return session.parentSession ? getExtensionHostDebugSession(session.parentSession) : void 0;
}
__name(getExtensionHostDebugSession, "getExtensionHostDebugSession");
function isDebuggerMainContribution(dbg) {
  return dbg.type && (dbg.label || dbg.program || dbg.runtime);
}
__name(isDebuggerMainContribution, "isDebuggerMainContribution");
function getExactExpressionStartAndEnd(lineContent, looseStart, looseEnd) {
  let matchingExpression = void 0;
  let startOffset = 0;
  const expression = /([^()\[\]{}<>\s+\-/%~#^;=|,`!]|\->)+/g;
  let result = null;
  while (result = expression.exec(lineContent)) {
    const start = result.index + 1;
    const end = start + result[0].length;
    if (start <= looseStart && end >= looseEnd) {
      matchingExpression = result[0];
      startOffset = start;
      break;
    }
  }
  if (matchingExpression) {
    const subExpression = /(\w|\p{L})+/gu;
    let subExpressionResult = null;
    while (subExpressionResult = subExpression.exec(matchingExpression)) {
      const subEnd = subExpressionResult.index + 1 + startOffset + subExpressionResult[0].length;
      if (subEnd >= looseEnd) {
        break;
      }
    }
    if (subExpressionResult) {
      matchingExpression = matchingExpression.substring(0, subExpression.lastIndex);
    }
  }
  return matchingExpression ? { start: startOffset, end: startOffset + matchingExpression.length - 1 } : { start: 0, end: 0 };
}
__name(getExactExpressionStartAndEnd, "getExactExpressionStartAndEnd");
async function getEvaluatableExpressionAtPosition(languageFeaturesService, model, position, token) {
  if (languageFeaturesService.evaluatableExpressionProvider.has(model)) {
    const supports = languageFeaturesService.evaluatableExpressionProvider.ordered(model);
    const results = coalesce(await Promise.all(supports.map(async (support) => {
      try {
        return await support.provideEvaluatableExpression(model, position, token ?? CancellationToken.None);
      } catch (err) {
        return void 0;
      }
    })));
    if (results.length > 0) {
      let matchingExpression = results[0].expression;
      const range = results[0].range;
      if (!matchingExpression) {
        const lineContent = model.getLineContent(position.lineNumber);
        matchingExpression = lineContent.substring(range.startColumn - 1, range.endColumn - 1);
      }
      return { range, matchingExpression };
    }
  } else {
    const lineContent = model.getLineContent(position.lineNumber);
    const { start, end } = getExactExpressionStartAndEnd(lineContent, position.column, position.column);
    const matchingExpression = lineContent.substring(start - 1, end);
    return {
      matchingExpression,
      range: new Range(position.lineNumber, start, position.lineNumber, start + matchingExpression.length)
    };
  }
  return null;
}
__name(getEvaluatableExpressionAtPosition, "getEvaluatableExpressionAtPosition");
const _schemePattern = /^[a-zA-Z][a-zA-Z0-9\+\-\.]+:/;
function isUri(s) {
  return !!(s && s.match(_schemePattern));
}
__name(isUri, "isUri");
function stringToUri(source) {
  if (typeof source.path === "string") {
    if (typeof source.sourceReference === "number" && source.sourceReference > 0) {
    } else {
      if (isUri(source.path)) {
        return uri.parse(source.path);
      } else {
        if (isAbsolute(source.path)) {
          return uri.file(source.path);
        } else {
        }
      }
    }
  }
  return source.path;
}
__name(stringToUri, "stringToUri");
function uriToString(source) {
  if (typeof source.path === "object") {
    const u = uri.revive(source.path);
    if (u) {
      if (u.scheme === Schemas.file) {
        return u.fsPath;
      } else {
        return u.toString();
      }
    }
  }
  return source.path;
}
__name(uriToString, "uriToString");
function convertToDAPaths(message, toUri) {
  const fixPath = toUri ? stringToUri : uriToString;
  const msg = deepClone(message);
  convertPaths(msg, (toDA, source) => {
    if (toDA && source) {
      source.path = fixPath(source);
    }
  });
  return msg;
}
__name(convertToDAPaths, "convertToDAPaths");
function convertToVSCPaths(message, toUri) {
  const fixPath = toUri ? stringToUri : uriToString;
  const msg = deepClone(message);
  convertPaths(msg, (toDA, source) => {
    if (!toDA && source) {
      source.path = fixPath(source);
    }
  });
  return msg;
}
__name(convertToVSCPaths, "convertToVSCPaths");
function convertPaths(msg, fixSourcePath) {
  switch (msg.type) {
    case "event": {
      const event = msg;
      switch (event.event) {
        case "output":
          fixSourcePath(false, event.body.source);
          break;
        case "loadedSource":
          fixSourcePath(false, event.body.source);
          break;
        case "breakpoint":
          fixSourcePath(false, event.body.breakpoint.source);
          break;
        default:
          break;
      }
      break;
    }
    case "request": {
      const request = msg;
      switch (request.command) {
        case "setBreakpoints":
          fixSourcePath(true, request.arguments.source);
          break;
        case "breakpointLocations":
          fixSourcePath(true, request.arguments.source);
          break;
        case "source":
          fixSourcePath(true, request.arguments.source);
          break;
        case "gotoTargets":
          fixSourcePath(true, request.arguments.source);
          break;
        case "launchVSCode":
          request.arguments.args.forEach((arg) => fixSourcePath(false, arg));
          break;
        default:
          break;
      }
      break;
    }
    case "response": {
      const response = msg;
      if (response.success && response.body) {
        switch (response.command) {
          case "stackTrace":
            response.body.stackFrames.forEach((frame) => fixSourcePath(false, frame.source));
            break;
          case "loadedSources":
            response.body.sources.forEach((source) => fixSourcePath(false, source));
            break;
          case "scopes":
            response.body.scopes.forEach((scope) => fixSourcePath(false, scope.source));
            break;
          case "setFunctionBreakpoints":
            response.body.breakpoints.forEach((bp) => fixSourcePath(false, bp.source));
            break;
          case "setBreakpoints":
            response.body.breakpoints.forEach((bp) => fixSourcePath(false, bp.source));
            break;
          case "disassemble":
            {
              const di = response;
              di.body?.instructions.forEach((di2) => fixSourcePath(false, di2.location));
            }
            break;
          case "locations":
            fixSourcePath(false, response.body?.source);
            break;
          default:
            break;
        }
      }
      break;
    }
  }
}
__name(convertPaths, "convertPaths");
function getVisibleAndSorted(array) {
  return array.filter((config) => !config.presentation?.hidden).sort((first, second) => {
    if (!first.presentation) {
      if (!second.presentation) {
        return 0;
      }
      return 1;
    }
    if (!second.presentation) {
      return -1;
    }
    if (!first.presentation.group) {
      if (!second.presentation.group) {
        return compareOrders(first.presentation.order, second.presentation.order);
      }
      return 1;
    }
    if (!second.presentation.group) {
      return -1;
    }
    if (first.presentation.group !== second.presentation.group) {
      return first.presentation.group.localeCompare(second.presentation.group);
    }
    return compareOrders(first.presentation.order, second.presentation.order);
  });
}
__name(getVisibleAndSorted, "getVisibleAndSorted");
function compareOrders(first, second) {
  if (typeof first !== "number") {
    if (typeof second !== "number") {
      return 0;
    }
    return 1;
  }
  if (typeof second !== "number") {
    return -1;
  }
  return first - second;
}
__name(compareOrders, "compareOrders");
async function saveAllBeforeDebugStart(configurationService, editorService) {
  const saveBeforeStartConfig = configurationService.getValue("debug.saveBeforeStart", { overrideIdentifier: editorService.activeTextEditorLanguageId });
  if (saveBeforeStartConfig !== "none") {
    await editorService.saveAll();
    if (saveBeforeStartConfig === "allEditorsInActiveGroup") {
      const activeEditor = editorService.activeEditorPane;
      if (activeEditor && activeEditor.input.resource?.scheme === Schemas.untitled) {
        await editorService.save({ editor: activeEditor.input, groupId: activeEditor.group.id });
      }
    }
  }
  await configurationService.reloadConfiguration();
}
__name(saveAllBeforeDebugStart, "saveAllBeforeDebugStart");
const sourcesEqual = /* @__PURE__ */ __name((a, b) => !a || !b ? a === b : a.name === b.name && a.path === b.path && a.sourceReference === b.sourceReference, "sourcesEqual");
export {
  convertToDAPaths,
  convertToVSCPaths,
  filterExceptionsFromTelemetry,
  formatPII,
  getEvaluatableExpressionAtPosition,
  getExactExpressionStartAndEnd,
  getExtensionHostDebugSession,
  getVisibleAndSorted,
  isDebuggerMainContribution,
  isSessionAttach,
  isUri,
  saveAllBeforeDebugStart,
  sourcesEqual
};
//# sourceMappingURL=debugUtils.js.map
