import{CharCode as d}from"../../../../../vs/base/common/charCode.js";import*as I from"../../../../../vs/base/common/strings.js";import{Constants as v}from"../../../../../vs/base/common/uint.js";import{EditOperation as _}from"../../../../../vs/editor/common/core/editOperation.js";import{Position as O}from"../../../../../vs/editor/common/core/position.js";import{Range as p}from"../../../../../vs/editor/common/core/range.js";import{Selection as x}from"../../../../../vs/editor/common/core/selection.js";import"../../../../../vs/editor/common/editorCommon.js";import"../../../../../vs/editor/common/languages/languageConfigurationRegistry.js";import"../../../../../vs/editor/common/model.js";import{BlockCommentCommand as b}from"../../../../../vs/editor/contrib/comment/browser/blockCommentCommand.js";var N=(e=>(e[e.Toggle=0]="Toggle",e[e.ForceAdd=1]="ForceAdd",e[e.ForceRemove=2]="ForceRemove",e))(N||{});class g{constructor(t,o,e,n,i,a,s){this.languageConfigurationService=t;this._selection=o,this._indentSize=e,this._type=n,this._insertSpace=i,this._selectionId=null,this._deltaColumn=0,this._moveEndPositionDown=!1,this._ignoreEmptyLines=a,this._ignoreFirstLine=s||!1}_selection;_indentSize;_type;_insertSpace;_ignoreEmptyLines;_selectionId;_deltaColumn;_moveEndPositionDown;_ignoreFirstLine;static _gatherPreflightCommentStrings(t,o,e,n){t.tokenization.tokenizeIfCheap(o);const i=t.getLanguageIdAtPosition(o,1),a=n.getLanguageConfiguration(i).comments,s=a?a.lineCommentToken:null;if(!s)return null;const r=[];for(let l=0,u=e-o+1;l<u;l++)r[l]={ignore:!1,commentStr:s,commentStrOffset:0,commentStrLength:s.length};return r}static _analyzeLines(t,o,e,n,i,a,s,r){let l=!0,u;t===0?u=!0:t===1?u=!1:u=!0;for(let m=0,f=n.length;m<f;m++){const c=n[m],L=i+m;if(L===i&&s){c.ignore=!0;continue}const h=e.getLineContent(L),C=I.firstNonWhitespaceIndex(h);if(C===-1){c.ignore=a,c.commentStrOffset=h.length;continue}if(l=!1,c.ignore=!1,c.commentStrOffset=C,u&&!b._haystackHasNeedleAtOffset(h,c.commentStr,C)&&(t===0?u=!1:t===1||(c.ignore=!0)),u&&o){const S=C+c.commentStrLength;S<h.length&&h.charCodeAt(S)===d.Space&&(c.commentStrLength+=1)}}if(t===0&&l){u=!1;for(let m=0,f=n.length;m<f;m++)n[m].ignore=!1}return{supported:!0,shouldRemoveComments:u,lines:n}}static _gatherPreflightData(t,o,e,n,i,a,s,r){const l=g._gatherPreflightCommentStrings(e,n,i,r);return l===null?{supported:!1}:g._analyzeLines(t,o,e,l,n,a,s,r)}_executeLineComments(t,o,e,n){let i;e.shouldRemoveComments?i=g._createRemoveLineCommentsOperations(e.lines,n.startLineNumber):(g._normalizeInsertionPoint(t,e.lines,n.startLineNumber,this._indentSize),i=this._createAddLineCommentsOperations(e.lines,n.startLineNumber));const a=new O(n.positionLineNumber,n.positionColumn);for(let s=0,r=i.length;s<r;s++)o.addEditOperation(i[s].range,i[s].text),p.isEmpty(i[s].range)&&p.getStartPosition(i[s].range).equals(a)&&t.getLineContent(a.lineNumber).length+1===a.column&&(this._deltaColumn=(i[s].text||"").length);this._selectionId=o.trackSelection(n)}_attemptRemoveBlockComment(t,o,e,n){let i=o.startLineNumber,a=o.endLineNumber;const s=n.length+Math.max(t.getLineFirstNonWhitespaceColumn(o.startLineNumber),o.startColumn);let r=t.getLineContent(i).lastIndexOf(e,s-1),l=t.getLineContent(a).indexOf(n,o.endColumn-1-e.length);return r!==-1&&l===-1&&(l=t.getLineContent(i).indexOf(n,r+e.length),a=i),r===-1&&l!==-1&&(r=t.getLineContent(a).lastIndexOf(e,l),i=a),o.isEmpty()&&(r===-1||l===-1)&&(r=t.getLineContent(i).indexOf(e),r!==-1&&(l=t.getLineContent(i).indexOf(n,r+e.length))),r!==-1&&t.getLineContent(i).charCodeAt(r+e.length)===d.Space&&(e+=" "),l!==-1&&t.getLineContent(a).charCodeAt(l-1)===d.Space&&(n=" "+n,l-=1),r!==-1&&l!==-1?b._createRemoveBlockCommentOperations(new p(i,r+e.length+1,a,l+1),e,n):null}_executeBlockComment(t,o,e){t.tokenization.tokenizeIfCheap(e.startLineNumber);const n=t.getLanguageIdAtPosition(e.startLineNumber,1),i=this.languageConfigurationService.getLanguageConfiguration(n).comments;if(!i||!i.blockCommentStartToken||!i.blockCommentEndToken)return;const a=i.blockCommentStartToken,s=i.blockCommentEndToken;let r=this._attemptRemoveBlockComment(t,e,a,s);if(!r){if(e.isEmpty()){const l=t.getLineContent(e.startLineNumber);let u=I.firstNonWhitespaceIndex(l);u===-1&&(u=l.length),r=b._createAddBlockCommentOperations(new p(e.startLineNumber,u+1,e.startLineNumber,l.length+1),a,s,this._insertSpace)}else r=b._createAddBlockCommentOperations(new p(e.startLineNumber,t.getLineFirstNonWhitespaceColumn(e.startLineNumber),e.endLineNumber,t.getLineMaxColumn(e.endLineNumber)),a,s,this._insertSpace);r.length===1&&(this._deltaColumn=a.length+1)}this._selectionId=o.trackSelection(e);for(const l of r)o.addEditOperation(l.range,l.text)}getEditOperations(t,o){let e=this._selection;if(this._moveEndPositionDown=!1,e.startLineNumber===e.endLineNumber&&this._ignoreFirstLine){o.addEditOperation(new p(e.startLineNumber,t.getLineMaxColumn(e.startLineNumber),e.startLineNumber+1,1),e.startLineNumber===t.getLineCount()?"":`
`),this._selectionId=o.trackSelection(e);return}e.startLineNumber<e.endLineNumber&&e.endColumn===1&&(this._moveEndPositionDown=!0,e=e.setEndPosition(e.endLineNumber-1,t.getLineMaxColumn(e.endLineNumber-1)));const n=g._gatherPreflightData(this._type,this._insertSpace,t,e.startLineNumber,e.endLineNumber,this._ignoreEmptyLines,this._ignoreFirstLine,this.languageConfigurationService);return n.supported?this._executeLineComments(t,o,n,e):this._executeBlockComment(t,o,e)}computeCursorState(t,o){let e=o.getTrackedSelection(this._selectionId);return this._moveEndPositionDown&&(e=e.setEndPosition(e.endLineNumber+1,1)),new x(e.selectionStartLineNumber,e.selectionStartColumn+this._deltaColumn,e.positionLineNumber,e.positionColumn+this._deltaColumn)}static _createRemoveLineCommentsOperations(t,o){const e=[];for(let n=0,i=t.length;n<i;n++){const a=t[n];a.ignore||e.push(_.delete(new p(o+n,a.commentStrOffset+1,o+n,a.commentStrOffset+a.commentStrLength+1)))}return e}_createAddLineCommentsOperations(t,o){const e=[],n=this._insertSpace?" ":"";for(let i=0,a=t.length;i<a;i++){const s=t[i];s.ignore||e.push(_.insert(new O(o+i,s.commentStrOffset+1),s.commentStr+n))}return e}static nextVisibleColumn(t,o,e,n){return e?t+(o-t%o):t+n}static _normalizeInsertionPoint(t,o,e,n){let i=v.MAX_SAFE_SMALL_INTEGER,a,s;for(let r=0,l=o.length;r<l;r++){if(o[r].ignore)continue;const u=t.getLineContent(e+r);let m=0;for(let f=0,c=o[r].commentStrOffset;m<i&&f<c;f++)m=g.nextVisibleColumn(m,n,u.charCodeAt(f)===d.Tab,1);m<i&&(i=m)}i=Math.floor(i/n)*n;for(let r=0,l=o.length;r<l;r++){if(o[r].ignore)continue;const u=t.getLineContent(e+r);let m=0;for(a=0,s=o[r].commentStrOffset;m<i&&a<s;a++)m=g.nextVisibleColumn(m,n,u.charCodeAt(a)===d.Tab,1);m>i?o[r].commentStrOffset=a-1:o[r].commentStrOffset=a}}}export{g as LineCommentCommand,N as Type};