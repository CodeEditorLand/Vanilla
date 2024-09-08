class EditorSettingMigration {
  constructor(key, migrate) {
    this.key = key;
    this.migrate = migrate;
  }
  static items = [];
  apply(options) {
    const value = EditorSettingMigration._read(options, this.key);
    const read = (key) => EditorSettingMigration._read(options, key);
    const write = (key, value2) => EditorSettingMigration._write(options, key, value2);
    this.migrate(value, read, write);
  }
  static _read(source, key) {
    if (typeof source === "undefined") {
      return void 0;
    }
    const firstDotIndex = key.indexOf(".");
    if (firstDotIndex >= 0) {
      const firstSegment = key.substring(0, firstDotIndex);
      return this._read(
        source[firstSegment],
        key.substring(firstDotIndex + 1)
      );
    }
    return source[key];
  }
  static _write(target, key, value) {
    const firstDotIndex = key.indexOf(".");
    if (firstDotIndex >= 0) {
      const firstSegment = key.substring(0, firstDotIndex);
      target[firstSegment] = target[firstSegment] || {};
      this._write(
        target[firstSegment],
        key.substring(firstDotIndex + 1),
        value
      );
      return;
    }
    target[key] = value;
  }
}
function registerEditorSettingMigration(key, migrate) {
  EditorSettingMigration.items.push(new EditorSettingMigration(key, migrate));
}
function registerSimpleEditorSettingMigration(key, values) {
  registerEditorSettingMigration(key, (value, read, write) => {
    if (typeof value !== "undefined") {
      for (const [oldValue, newValue] of values) {
        if (value === oldValue) {
          write(key, newValue);
          return;
        }
      }
    }
  });
}
function migrateOptions(options) {
  EditorSettingMigration.items.forEach(
    (migration) => migration.apply(options)
  );
}
registerSimpleEditorSettingMigration("wordWrap", [
  [true, "on"],
  [false, "off"]
]);
registerSimpleEditorSettingMigration("lineNumbers", [
  [true, "on"],
  [false, "off"]
]);
registerSimpleEditorSettingMigration("cursorBlinking", [["visible", "solid"]]);
registerSimpleEditorSettingMigration("renderWhitespace", [
  [true, "boundary"],
  [false, "none"]
]);
registerSimpleEditorSettingMigration("renderLineHighlight", [
  [true, "line"],
  [false, "none"]
]);
registerSimpleEditorSettingMigration("acceptSuggestionOnEnter", [
  [true, "on"],
  [false, "off"]
]);
registerSimpleEditorSettingMigration("tabCompletion", [
  [false, "off"],
  [true, "onlySnippets"]
]);
registerSimpleEditorSettingMigration("hover", [
  [true, { enabled: true }],
  [false, { enabled: false }]
]);
registerSimpleEditorSettingMigration("parameterHints", [
  [true, { enabled: true }],
  [false, { enabled: false }]
]);
registerSimpleEditorSettingMigration("autoIndent", [
  [false, "advanced"],
  [true, "full"]
]);
registerSimpleEditorSettingMigration("matchBrackets", [
  [true, "always"],
  [false, "never"]
]);
registerSimpleEditorSettingMigration("renderFinalNewline", [
  [true, "on"],
  [false, "off"]
]);
registerSimpleEditorSettingMigration("cursorSmoothCaretAnimation", [
  [true, "on"],
  [false, "off"]
]);
registerSimpleEditorSettingMigration("occurrencesHighlight", [
  [true, "singleFile"],
  [false, "off"]
]);
registerSimpleEditorSettingMigration("wordBasedSuggestions", [
  [true, "matchingDocuments"],
  [false, "off"]
]);
registerEditorSettingMigration("autoClosingBrackets", (value, read, write) => {
  if (value === false) {
    write("autoClosingBrackets", "never");
    if (typeof read("autoClosingQuotes") === "undefined") {
      write("autoClosingQuotes", "never");
    }
    if (typeof read("autoSurround") === "undefined") {
      write("autoSurround", "never");
    }
  }
});
registerEditorSettingMigration("renderIndentGuides", (value, read, write) => {
  if (typeof value !== "undefined") {
    write("renderIndentGuides", void 0);
    if (typeof read("guides.indentation") === "undefined") {
      write("guides.indentation", !!value);
    }
  }
});
registerEditorSettingMigration(
  "highlightActiveIndentGuide",
  (value, read, write) => {
    if (typeof value !== "undefined") {
      write("highlightActiveIndentGuide", void 0);
      if (typeof read("guides.highlightActiveIndentation") === "undefined") {
        write("guides.highlightActiveIndentation", !!value);
      }
    }
  }
);
const suggestFilteredTypesMapping = {
  method: "showMethods",
  function: "showFunctions",
  constructor: "showConstructors",
  deprecated: "showDeprecated",
  field: "showFields",
  variable: "showVariables",
  class: "showClasses",
  struct: "showStructs",
  interface: "showInterfaces",
  module: "showModules",
  property: "showProperties",
  event: "showEvents",
  operator: "showOperators",
  unit: "showUnits",
  value: "showValues",
  constant: "showConstants",
  enum: "showEnums",
  enumMember: "showEnumMembers",
  keyword: "showKeywords",
  text: "showWords",
  color: "showColors",
  file: "showFiles",
  reference: "showReferences",
  folder: "showFolders",
  typeParameter: "showTypeParameters",
  snippet: "showSnippets"
};
registerEditorSettingMigration(
  "suggest.filteredTypes",
  (value, read, write) => {
    if (value && typeof value === "object") {
      for (const entry of Object.entries(suggestFilteredTypesMapping)) {
        const v = value[entry[0]];
        if (v === false) {
          if (typeof read(`suggest.${entry[1]}`) === "undefined") {
            write(`suggest.${entry[1]}`, false);
          }
        }
      }
      write("suggest.filteredTypes", void 0);
    }
  }
);
registerEditorSettingMigration("quickSuggestions", (input, read, write) => {
  if (typeof input === "boolean") {
    const value = input ? "on" : "off";
    const newValue = { comments: value, strings: value, other: value };
    write("quickSuggestions", newValue);
  }
});
registerEditorSettingMigration(
  "experimental.stickyScroll.enabled",
  (value, read, write) => {
    if (typeof value === "boolean") {
      write("experimental.stickyScroll.enabled", void 0);
      if (typeof read("stickyScroll.enabled") === "undefined") {
        write("stickyScroll.enabled", value);
      }
    }
  }
);
registerEditorSettingMigration(
  "experimental.stickyScroll.maxLineCount",
  (value, read, write) => {
    if (typeof value === "number") {
      write("experimental.stickyScroll.maxLineCount", void 0);
      if (typeof read("stickyScroll.maxLineCount") === "undefined") {
        write("stickyScroll.maxLineCount", value);
      }
    }
  }
);
registerEditorSettingMigration("codeActionsOnSave", (value, read, write) => {
  if (value && typeof value === "object") {
    let toBeModified = false;
    const newValue = {};
    for (const entry of Object.entries(value)) {
      if (typeof entry[1] === "boolean") {
        toBeModified = true;
        newValue[entry[0]] = entry[1] ? "explicit" : "never";
      } else {
        newValue[entry[0]] = entry[1];
      }
    }
    if (toBeModified) {
      write(`codeActionsOnSave`, newValue);
    }
  }
});
registerEditorSettingMigration(
  "codeActionWidget.includeNearbyQuickfixes",
  (value, read, write) => {
    if (typeof value === "boolean") {
      write("codeActionWidget.includeNearbyQuickfixes", void 0);
      if (typeof read("codeActionWidget.includeNearbyQuickFixes") === "undefined") {
        write("codeActionWidget.includeNearbyQuickFixes", value);
      }
    }
  }
);
registerEditorSettingMigration("lightbulb.enabled", (value, read, write) => {
  if (typeof value === "boolean") {
    write("lightbulb.enabled", value ? void 0 : "off");
  }
});
export {
  EditorSettingMigration,
  migrateOptions
};
