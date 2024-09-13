var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../nls.js";
import { ExtensionToggleData } from "../common/preferences.js";
const defaultCommonlyUsedSettings = [
  "files.autoSave",
  "editor.fontSize",
  "editor.fontFamily",
  "editor.tabSize",
  "editor.renderWhitespace",
  "editor.cursorStyle",
  "editor.multiCursorModifier",
  "editor.insertSpaces",
  "editor.wordWrap",
  "files.exclude",
  "files.associations",
  "workbench.editor.enablePreview"
];
function getCommonlyUsedData(toggleData) {
  return {
    id: "commonlyUsed",
    label: localize("commonlyUsed", "Commonly Used"),
    settings: toggleData?.commonlyUsed ?? defaultCommonlyUsedSettings
  };
}
__name(getCommonlyUsedData, "getCommonlyUsedData");
const tocData = {
  id: "root",
  label: "root",
  children: [
    {
      id: "editor",
      label: localize("textEditor", "Text Editor"),
      settings: ["editor.*"],
      children: [
        {
          id: "editor/cursor",
          label: localize("cursor", "Cursor"),
          settings: ["editor.cursor*"]
        },
        {
          id: "editor/find",
          label: localize("find", "Find"),
          settings: ["editor.find.*"]
        },
        {
          id: "editor/font",
          label: localize("font", "Font"),
          settings: ["editor.font*"]
        },
        {
          id: "editor/format",
          label: localize("formatting", "Formatting"),
          settings: ["editor.format*"]
        },
        {
          id: "editor/diffEditor",
          label: localize("diffEditor", "Diff Editor"),
          settings: ["diffEditor.*"]
        },
        {
          id: "editor/multiDiffEditor",
          label: localize("multiDiffEditor", "Multi-File Diff Editor"),
          settings: ["multiDiffEditor.*"]
        },
        {
          id: "editor/minimap",
          label: localize("minimap", "Minimap"),
          settings: ["editor.minimap.*"]
        },
        {
          id: "editor/suggestions",
          label: localize("suggestions", "Suggestions"),
          settings: ["editor.*suggest*"]
        },
        {
          id: "editor/files",
          label: localize("files", "Files"),
          settings: ["files.*"]
        }
      ]
    },
    {
      id: "workbench",
      label: localize("workbench", "Workbench"),
      settings: ["workbench.*"],
      children: [
        {
          id: "workbench/appearance",
          label: localize("appearance", "Appearance"),
          settings: ["workbench.activityBar.*", "workbench.*color*", "workbench.fontAliasing", "workbench.iconTheme", "workbench.sidebar.location", "workbench.*.visible", "workbench.tips.enabled", "workbench.tree.*", "workbench.view.*"]
        },
        {
          id: "workbench/breadcrumbs",
          label: localize("breadcrumbs", "Breadcrumbs"),
          settings: ["breadcrumbs.*"]
        },
        {
          id: "workbench/editor",
          label: localize("editorManagement", "Editor Management"),
          settings: ["workbench.editor.*"]
        },
        {
          id: "workbench/settings",
          label: localize("settings", "Settings Editor"),
          settings: ["workbench.settings.*"]
        },
        {
          id: "workbench/zenmode",
          label: localize("zenMode", "Zen Mode"),
          settings: ["zenmode.*"]
        },
        {
          id: "workbench/screencastmode",
          label: localize("screencastMode", "Screencast Mode"),
          settings: ["screencastMode.*"]
        }
      ]
    },
    {
      id: "window",
      label: localize("window", "Window"),
      settings: ["window.*"],
      children: [
        {
          id: "window/newWindow",
          label: localize("newWindow", "New Window"),
          settings: ["window.*newwindow*"]
        }
      ]
    },
    {
      id: "features",
      label: localize("features", "Features"),
      children: [
        {
          id: "features/accessibilitySignals",
          label: localize("accessibility.signals", "Accessibility Signals"),
          settings: ["accessibility.signal*"]
        },
        {
          id: "features/accessibility",
          label: localize("accessibility", "Accessibility"),
          settings: ["accessibility.*"]
        },
        {
          id: "features/explorer",
          label: localize("fileExplorer", "Explorer"),
          settings: ["explorer.*", "outline.*"]
        },
        {
          id: "features/search",
          label: localize("search", "Search"),
          settings: ["search.*"]
        },
        {
          id: "features/debug",
          label: localize("debug", "Debug"),
          settings: ["debug.*", "launch"]
        },
        {
          id: "features/testing",
          label: localize("testing", "Testing"),
          settings: ["testing.*"]
        },
        {
          id: "features/scm",
          label: localize("scm", "Source Control"),
          settings: ["scm.*"]
        },
        {
          id: "features/extensions",
          label: localize("extensions", "Extensions"),
          settings: ["extensions.*"]
        },
        {
          id: "features/terminal",
          label: localize("terminal", "Terminal"),
          settings: ["terminal.*"]
        },
        {
          id: "features/task",
          label: localize("task", "Task"),
          settings: ["task.*"]
        },
        {
          id: "features/problems",
          label: localize("problems", "Problems"),
          settings: ["problems.*"]
        },
        {
          id: "features/output",
          label: localize("output", "Output"),
          settings: ["output.*"]
        },
        {
          id: "features/comments",
          label: localize("comments", "Comments"),
          settings: ["comments.*"]
        },
        {
          id: "features/remote",
          label: localize("remote", "Remote"),
          settings: ["remote.*"]
        },
        {
          id: "features/timeline",
          label: localize("timeline", "Timeline"),
          settings: ["timeline.*"]
        },
        {
          id: "features/notebook",
          label: localize("notebook", "Notebook"),
          settings: ["notebook.*", "interactiveWindow.*"]
        },
        {
          id: "features/mergeEditor",
          label: localize("mergeEditor", "Merge Editor"),
          settings: ["mergeEditor.*"]
        },
        {
          id: "features/chat",
          label: localize("chat", "Chat"),
          settings: ["chat.*", "inlineChat.*"]
        },
        {
          id: "features/issueReporter",
          label: localize("issueReporter", "Issue Reporter"),
          settings: ["issueReporter.*"]
        }
      ]
    },
    {
      id: "application",
      label: localize("application", "Application"),
      children: [
        {
          id: "application/http",
          label: localize("proxy", "Proxy"),
          settings: ["http.*"]
        },
        {
          id: "application/keyboard",
          label: localize("keyboard", "Keyboard"),
          settings: ["keyboard.*"]
        },
        {
          id: "application/update",
          label: localize("update", "Update"),
          settings: ["update.*"]
        },
        {
          id: "application/telemetry",
          label: localize("telemetry", "Telemetry"),
          settings: ["telemetry.*"]
        },
        {
          id: "application/settingsSync",
          label: localize("settingsSync", "Settings Sync"),
          settings: ["settingsSync.*"]
        },
        {
          id: "application/experimental",
          label: localize("experimental", "Experimental"),
          settings: ["application.experimental.*"]
        },
        {
          id: "application/other",
          label: localize("other", "Other"),
          settings: ["application.*"]
        }
      ]
    },
    {
      id: "security",
      label: localize("security", "Security"),
      settings: ["security.*"],
      children: [
        {
          id: "security/workspace",
          label: localize("workspace", "Workspace"),
          settings: ["security.workspace.*"]
        }
      ]
    }
  ]
};
const knownAcronyms = /* @__PURE__ */ new Set();
[
  "css",
  "html",
  "scss",
  "less",
  "json",
  "js",
  "ts",
  "ie",
  "id",
  "php",
  "scm"
].forEach((str) => knownAcronyms.add(str));
const knownTermMappings = /* @__PURE__ */ new Map();
knownTermMappings.set("power shell", "PowerShell");
knownTermMappings.set("powershell", "PowerShell");
knownTermMappings.set("javascript", "JavaScript");
knownTermMappings.set("typescript", "TypeScript");
export {
  getCommonlyUsedData,
  knownAcronyms,
  knownTermMappings,
  tocData
};
//# sourceMappingURL=settingsLayout.js.map
