var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Color } from "../../../../base/common/color.js";
import { Schemas } from "../../../../base/common/network.js";
import { basename } from "../../../../base/common/resources.js";
import { splitLines } from "../../../../base/common/strings.js";
import { URI } from "../../../../base/common/uri.js";
import { TokenMetadata } from "../../../../editor/common/encodedTokenAttributes.js";
import { TokenizationRegistry } from "../../../../editor/common/languages.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { EditorResourceAccessor } from "../../../common/editor.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { ITextMateTokenizationService } from "../../../services/textMate/browser/textMateTokenizationFeature.js";
import {
  findMatchingThemeRule
} from "../../../services/textMate/common/TMHelper.js";
import {
  IWorkbenchThemeService
} from "../../../services/themes/common/workbenchThemeService.js";
class ThemeDocument {
  _theme;
  _cache;
  _defaultColor;
  constructor(theme) {
    this._theme = theme;
    this._cache = /* @__PURE__ */ Object.create(null);
    this._defaultColor = "#000000";
    for (let i = 0, len = this._theme.tokenColors.length; i < len; i++) {
      const rule = this._theme.tokenColors[i];
      if (!rule.scope) {
        this._defaultColor = rule.settings.foreground;
      }
    }
  }
  _generateExplanation(selector, color) {
    return `${selector}: ${Color.Format.CSS.formatHexA(color, true).toUpperCase()}`;
  }
  explainTokenColor(scopes, color) {
    const matchingRule = this._findMatchingThemeRule(scopes);
    if (!matchingRule) {
      const expected2 = Color.fromHex(this._defaultColor);
      if (!color.equals(expected2)) {
        throw new Error(
          `[${this._theme.label}]: Unexpected color ${Color.Format.CSS.formatHexA(color)} for ${scopes}. Expected default ${Color.Format.CSS.formatHexA(expected2)}`
        );
      }
      return this._generateExplanation("default", color);
    }
    const expected = Color.fromHex(matchingRule.settings.foreground);
    if (!color.equals(expected)) {
      throw new Error(
        `[${this._theme.label}]: Unexpected color ${Color.Format.CSS.formatHexA(color)} for ${scopes}. Expected ${Color.Format.CSS.formatHexA(expected)} coming in from ${matchingRule.rawSelector}`
      );
    }
    return this._generateExplanation(matchingRule.rawSelector, color);
  }
  _findMatchingThemeRule(scopes) {
    if (!this._cache[scopes]) {
      this._cache[scopes] = findMatchingThemeRule(
        this._theme,
        scopes.split(" ")
      );
    }
    return this._cache[scopes];
  }
}
let Snapper = class {
  constructor(languageService, themeService, textMateService) {
    this.languageService = languageService;
    this.themeService = themeService;
    this.textMateService = textMateService;
  }
  _themedTokenize(grammar, lines) {
    const colorMap = TokenizationRegistry.getColorMap();
    let state = null;
    const result = [];
    let resultLen = 0;
    for (let i = 0, len = lines.length; i < len; i++) {
      const line = lines[i];
      const tokenizationResult = grammar.tokenizeLine2(line, state);
      for (let j = 0, lenJ = tokenizationResult.tokens.length >>> 1; j < lenJ; j++) {
        const startOffset = tokenizationResult.tokens[j << 1];
        const metadata = tokenizationResult.tokens[(j << 1) + 1];
        const endOffset = j + 1 < lenJ ? tokenizationResult.tokens[j + 1 << 1] : line.length;
        const tokenText = line.substring(startOffset, endOffset);
        const color = TokenMetadata.getForeground(metadata);
        result[resultLen++] = {
          text: tokenText,
          color: colorMap[color]
        };
      }
      state = tokenizationResult.ruleStack;
    }
    return result;
  }
  _tokenize(grammar, lines) {
    let state = null;
    const result = [];
    let resultLen = 0;
    for (let i = 0, len = lines.length; i < len; i++) {
      const line = lines[i];
      const tokenizationResult = grammar.tokenizeLine(line, state);
      let lastScopes = null;
      for (let j = 0, lenJ = tokenizationResult.tokens.length; j < lenJ; j++) {
        const token = tokenizationResult.tokens[j];
        const tokenText = line.substring(
          token.startIndex,
          token.endIndex
        );
        const tokenScopes = token.scopes.join(" ");
        if (lastScopes === tokenScopes) {
          result[resultLen - 1].c += tokenText;
        } else {
          lastScopes = tokenScopes;
          result[resultLen++] = {
            c: tokenText,
            t: tokenScopes,
            r: {
              dark_plus: void 0,
              light_plus: void 0,
              dark_vs: void 0,
              light_vs: void 0,
              hc_black: void 0
            }
          };
        }
      }
      state = tokenizationResult.ruleStack;
    }
    return result;
  }
  async _getThemesResult(grammar, lines) {
    const currentTheme = this.themeService.getColorTheme();
    const getThemeName = (id) => {
      const part = "vscode-theme-defaults-themes-";
      const startIdx = id.indexOf(part);
      if (startIdx !== -1) {
        return id.substring(startIdx + part.length, id.length - 5);
      }
      return void 0;
    };
    const result = {};
    const themeDatas = await this.themeService.getColorThemes();
    const defaultThemes = themeDatas.filter(
      (themeData) => !!getThemeName(themeData.id)
    );
    for (const defaultTheme of defaultThemes) {
      const themeId = defaultTheme.id;
      const success = await this.themeService.setColorTheme(
        themeId,
        void 0
      );
      if (success) {
        const themeName = getThemeName(themeId);
        result[themeName] = {
          document: new ThemeDocument(
            this.themeService.getColorTheme()
          ),
          tokens: this._themedTokenize(grammar, lines)
        };
      }
    }
    await this.themeService.setColorTheme(currentTheme.id, void 0);
    return result;
  }
  _enrichResult(result, themesResult) {
    const index = {};
    const themeNames = Object.keys(themesResult);
    for (const themeName of themeNames) {
      index[themeName] = 0;
    }
    for (let i = 0, len = result.length; i < len; i++) {
      const token = result[i];
      for (const themeName of themeNames) {
        const themedToken = themesResult[themeName].tokens[index[themeName]];
        themedToken.text = themedToken.text.substr(token.c.length);
        token.r[themeName] = themesResult[themeName].document.explainTokenColor(token.t, themedToken.color);
        if (themedToken.text.length === 0) {
          index[themeName]++;
        }
      }
    }
  }
  captureSyntaxTokens(fileName, content) {
    const languageId = this.languageService.guessLanguageIdByFilepathOrFirstLine(
      URI.file(fileName)
    );
    return this.textMateService.createTokenizer(languageId).then((grammar) => {
      if (!grammar) {
        return [];
      }
      const lines = splitLines(content);
      const result = this._tokenize(grammar, lines);
      return this._getThemesResult(grammar, lines).then(
        (themesResult) => {
          this._enrichResult(result, themesResult);
          return result.filter((t) => t.c.length > 0);
        }
      );
    });
  }
};
Snapper = __decorateClass([
  __decorateParam(0, ILanguageService),
  __decorateParam(1, IWorkbenchThemeService),
  __decorateParam(2, ITextMateTokenizationService)
], Snapper);
CommandsRegistry.registerCommand(
  "_workbench.captureSyntaxTokens",
  (accessor, resource) => {
    const process = (resource2) => {
      const fileService = accessor.get(IFileService);
      const fileName = basename(resource2);
      const snapper = accessor.get(IInstantiationService).createInstance(Snapper);
      return fileService.readFile(resource2).then((content) => {
        return snapper.captureSyntaxTokens(
          fileName,
          content.value.toString()
        );
      });
    };
    if (resource) {
      return process(resource);
    } else {
      const editorService = accessor.get(IEditorService);
      const file = editorService.activeEditor ? EditorResourceAccessor.getCanonicalUri(
        editorService.activeEditor,
        { filterByScheme: Schemas.file }
      ) : null;
      if (file) {
        process(file).then((result) => {
          console.log(result);
        });
      } else {
        console.log("No file editor active");
      }
    }
    return void 0;
  }
);
