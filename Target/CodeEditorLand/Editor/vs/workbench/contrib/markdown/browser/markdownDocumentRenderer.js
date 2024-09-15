var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { basicMarkupHtmlTags, hookDomPurifyHrefAndSrcSanitizer } from "../../../../base/browser/dom.js";
import * as dompurify from "../../../../base/browser/dompurify/dompurify.js";
import { allowedMarkdownAttr } from "../../../../base/browser/markdownRenderer.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import * as marked from "../../../../base/common/marked/marked.js";
import { Schemas } from "../../../../base/common/network.js";
import { escape } from "../../../../base/common/strings.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { tokenizeToString } from "../../../../editor/common/languages/textToHtmlTokenizer.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { markedGfmHeadingIdPlugin } from "./markedGfmHeadingIdPlugin.js";
const DEFAULT_MARKDOWN_STYLES = `
body {
	padding: 10px 20px;
	line-height: 22px;
	max-width: 882px;
	margin: 0 auto;
}

body *:last-child {
	margin-bottom: 0;
}

img {
	max-width: 100%;
	max-height: 100%;
}

a {
	text-decoration: var(--text-link-decoration);
}

a:hover {
	text-decoration: underline;
}

a:focus,
input:focus,
select:focus,
textarea:focus {
	outline: 1px solid -webkit-focus-ring-color;
	outline-offset: -1px;
}

hr {
	border: 0;
	height: 2px;
	border-bottom: 2px solid;
}

h1 {
	padding-bottom: 0.3em;
	line-height: 1.2;
	border-bottom-width: 1px;
	border-bottom-style: solid;
}

h1, h2, h3 {
	font-weight: normal;
}

table {
	border-collapse: collapse;
}

th {
	text-align: left;
	border-bottom: 1px solid;
}

th,
td {
	padding: 5px 10px;
}

table > tbody > tr + tr > td {
	border-top-width: 1px;
	border-top-style: solid;
}

blockquote {
	margin: 0 7px 0 5px;
	padding: 0 16px 0 10px;
	border-left-width: 5px;
	border-left-style: solid;
}

code {
	font-family: "SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace;
}

pre {
	padding: 16px;
	border-radius: 3px;
	overflow: auto;
}

pre code {
	font-family: var(--vscode-editor-font-family);
	font-weight: var(--vscode-editor-font-weight);
	font-size: var(--vscode-editor-font-size);
	line-height: 1.5;
	color: var(--vscode-editor-foreground);
	tab-size: 4;
}

.monaco-tokenized-source {
	white-space: pre;
}

/** Theming */

.pre {
	background-color: var(--vscode-textCodeBlock-background);
}

.vscode-high-contrast h1 {
	border-color: rgb(0, 0, 0);
}

.vscode-light th {
	border-color: rgba(0, 0, 0, 0.69);
}

.vscode-dark th {
	border-color: rgba(255, 255, 255, 0.69);
}

.vscode-light h1,
.vscode-light hr,
.vscode-light td {
	border-color: rgba(0, 0, 0, 0.18);
}

.vscode-dark h1,
.vscode-dark hr,
.vscode-dark td {
	border-color: rgba(255, 255, 255, 0.18);
}

@media (forced-colors: active) and (prefers-color-scheme: light){
	body {
		forced-color-adjust: none;
	}
}

@media (forced-colors: active) and (prefers-color-scheme: dark){
	body {
		forced-color-adjust: none;
	}
}
`;
const allowedProtocols = [Schemas.http, Schemas.https, Schemas.command];
function sanitize(documentContent, allowUnknownProtocols) {
  const hook = hookDomPurifyHrefAndSrcSanitizer(allowedProtocols, true);
  try {
    return dompurify.sanitize(documentContent, {
      ...{
        ALLOWED_TAGS: [
          ...basicMarkupHtmlTags,
          "checkbox",
          "checklist"
        ],
        ALLOWED_ATTR: [
          ...allowedMarkdownAttr,
          "data-command",
          "name",
          "id",
          "role",
          "tabindex",
          "x-dispatch",
          "required",
          "checked",
          "placeholder",
          "when-checked",
          "checked-on"
        ]
      },
      ...allowUnknownProtocols ? { ALLOW_UNKNOWN_PROTOCOLS: true } : {}
    });
  } finally {
    hook.dispose();
  }
}
__name(sanitize, "sanitize");
async function renderMarkdownDocument(text, extensionService, languageService, options) {
  const m = new marked.Marked(
    MarkedHighlight.markedHighlight({
      async: true,
      async highlight(code, lang) {
        if (typeof lang !== "string") {
          return escape(code);
        }
        await extensionService.whenInstalledExtensionsRegistered();
        if (options?.token?.isCancellationRequested) {
          return "";
        }
        const languageId = languageService.getLanguageIdByLanguageName(lang) ?? languageService.getLanguageIdByLanguageName(lang.split(/\s+|:|,|(?!^)\{|\?]/, 1)[0]);
        return tokenizeToString(languageService, code, languageId);
      }
    }),
    markedGfmHeadingIdPlugin(),
    ...options?.markedExtensions ?? []
  );
  const raw = await m.parse(text, { async: true });
  if (options?.shouldSanitize ?? true) {
    return sanitize(raw, options?.allowUnknownProtocols ?? false);
  } else {
    return raw;
  }
}
__name(renderMarkdownDocument, "renderMarkdownDocument");
var MarkedHighlight;
((MarkedHighlight2) => {
  function markedHighlight(options) {
    if (typeof options === "function") {
      options = {
        highlight: options
      };
    }
    if (!options || typeof options.highlight !== "function") {
      throw new Error("Must provide highlight function");
    }
    return {
      async: !!options.async,
      walkTokens(token) {
        if (token.type !== "code") {
          return;
        }
        const lang = getLang(token.lang);
        if (options.async) {
          return Promise.resolve(options.highlight(token.text, lang, token.lang || "")).then(updateToken(token));
        }
        const code = options.highlight(token.text, lang, token.lang || "");
        if (code instanceof Promise) {
          throw new Error("markedHighlight is not set to async but the highlight function is async. Set the async option to true on markedHighlight to await the async highlight function.");
        }
        updateToken(token)(code);
      },
      renderer: {
        code({ text, lang, escaped }) {
          const classAttr = lang ? ` class="language-${escape2(lang)}"` : "";
          text = text.replace(/\n$/, "");
          return `<pre><code${classAttr}>${escaped ? text : escape2(text, true)}
</code></pre>`;
        }
      }
    };
  }
  MarkedHighlight2.markedHighlight = markedHighlight;
  __name(markedHighlight, "markedHighlight");
  function getLang(lang) {
    return (lang || "").match(/\S*/)[0];
  }
  __name(getLang, "getLang");
  function updateToken(token) {
    return (code) => {
      if (typeof code === "string" && code !== token.text) {
        token.escaped = true;
        token.text = code;
      }
    };
  }
  __name(updateToken, "updateToken");
  const escapeTest = /[&<>"']/;
  const escapeReplace = new RegExp(escapeTest.source, "g");
  const escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
  const escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, "g");
  const escapeReplacement = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    [`'`]: "&#39;"
  };
  const getEscapeReplacement = /* @__PURE__ */ __name((ch) => escapeReplacement[ch], "getEscapeReplacement");
  function escape2(html, encode) {
    if (encode) {
      if (escapeTest.test(html)) {
        return html.replace(escapeReplace, getEscapeReplacement);
      }
    } else {
      if (escapeTestNoEncode.test(html)) {
        return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
      }
    }
    return html;
  }
  __name(escape2, "escape");
})(MarkedHighlight || (MarkedHighlight = {}));
export {
  DEFAULT_MARKDOWN_STYLES,
  renderMarkdownDocument
};
//# sourceMappingURL=markdownDocumentRenderer.js.map
