import{asArray as a}from"../../../../base/common/arrays.js";import{isEmptyMarkdownString as m}from"../../../../base/common/htmlContent.js";import{GlyphMarginLane as l}from"../../../common/model.js";class M{constructor(r){this._editor=r}computeSync(r){const s=e=>({value:e}),t=this._editor.getLineDecorations(r.lineNumber),o=[],i=r.laneOrLine==="lineNo";if(!t)return o;for(const e of t){const p=e.options.glyphMargin?.position??l.Center;if(!i&&p!==r.laneOrLine)continue;const n=i?e.options.lineNumberHoverMessage:e.options.glyphMarginHoverMessage;!n||m(n)||o.push(...a(n).map(s))}return o}}export{M as GlyphHoverComputer};
