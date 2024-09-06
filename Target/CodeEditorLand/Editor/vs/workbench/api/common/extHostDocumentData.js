import{equals as _}from"../../../../vs/base/common/arrays.js";import{ok as h}from"../../../../vs/base/common/assert.js";import{Schemas as m}from"../../../../vs/base/common/network.js";import{regExpLeadsToEndlessLoop as p}from"../../../../vs/base/common/strings.js";import"../../../../vs/base/common/uri.js";import{ensureValidWordDefinition as f,getWordAtText as v}from"../../../../vs/editor/common/core/wordHelper.js";import{MirrorTextModel as x}from"../../../../vs/editor/common/model/mirrorTextModel.js";import"../../../../vs/workbench/api/common/extHost.protocol.js";import{EndOfLine as g,Position as d,Range as l}from"../../../../vs/workbench/api/common/extHostTypes.js";const c=new Map;function C(s,o){o?c.set(s,o):c.delete(s)}function b(s){return c.get(s)}class M extends x{constructor(t,e,i,n,r,a,u){super(e,i,n,r);this._proxy=t;this._languageId=a;this._isDirty=u}_document;_isDisposed=!1;dispose(){h(!this._isDisposed),this._isDisposed=!0,this._isDirty=!1}equalLines(t){return _(this._lines,t)}get document(){if(!this._document){const t=this;this._document={get uri(){return t._uri},get fileName(){return t._uri.fsPath},get isUntitled(){return t._uri.scheme===m.untitled},get languageId(){return t._languageId},get version(){return t._versionId},get isClosed(){return t._isDisposed},get isDirty(){return t._isDirty},save(){return t._save()},getText(e){return e?t._getTextInRange(e):t.getText()},get eol(){return t._eol===`
`?g.LF:g.CRLF},get lineCount(){return t._lines.length},lineAt(e){return t._lineAt(e)},offsetAt(e){return t._offsetAt(e)},positionAt(e){return t._positionAt(e)},validateRange(e){return t._validateRange(e)},validatePosition(e){return t._validatePosition(e)},getWordRangeAtPosition(e,i){return t._getWordRangeAtPosition(e,i)},[Symbol.for("debug.description")](){return`TextDocument(${t._uri.toString()})`}}}return Object.freeze(this._document)}_acceptLanguageId(t){h(!this._isDisposed),this._languageId=t}_acceptIsDirty(t){h(!this._isDisposed),this._isDirty=t}_save(){return this._isDisposed?Promise.reject(new Error("Document has been closed")):this._proxy.$trySaveDocument(this._uri)}_getTextInRange(t){const e=this._validateRange(t);if(e.isEmpty)return"";if(e.isSingleLine)return this._lines[e.start.line].substring(e.start.character,e.end.character);const i=this._eol,n=e.start.line,r=e.end.line,a=[];a.push(this._lines[n].substring(e.start.character));for(let u=n+1;u<r;u++)a.push(this._lines[u]);return a.push(this._lines[r].substring(0,e.end.character)),a.join(i)}_lineAt(t){let e;if(t instanceof d?e=t.line:typeof t=="number"&&(e=t),typeof e!="number"||e<0||e>=this._lines.length||Math.floor(e)!==e)throw new Error("Illegal value for `line`");return new D(e,this._lines[e],e===this._lines.length-1)}_offsetAt(t){return t=this._validatePosition(t),this._ensureLineStarts(),this._lineStarts.getPrefixSum(t.line-1)+t.character}_positionAt(t){t=Math.floor(t),t=Math.max(0,t),this._ensureLineStarts();const e=this._lineStarts.getIndexOf(t),i=this._lines[e.index].length;return new d(e.index,Math.min(e.remainder,i))}_validateRange(t){if(!(t instanceof l))throw new Error("Invalid argument");const e=this._validatePosition(t.start),i=this._validatePosition(t.end);return e===t.start&&i===t.end?t:new l(e.line,e.character,i.line,i.character)}_validatePosition(t){if(!(t instanceof d))throw new Error("Invalid argument");if(this._lines.length===0)return t.with(0,0);let{line:e,character:i}=t,n=!1;if(e<0)e=0,i=0,n=!0;else if(e>=this._lines.length)e=this._lines.length-1,i=this._lines[e].length,n=!0;else{const r=this._lines[e].length;i<0?(i=0,n=!0):i>r&&(i=r,n=!0)}return n?new d(e,i):t}_getWordRangeAtPosition(t,e){const i=this._validatePosition(t);if(!e)e=b(this._languageId);else if(p(e))throw new Error(`[getWordRangeAtPosition]: ignoring custom regexp '${e.source}' because it matches the empty string.`);const n=v(i.character+1,f(e),this._lines[i.line],0);if(n)return new l(i.line,n.startColumn-1,i.line,n.endColumn-1)}}class D{_line;_text;_isLastLine;constructor(o,t,e){this._line=o,this._text=t,this._isLastLine=e}get lineNumber(){return this._line}get text(){return this._text}get range(){return new l(this._line,0,this._line,this._text.length)}get rangeIncludingLineBreak(){return this._isLastLine?this.range:new l(this._line,0,this._line+1,0)}get firstNonWhitespaceCharacterIndex(){return/^(\s*)/.exec(this._text)[1].length}get isEmptyOrWhitespace(){return this.firstNonWhitespaceCharacterIndex===this._text.length}}export{M as ExtHostDocumentData,D as ExtHostDocumentLine,C as setWordDefinitionFor};