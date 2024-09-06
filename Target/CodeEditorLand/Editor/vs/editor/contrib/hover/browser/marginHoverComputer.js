import{asArray as u}from"../../../../../vs/base/common/arrays.js";import{isEmptyMarkdownString as l}from"../../../../../vs/base/common/htmlContent.js";import"../../../../../vs/editor/browser/editorBrowser.js";import{GlyphMarginLane as s}from"../../../../../vs/editor/common/model.js";import"../../../../../vs/editor/contrib/hover/browser/hoverOperation.js";class N{constructor(e){this._editor=e}_lineNumber=-1;_laneOrLine=s.Center;get lineNumber(){return this._lineNumber}set lineNumber(e){this._lineNumber=e}get lane(){return this._laneOrLine}set lane(e){this._laneOrLine=e}computeSync(){const e=r=>({value:r}),o=this._editor.getLineDecorations(this._lineNumber),n=[],t=this._laneOrLine==="lineNo";if(!o)return n;for(const r of o){const a=r.options.glyphMargin?.position??s.Center;if(!t&&a!==this._laneOrLine)continue;const i=t?r.options.lineNumberHoverMessage:r.options.glyphMarginHoverMessage;!i||l(i)||n.push(...u(i).map(e))}return n}}export{N as MarginHoverComputer};
