import assert from "assert";
import { Color } from "../../../../../base/common/color.js";
import { FileAccess, Schemas } from "../../../../../base/common/network.js";
import { isString } from "../../../../../base/common/types.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { ExtensionResourceLoaderService } from "../../../../../platform/extensionResourceLoader/common/extensionResourceLoaderService.js";
import { FileService } from "../../../../../platform/files/common/fileService.js";
import { DiskFileSystemProvider } from "../../../../../platform/files/node/diskFileSystemProvider.js";
import { NullLogService } from "../../../../../platform/log/common/log.js";
import {
  TokenStyle,
  getTokenClassificationRegistry
} from "../../../../../platform/theme/common/tokenClassificationRegistry.js";
import {
  TestProductService,
  mock
} from "../../../../test/common/workbenchTestServices.js";
import { ColorThemeData } from "../../common/colorThemeData.js";
const undefinedStyle = {
  bold: void 0,
  underline: void 0,
  italic: void 0
};
const unsetStyle = { bold: false, underline: false, italic: false };
function ts(foreground, styleFlags) {
  const foregroundColor = isString(foreground) ? Color.fromHex(foreground) : void 0;
  return new TokenStyle(
    foregroundColor,
    styleFlags?.bold,
    styleFlags?.underline,
    styleFlags?.strikethrough,
    styleFlags?.italic
  );
}
function tokenStyleAsString(ts2) {
  if (!ts2) {
    return "tokenstyle-undefined";
  }
  let str = ts2.foreground ? ts2.foreground.toString() : "no-foreground";
  if (ts2.bold !== void 0) {
    str += ts2.bold ? "+B" : "-B";
  }
  if (ts2.underline !== void 0) {
    str += ts2.underline ? "+U" : "-U";
  }
  if (ts2.italic !== void 0) {
    str += ts2.italic ? "+I" : "-I";
  }
  return str;
}
function assertTokenStyle(actual, expected, message) {
  assert.strictEqual(
    tokenStyleAsString(actual),
    tokenStyleAsString(expected),
    message
  );
}
function assertTokenStyleMetaData(colorIndex, actual, expected, message = "") {
  if (expected === void 0 || expected === null || actual === void 0) {
    assert.strictEqual(actual, expected, message);
    return;
  }
  assert.strictEqual(actual.bold, expected.bold, "bold " + message);
  assert.strictEqual(actual.italic, expected.italic, "italic " + message);
  assert.strictEqual(
    actual.underline,
    expected.underline,
    "underline " + message
  );
  const actualForegroundIndex = actual.foreground;
  if (actualForegroundIndex && expected.foreground) {
    assert.strictEqual(
      colorIndex[actualForegroundIndex],
      Color.Format.CSS.formatHexA(
        expected.foreground,
        true
      ).toUpperCase(),
      "foreground " + message
    );
  } else {
    assert.strictEqual(
      actualForegroundIndex,
      expected.foreground || 0,
      "foreground " + message
    );
  }
}
function assertTokenStyles(themeData, expected, language = "typescript") {
  const colorIndex = themeData.tokenColorMap;
  for (const qualifiedClassifier in expected) {
    const [type, ...modifiers] = qualifiedClassifier.split(".");
    const expectedTokenStyle = expected[qualifiedClassifier];
    const tokenStyleMetaData = themeData.getTokenStyleMetadata(
      type,
      modifiers,
      language
    );
    assertTokenStyleMetaData(
      colorIndex,
      tokenStyleMetaData,
      expectedTokenStyle,
      qualifiedClassifier
    );
  }
}
suite("Themes - TokenStyleResolving", () => {
  const fileService = new FileService(new NullLogService());
  const requestService = new (mock())();
  const storageService = new (mock())();
  const environmentService = new (mock())();
  const configurationService = new (mock())();
  const extensionResourceLoaderService = new ExtensionResourceLoaderService(
    fileService,
    storageService,
    TestProductService,
    environmentService,
    configurationService,
    requestService
  );
  const diskFileSystemProvider = new DiskFileSystemProvider(
    new NullLogService()
  );
  fileService.registerProvider(Schemas.file, diskFileSystemProvider);
  teardown(() => {
    diskFileSystemProvider.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("color defaults", async () => {
    const themeData = ColorThemeData.createUnloadedTheme("foo");
    themeData.location = FileAccess.asFileUri(
      "vs/workbench/services/themes/test/node/color-theme.json"
    );
    await themeData.ensureLoaded(extensionResourceLoaderService);
    assert.strictEqual(themeData.isLoaded, true);
    assertTokenStyles(themeData, {
      comment: ts("#000000", undefinedStyle),
      variable: ts("#111111", unsetStyle),
      type: ts("#333333", {
        bold: false,
        underline: true,
        italic: false
      }),
      function: ts("#333333", unsetStyle),
      string: ts("#444444", undefinedStyle),
      number: ts("#555555", undefinedStyle),
      keyword: ts("#666666", undefinedStyle)
    });
  });
  test("resolveScopes", async () => {
    const themeData = ColorThemeData.createLoadedEmptyTheme("test", "test");
    const customTokenColors = {
      textMateRules: [
        {
          scope: "variable",
          settings: {
            fontStyle: "",
            foreground: "#F8F8F2"
          }
        },
        {
          scope: "keyword.operator",
          settings: {
            fontStyle: "italic bold underline",
            foreground: "#F92672"
          }
        },
        {
          scope: "storage",
          settings: {
            fontStyle: "italic",
            foreground: "#F92672"
          }
        },
        {
          scope: [
            "storage.type",
            "meta.structure.dictionary.json string.quoted.double.json"
          ],
          settings: {
            foreground: "#66D9EF"
          }
        },
        {
          scope: "entity.name.type, entity.name.class, entity.name.namespace, entity.name.scope-resolution",
          settings: {
            fontStyle: "underline",
            foreground: "#A6E22E"
          }
        }
      ]
    };
    themeData.setCustomTokenColors(customTokenColors);
    let tokenStyle;
    const defaultTokenStyle = void 0;
    tokenStyle = themeData.resolveScopes([["variable"]]);
    assertTokenStyle(tokenStyle, ts("#F8F8F2", unsetStyle), "variable");
    tokenStyle = themeData.resolveScopes([["keyword.operator"]]);
    assertTokenStyle(
      tokenStyle,
      ts("#F92672", { italic: true, bold: true, underline: true }),
      "keyword"
    );
    tokenStyle = themeData.resolveScopes([["keyword"]]);
    assertTokenStyle(tokenStyle, defaultTokenStyle, "keyword");
    tokenStyle = themeData.resolveScopes([["keyword.operator"]]);
    assertTokenStyle(
      tokenStyle,
      ts("#F92672", { italic: true, bold: true, underline: true }),
      "keyword.operator"
    );
    tokenStyle = themeData.resolveScopes([["keyword.operators"]]);
    assertTokenStyle(tokenStyle, defaultTokenStyle, "keyword.operators");
    tokenStyle = themeData.resolveScopes([["storage"]]);
    assertTokenStyle(
      tokenStyle,
      ts("#F92672", { italic: true, bold: false, underline: false }),
      "storage"
    );
    tokenStyle = themeData.resolveScopes([["storage.type"]]);
    assertTokenStyle(
      tokenStyle,
      ts("#66D9EF", { italic: true, bold: false, underline: false }),
      "storage.type"
    );
    tokenStyle = themeData.resolveScopes([["entity.name.class"]]);
    assertTokenStyle(
      tokenStyle,
      ts("#A6E22E", { italic: false, bold: false, underline: true }),
      "entity.name.class"
    );
    tokenStyle = themeData.resolveScopes([
      ["meta.structure.dictionary.json", "string.quoted.double.json"]
    ]);
    assertTokenStyle(tokenStyle, ts("#66D9EF", void 0), "json property");
    tokenStyle = themeData.resolveScopes([
      ["keyword"],
      ["storage.type"],
      ["entity.name.class"]
    ]);
    assertTokenStyle(
      tokenStyle,
      ts("#66D9EF", { italic: true, bold: false, underline: false }),
      "storage.type"
    );
  });
  test("resolveScopes - match most specific", async () => {
    const themeData = ColorThemeData.createLoadedEmptyTheme("test", "test");
    const customTokenColors = {
      textMateRules: [
        {
          scope: "entity.name.type",
          settings: {
            fontStyle: "underline",
            foreground: "#A6E22E"
          }
        },
        {
          scope: "entity.name.type.class",
          settings: {
            foreground: "#FF00FF"
          }
        },
        {
          scope: "entity.name",
          settings: {
            foreground: "#FFFFFF"
          }
        }
      ]
    };
    themeData.setCustomTokenColors(customTokenColors);
    const tokenStyle = themeData.resolveScopes([
      ["entity.name.type.class"]
    ]);
    assertTokenStyle(
      tokenStyle,
      ts("#FF00FF", { italic: false, bold: false, underline: true }),
      "entity.name.type.class"
    );
  });
  test("rule matching", async () => {
    const themeData = ColorThemeData.createLoadedEmptyTheme("test", "test");
    themeData.setCustomColors({ "editor.foreground": "#000000" });
    themeData.setCustomSemanticTokenColors({
      enabled: true,
      rules: {
        type: "#ff0000",
        class: { foreground: "#0000ff", italic: true },
        "*.static": { bold: true },
        "*.declaration": { italic: true },
        "*.async.static": { italic: true, underline: true },
        "*.async": { foreground: "#000fff", underline: true }
      }
    });
    assertTokenStyles(themeData, {
      type: ts("#ff0000", undefinedStyle),
      "type.static": ts("#ff0000", { bold: true }),
      "type.static.declaration": ts("#ff0000", {
        bold: true,
        italic: true
      }),
      class: ts("#0000ff", { italic: true }),
      "class.static.declaration": ts("#0000ff", {
        bold: true,
        italic: true
      }),
      "class.declaration": ts("#0000ff", { italic: true }),
      "class.declaration.async": ts("#000fff", {
        underline: true,
        italic: true
      }),
      "class.declaration.async.static": ts("#000fff", {
        italic: true,
        underline: true,
        bold: true
      })
    });
  });
  test("super type", async () => {
    const registry = getTokenClassificationRegistry();
    registry.registerTokenType(
      "myTestInterface",
      "A type just for testing",
      "interface"
    );
    registry.registerTokenType(
      "myTestSubInterface",
      "A type just for testing",
      "myTestInterface"
    );
    try {
      const themeData = ColorThemeData.createLoadedEmptyTheme(
        "test",
        "test"
      );
      themeData.setCustomColors({ "editor.foreground": "#000000" });
      themeData.setCustomSemanticTokenColors({
        enabled: true,
        rules: {
          interface: "#ff0000",
          myTestInterface: { italic: true },
          "interface.static": { bold: true }
        }
      });
      assertTokenStyles(themeData, {
        myTestSubInterface: ts("#ff0000", { italic: true })
      });
      assertTokenStyles(themeData, {
        "myTestSubInterface.static": ts("#ff0000", {
          italic: true,
          bold: true
        })
      });
      themeData.setCustomSemanticTokenColors({
        enabled: true,
        rules: {
          interface: "#ff0000",
          myTestInterface: { foreground: "#ff00ff", italic: true }
        }
      });
      assertTokenStyles(themeData, {
        myTestSubInterface: ts("#ff00ff", { italic: true })
      });
    } finally {
      registry.deregisterTokenType("myTestInterface");
      registry.deregisterTokenType("myTestSubInterface");
    }
  });
  test("language", async () => {
    try {
      const themeData = ColorThemeData.createLoadedEmptyTheme(
        "test",
        "test"
      );
      themeData.setCustomColors({ "editor.foreground": "#000000" });
      themeData.setCustomSemanticTokenColors({
        enabled: true,
        rules: {
          interface: "#fff000",
          "interface:java": "#ff0000",
          "interface.static": { bold: true },
          "interface.static:typescript": { italic: true }
        }
      });
      assertTokenStyles(
        themeData,
        { interface: ts("#ff0000", void 0) },
        "java"
      );
      assertTokenStyles(
        themeData,
        { interface: ts("#fff000", void 0) },
        "typescript"
      );
      assertTokenStyles(
        themeData,
        { "interface.static": ts("#ff0000", { bold: true }) },
        "java"
      );
      assertTokenStyles(
        themeData,
        {
          "interface.static": ts("#fff000", {
            bold: true,
            italic: true
          })
        },
        "typescript"
      );
    } finally {
    }
  });
  test("language - scope resolving", async () => {
    const registry = getTokenClassificationRegistry();
    const numberOfDefaultRules = registry.getTokenStylingDefaultRules().length;
    registry.registerTokenStyleDefault(
      registry.parseTokenSelector("type", "typescript1"),
      { scopesToProbe: [["entity.name.type.ts1"]] }
    );
    registry.registerTokenStyleDefault(
      registry.parseTokenSelector("type:javascript1"),
      { scopesToProbe: [["entity.name.type.js1"]] }
    );
    try {
      const themeData = ColorThemeData.createLoadedEmptyTheme(
        "test",
        "test"
      );
      themeData.setCustomColors({ "editor.foreground": "#000000" });
      themeData.setCustomTokenColors({
        textMateRules: [
          {
            scope: "entity.name.type",
            settings: { foreground: "#aa0000" }
          },
          {
            scope: "entity.name.type.ts1",
            settings: { foreground: "#bb0000" }
          }
        ]
      });
      assertTokenStyles(
        themeData,
        { type: ts("#aa0000", void 0) },
        "javascript1"
      );
      assertTokenStyles(
        themeData,
        { type: ts("#bb0000", void 0) },
        "typescript1"
      );
    } finally {
      registry.deregisterTokenStyleDefault(
        registry.parseTokenSelector("type", "typescript1")
      );
      registry.deregisterTokenStyleDefault(
        registry.parseTokenSelector("type:javascript1")
      );
      assert.strictEqual(
        registry.getTokenStylingDefaultRules().length,
        numberOfDefaultRules
      );
    }
  });
});
