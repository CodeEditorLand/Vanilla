import{splitLines as r}from"../../../../vs/base/common/strings.js";import"../../../../vs/base/common/uri.js";import{Position as l}from"../../../../vs/editor/common/core/position.js";import"../../../../vs/editor/common/core/range.js";import{PrefixSumComputer as o}from"../../../../vs/editor/common/model/prefixSumComputer.js";import"../../../../vs/editor/common/textModelEvents.js";class f{_uri;_lines;_eol;_versionId;_lineStarts;_cachedTextValue;constructor(e,i,t,n){this._uri=e,this._lines=i,this._eol=t,this._versionId=n,this._lineStarts=null,this._cachedTextValue=null}dispose(){this._lines.length=0}get version(){return this._versionId}getText(){return this._cachedTextValue===null&&(this._cachedTextValue=this._lines.join(this._eol)),this._cachedTextValue}onEvents(e){e.eol&&e.eol!==this._eol&&(this._eol=e.eol,this._lineStarts=null);const i=e.changes;for(const t of i)this._acceptDeleteRange(t.range),this._acceptInsertText(new l(t.range.startLineNumber,t.range.startColumn),t.text);this._versionId=e.versionId,this._cachedTextValue=null}_ensureLineStarts(){if(!this._lineStarts){const e=this._eol.length,i=this._lines.length,t=new Uint32Array(i);for(let n=0;n<i;n++)t[n]=this._lines[n].length+e;this._lineStarts=new o(t)}}_setLineText(e,i){this._lines[e]=i,this._lineStarts&&this._lineStarts.setValue(e,this._lines[e].length+this._eol.length)}_acceptDeleteRange(e){if(e.startLineNumber===e.endLineNumber){if(e.startColumn===e.endColumn)return;this._setLineText(e.startLineNumber-1,this._lines[e.startLineNumber-1].substring(0,e.startColumn-1)+this._lines[e.startLineNumber-1].substring(e.endColumn-1));return}this._setLineText(e.startLineNumber-1,this._lines[e.startLineNumber-1].substring(0,e.startColumn-1)+this._lines[e.endLineNumber-1].substring(e.endColumn-1)),this._lines.splice(e.startLineNumber,e.endLineNumber-e.startLineNumber),this._lineStarts&&this._lineStarts.removeValues(e.startLineNumber,e.endLineNumber-e.startLineNumber)}_acceptInsertText(e,i){if(i.length===0)return;const t=r(i);if(t.length===1){this._setLineText(e.lineNumber-1,this._lines[e.lineNumber-1].substring(0,e.column-1)+t[0]+this._lines[e.lineNumber-1].substring(e.column-1));return}t[t.length-1]+=this._lines[e.lineNumber-1].substring(e.column-1),this._setLineText(e.lineNumber-1,this._lines[e.lineNumber-1].substring(0,e.column-1)+t[0]);const n=new Uint32Array(t.length-1);for(let s=1;s<t.length;s++)this._lines.splice(e.lineNumber+s-1,0,t[s]),n[s-1]=t[s].length+this._eol.length;this._lineStarts&&this._lineStarts.insertValues(e.lineNumber,n)}}export{f as MirrorTextModel};
