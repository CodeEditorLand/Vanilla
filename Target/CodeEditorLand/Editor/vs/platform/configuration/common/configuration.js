var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../base/common/event.js";
import * as types from "../../../base/common/types.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { IWorkspaceFolder } from "../../workspace/common/workspace.js";
const IConfigurationService = createDecorator("configurationService");
function isConfigurationOverrides(thing) {
  return thing && typeof thing === "object" && (!thing.overrideIdentifier || typeof thing.overrideIdentifier === "string") && (!thing.resource || thing.resource instanceof URI);
}
__name(isConfigurationOverrides, "isConfigurationOverrides");
function isConfigurationUpdateOverrides(thing) {
  return thing && typeof thing === "object" && (!thing.overrideIdentifiers || Array.isArray(thing.overrideIdentifiers)) && !thing.overrideIdentifier && (!thing.resource || thing.resource instanceof URI);
}
__name(isConfigurationUpdateOverrides, "isConfigurationUpdateOverrides");
var ConfigurationTarget = /* @__PURE__ */ ((ConfigurationTarget2) => {
  ConfigurationTarget2[ConfigurationTarget2["APPLICATION"] = 1] = "APPLICATION";
  ConfigurationTarget2[ConfigurationTarget2["USER"] = 2] = "USER";
  ConfigurationTarget2[ConfigurationTarget2["USER_LOCAL"] = 3] = "USER_LOCAL";
  ConfigurationTarget2[ConfigurationTarget2["USER_REMOTE"] = 4] = "USER_REMOTE";
  ConfigurationTarget2[ConfigurationTarget2["WORKSPACE"] = 5] = "WORKSPACE";
  ConfigurationTarget2[ConfigurationTarget2["WORKSPACE_FOLDER"] = 6] = "WORKSPACE_FOLDER";
  ConfigurationTarget2[ConfigurationTarget2["DEFAULT"] = 7] = "DEFAULT";
  ConfigurationTarget2[ConfigurationTarget2["MEMORY"] = 8] = "MEMORY";
  return ConfigurationTarget2;
})(ConfigurationTarget || {});
function ConfigurationTargetToString(configurationTarget) {
  switch (configurationTarget) {
    case 1 /* APPLICATION */:
      return "APPLICATION";
    case 2 /* USER */:
      return "USER";
    case 3 /* USER_LOCAL */:
      return "USER_LOCAL";
    case 4 /* USER_REMOTE */:
      return "USER_REMOTE";
    case 5 /* WORKSPACE */:
      return "WORKSPACE";
    case 6 /* WORKSPACE_FOLDER */:
      return "WORKSPACE_FOLDER";
    case 7 /* DEFAULT */:
      return "DEFAULT";
    case 8 /* MEMORY */:
      return "MEMORY";
  }
}
__name(ConfigurationTargetToString, "ConfigurationTargetToString");
function isConfigured(configValue) {
  return configValue.applicationValue !== void 0 || configValue.userValue !== void 0 || configValue.userLocalValue !== void 0 || configValue.userRemoteValue !== void 0 || configValue.workspaceValue !== void 0 || configValue.workspaceFolderValue !== void 0;
}
__name(isConfigured, "isConfigured");
function toValuesTree(properties, conflictReporter) {
  const root = /* @__PURE__ */ Object.create(null);
  for (const key in properties) {
    addToValueTree(root, key, properties[key], conflictReporter);
  }
  return root;
}
__name(toValuesTree, "toValuesTree");
function addToValueTree(settingsTreeRoot, key, value, conflictReporter) {
  const segments = key.split(".");
  const last = segments.pop();
  let curr = settingsTreeRoot;
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    let obj = curr[s];
    switch (typeof obj) {
      case "undefined":
        obj = curr[s] = /* @__PURE__ */ Object.create(null);
        break;
      case "object":
        if (obj === null) {
          conflictReporter(`Ignoring ${key} as ${segments.slice(0, i + 1).join(".")} is null`);
          return;
        }
        break;
      default:
        conflictReporter(`Ignoring ${key} as ${segments.slice(0, i + 1).join(".")} is ${JSON.stringify(obj)}`);
        return;
    }
    curr = obj;
  }
  if (typeof curr === "object" && curr !== null) {
    try {
      curr[last] = value;
    } catch (e) {
      conflictReporter(`Ignoring ${key} as ${segments.join(".")} is ${JSON.stringify(curr)}`);
    }
  } else {
    conflictReporter(`Ignoring ${key} as ${segments.join(".")} is ${JSON.stringify(curr)}`);
  }
}
__name(addToValueTree, "addToValueTree");
function removeFromValueTree(valueTree, key) {
  const segments = key.split(".");
  doRemoveFromValueTree(valueTree, segments);
}
__name(removeFromValueTree, "removeFromValueTree");
function doRemoveFromValueTree(valueTree, segments) {
  const first = segments.shift();
  if (segments.length === 0) {
    delete valueTree[first];
    return;
  }
  if (Object.keys(valueTree).indexOf(first) !== -1) {
    const value = valueTree[first];
    if (typeof value === "object" && !Array.isArray(value)) {
      doRemoveFromValueTree(value, segments);
      if (Object.keys(value).length === 0) {
        delete valueTree[first];
      }
    }
  }
}
__name(doRemoveFromValueTree, "doRemoveFromValueTree");
function getConfigurationValue(config, settingPath, defaultValue) {
  function accessSetting(config2, path2) {
    let current = config2;
    for (const component of path2) {
      if (typeof current !== "object" || current === null) {
        return void 0;
      }
      current = current[component];
    }
    return current;
  }
  __name(accessSetting, "accessSetting");
  const path = settingPath.split(".");
  const result = accessSetting(config, path);
  return typeof result === "undefined" ? defaultValue : result;
}
__name(getConfigurationValue, "getConfigurationValue");
function merge(base, add, overwrite) {
  Object.keys(add).forEach((key) => {
    if (key !== "__proto__") {
      if (key in base) {
        if (types.isObject(base[key]) && types.isObject(add[key])) {
          merge(base[key], add[key], overwrite);
        } else if (overwrite) {
          base[key] = add[key];
        }
      } else {
        base[key] = add[key];
      }
    }
  });
}
__name(merge, "merge");
function getLanguageTagSettingPlainKey(settingKey) {
  return settingKey.replace(/[\[\]]/g, "");
}
__name(getLanguageTagSettingPlainKey, "getLanguageTagSettingPlainKey");
export {
  ConfigurationTarget,
  ConfigurationTargetToString,
  IConfigurationService,
  addToValueTree,
  getConfigurationValue,
  getLanguageTagSettingPlainKey,
  isConfigurationOverrides,
  isConfigurationUpdateOverrides,
  isConfigured,
  merge,
  removeFromValueTree,
  toValuesTree
};
//# sourceMappingURL=configuration.js.map
