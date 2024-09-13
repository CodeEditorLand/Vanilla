import*as h from"../../../base/common/strings.js";import{EditOperation as S}from"../core/editOperation.js";import{Range as x}from"../core/range.js";import{StandardTokenType as I}from"../encodedTokenAttributes.js";class b{_selection;_selectionId;_cursors;_trimInRegexesAndStrings;constructor(t,n,i){this._selection=t,this._cursors=n,this._selectionId=null,this._trimInRegexesAndStrings=i}getEditOperations(t,n){const i=C(t,this._cursors,this._trimInRegexesAndStrings);for(let s=0,o=i.length;s<o;s++){const a=i[s];n.addEditOperation(a.range,a.text)}this._selectionId=n.trackSelection(this._selection)}computeCursorState(t,n){return n.getTrackedSelection(this._selectionId)}}function C(l,t,n){t.sort((e,m)=>e.lineNumber===m.lineNumber?e.column-m.column:e.lineNumber-m.lineNumber);for(let e=t.length-2;e>=0;e--)t[e].lineNumber===t[e+1].lineNumber&&t.splice(e,1);const i=[];let s=0,o=0;const a=t.length;for(let e=1,m=l.getLineCount();e<=m;e++){const c=l.getLineContent(e),u=c.length+1;let p=0;if(o<a&&t[o].lineNumber===e&&(p=t[o].column,o++,p===u)||c.length===0)continue;const d=h.lastNonWhitespaceIndex(c);let r=0;if(d===-1)r=1;else if(d!==c.length-1)r=d+2;else continue;if(!n){if(!l.tokenization.hasAccurateTokensForLine(e))continue;const g=l.tokenization.getLineTokens(e),f=g.getStandardTokenType(g.findTokenIndexAtOffset(r));if(f===I.String||f===I.RegEx)continue}r=Math.max(p,r),i[s++]=S.delete(new x(e,r,e,u))}return i}export{b as TrimTrailingWhitespaceCommand,C as trimTrailingWhitespace};
