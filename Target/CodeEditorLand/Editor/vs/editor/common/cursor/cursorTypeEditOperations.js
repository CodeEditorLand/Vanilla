import{CharCode as k}from"../../../base/common/charCode.js";import{onUnexpectedError as $}from"../../../base/common/errors.js";import*as E from"../../../base/common/strings.js";import{ReplaceCommand as I,ReplaceCommandThatPreservesSelection as G,ReplaceCommandWithOffsetCursorState as _,ReplaceCommandWithoutChangingPosition as w}from"../commands/replaceCommand.js";import{ShiftCommand as B}from"../commands/shiftCommand.js";import{SurroundSelectionCommand as H}from"../commands/surroundSelectionCommand.js";import{EditorAutoIndentStrategy as v}from"../config/editorOptions.js";import{Position as X}from"../core/position.js";import{Range as g}from"../core/range.js";import{WordCharacterClass as Y,getMapForWordSeparators as Z}from"../core/wordCharacterClassifier.js";import{EditOperationResult as f,EditOperationType as d,isQuote as A}from"../cursorCommon.js";import{getIndentActionForType as tt,getIndentForEnter as et,getInheritIndentForLine as nt}from"../languages/autoIndent.js";import{getEnterAction as j}from"../languages/enterAction.js";import{IndentAction as y}from"../languages/languageConfiguration.js";import{getIndentationAtPosition as rt}from"../languages/languageConfigurationRegistry.js";import{createScopedLineTokens as ot}from"../languages/supports.js";class Ot{static getEdits(t,e,o,n,r){if(!r&&this._isAutoIndentType(t,e,o)){const i=[];for(const a of o){const u=this._findActualIndentationForSelection(t,e,a,n);if(u===null)return;i.push({selection:a,indentation:u})}const s=it.getAutoClosingPairClose(t,e,o,n,!1);return this._getIndentationAndAutoClosingPairEdits(t,e,i,n,s)}}static _isAutoIndentType(t,e,o){if(t.autoIndent<v.Full)return!1;for(let n=0,r=o.length;n<r;n++)if(!e.tokenization.isCheapToTokenize(o[n].getEndPosition().lineNumber))return!1;return!0}static _findActualIndentationForSelection(t,e,o,n){const r=tt(t,e,o,n,{shiftIndent:s=>W(t,s),unshiftIndent:s=>M(t,s)},t.languageConfigurationService);if(r===null)return null;const i=rt(e,o.startLineNumber,o.startColumn);return r===t.normalizeIndentation(i)?null:r}static _getIndentationAndAutoClosingPairEdits(t,e,o,n,r){const i=o.map(({selection:a,indentation:u})=>{if(r!==null){const c=this._getEditFromIndentationAndSelection(t,e,u,a,n,!1);return new at(c,a,n,r)}else{const c=this._getEditFromIndentationAndSelection(t,e,u,a,n,!0);return T(c.range,c.text,!1)}}),s={shouldPushStackElementBefore:!0,shouldPushStackElementAfter:!1};return new f(d.TypingOther,i,s)}static _getEditFromIndentationAndSelection(t,e,o,n,r,i=!0){const s=n.startLineNumber,a=e.getLineFirstNonWhitespaceColumn(s);let u=t.normalizeIndentation(o);if(a!==0){const m=e.getLineContent(s);u+=m.substring(a-1,n.startColumn-1)}return u+=i?r:"",{range:new g(s,1,n.endLineNumber,n.endColumn),text:u}}}class xt{static getEdits(t,e,o,n,r,i){if(q(e,o,n,r,i))return this._runAutoClosingOvertype(t,n,i)}static _runAutoClosingOvertype(t,e,o){const n=[];for(let r=0,i=e.length;r<i;r++){const a=e[r].getPosition(),u=new g(a.lineNumber,a.column,a.lineNumber,a.column+1);n[r]=new I(u,o)}return new f(d.TypingOther,n,{shouldPushStackElementBefore:R(t,d.TypingOther),shouldPushStackElementAfter:!1})}}class At{static getEdits(t,e,o,n,r){if(q(t,e,o,n,r)){const i=o.map(s=>new I(new g(s.positionLineNumber,s.positionColumn,s.positionLineNumber,s.positionColumn+1),"",!1));return new f(d.TypingOther,i,{shouldPushStackElementBefore:!0,shouldPushStackElementAfter:!1})}}}class it{static getEdits(t,e,o,n,r,i){if(!i){const s=this.getAutoClosingPairClose(t,e,o,n,r);if(s!==null)return this._runAutoClosingOpenCharType(o,n,r,s)}}static _runAutoClosingOpenCharType(t,e,o,n){const r=[];for(let i=0,s=t.length;i<s;i++){const a=t[i];r[i]=new st(a,e,!o,n)}return new f(d.TypingOther,r,{shouldPushStackElementBefore:!0,shouldPushStackElementAfter:!1})}static getAutoClosingPairClose(t,e,o,n,r){for(const C of o)if(!C.isEmpty())return null;const i=o.map(C=>{const p=C.getPosition();return r?{lineNumber:p.lineNumber,beforeColumn:p.column-n.length,afterColumn:p.column}:{lineNumber:p.lineNumber,beforeColumn:p.column,afterColumn:p.column}}),s=this._findAutoClosingPairOpen(t,e,i.map(C=>new X(C.lineNumber,C.beforeColumn)),n);if(!s)return null;let a,u;if(A(n)?(a=t.autoClosingQuotes,u=t.shouldAutoCloseBefore.quote):(t.blockCommentStartToken?s.open.includes(t.blockCommentStartToken):!1)?(a=t.autoClosingComments,u=t.shouldAutoCloseBefore.comment):(a=t.autoClosingBrackets,u=t.shouldAutoCloseBefore.bracket),a==="never")return null;const m=this._findContainedAutoClosingPair(t,s),h=m?m.close:"";let b=!0;for(const C of i){const{lineNumber:p,beforeColumn:S,afterColumn:P}=C,N=e.getLineContent(p),O=N.substring(0,S-1),L=N.substring(P-1);if(L.startsWith(h)||(b=!1),L.length>0){const x=L.charAt(0);if(!this._isBeforeClosingBrace(t,L)&&!u(x))return null}if(s.open.length===1&&(n==="'"||n==='"')&&a!=="always"){const x=Z(t.wordSeparators,[]);if(O.length>0){const Q=O.charCodeAt(O.length-1);if(x.get(Q)===Y.Regular)return null}}if(!e.tokenization.isCheapToTokenize(p))return null;e.tokenization.forceTokenization(p);const K=e.tokenization.getLineTokens(p),F=ot(K,S-1);if(!s.shouldAutoClose(F,S-F.firstCharOffset))return null;const D=s.findNeutralCharacter();if(D){const x=e.tokenization.getTokenTypeIfInsertingCharacter(p,S,D);if(!s.isOK(x))return null}}return b?s.close.substring(0,s.close.length-h.length):s.close}static _findContainedAutoClosingPair(t,e){if(e.open.length<=1)return null;const o=e.close.charAt(e.close.length-1),n=t.autoClosingPairs.autoClosingPairsCloseByEnd.get(o)||[];let r=null;for(const i of n)i.open!==e.open&&e.open.includes(i.open)&&e.close.endsWith(i.close)&&(!r||i.open.length>r.open.length)&&(r=i);return r}static _findAutoClosingPairOpen(t,e,o,n){const r=t.autoClosingPairs.autoClosingPairsOpenByEnd.get(n);if(!r)return null;let i=null;for(const s of r)if(i===null||s.open.length>i.open.length){let a=!0;for(const u of o)if(e.getValueInRange(new g(u.lineNumber,u.column-s.open.length+1,u.lineNumber,u.column))+n!==s.open){a=!1;break}a&&(i=s)}return i}static _isBeforeClosingBrace(t,e){const o=e.charAt(0),n=t.autoClosingPairs.autoClosingPairsOpenByStart.get(o)||[],r=t.autoClosingPairs.autoClosingPairsCloseByStart.get(o)||[],i=n.some(a=>e.startsWith(a.open)),s=r.some(a=>e.startsWith(a.close));return!i&&s}}class Pt{static getEdits(t,e,o,n,r){if(!r&&this._isSurroundSelectionType(t,e,o,n))return this._runSurroundSelectionType(t,o,n)}static _runSurroundSelectionType(t,e,o){const n=[];for(let r=0,i=e.length;r<i;r++){const s=e[r],a=t.surroundingPairs[o];n[r]=new H(s,o,a)}return new f(d.Other,n,{shouldPushStackElementBefore:!0,shouldPushStackElementAfter:!0})}static _isSurroundSelectionType(t,e,o,n){if(!ut(t,n)||!t.surroundingPairs.hasOwnProperty(n))return!1;const r=A(n);for(const i of o){if(i.isEmpty())return!1;let s=!0;for(let a=i.startLineNumber;a<=i.endLineNumber;a++){const u=e.getLineContent(a),c=a===i.startLineNumber?i.startColumn-1:0,m=a===i.endLineNumber?i.endColumn-1:u.length,h=u.substring(c,m);if(/[^ \t]/.test(h)){s=!1;break}}if(s)return!1;if(r&&i.startLineNumber===i.endLineNumber&&i.startColumn+1===i.endColumn){const a=e.getValueInRange(i);if(A(a))return!1}}return!0}}class Nt{static getEdits(t,e,o,n,r,i){if(!i&&this._isTypeInterceptorElectricChar(e,o,n)){const s=this._typeInterceptorElectricChar(t,e,o,n[0],r);if(s)return s}}static _isTypeInterceptorElectricChar(t,e,o){return!!(o.length===1&&e.tokenization.isCheapToTokenize(o[0].getEndPosition().lineNumber))}static _typeInterceptorElectricChar(t,e,o,n,r){if(!e.electricChars.hasOwnProperty(r)||!n.isEmpty())return null;const i=n.getPosition();o.tokenization.forceTokenization(i.lineNumber);const s=o.tokenization.getLineTokens(i.lineNumber);let a;try{a=e.onElectricCharacter(r,s,i.column)}catch(u){return $(u),null}if(!a)return null;if(a.matchOpenBracket){const u=(s.getLineContent()+r).lastIndexOf(a.matchOpenBracket)+1,c=o.bracketPairs.findMatchingBracketUp(a.matchOpenBracket,{lineNumber:i.lineNumber,column:u},500);if(c){if(c.startLineNumber===i.lineNumber)return null;const m=o.getLineContent(c.startLineNumber),h=E.getLeadingWhitespace(m),b=e.normalizeIndentation(h),C=o.getLineContent(i.lineNumber),p=o.getLineFirstNonWhitespaceColumn(i.lineNumber)||i.column,S=C.substring(p-1,i.column-1),P=b+S+r,N=new g(i.lineNumber,1,i.lineNumber,i.column),O=new I(N,P);return new f(z(P,t),[O],{shouldPushStackElementBefore:!1,shouldPushStackElementAfter:!0})}}return null}}class Lt{static getEdits(t,e,o){const n=[];for(let i=0,s=e.length;i<s;i++)n[i]=new I(e[i],o);const r=z(o,t);return new f(r,n,{shouldPushStackElementBefore:R(t,r),shouldPushStackElementAfter:!1})}}class kt{static getEdits(t,e,o,n,r){if(!r&&n===`
`){const i=[];for(let s=0,a=o.length;s<a;s++)i[s]=this._enter(t,e,!1,o[s]);return new f(d.TypingOther,i,{shouldPushStackElementBefore:!0,shouldPushStackElementAfter:!1})}}static _enter(t,e,o,n){if(t.autoIndent===v.None)return T(n,`
`,o);if(!e.tokenization.isCheapToTokenize(n.getStartPosition().lineNumber)||t.autoIndent===v.Keep){const a=e.getLineContent(n.startLineNumber),u=E.getLeadingWhitespace(a).substring(0,n.startColumn-1);return T(n,`
`+t.normalizeIndentation(u),o)}const r=j(t.autoIndent,e,n,t.languageConfigurationService);if(r){if(r.indentAction===y.None)return T(n,`
`+t.normalizeIndentation(r.indentation+r.appendText),o);if(r.indentAction===y.Indent)return T(n,`
`+t.normalizeIndentation(r.indentation+r.appendText),o);if(r.indentAction===y.IndentOutdent){const a=t.normalizeIndentation(r.indentation),u=t.normalizeIndentation(r.indentation+r.appendText),c=`
`+u+`
`+a;return o?new w(n,c,!0):new _(n,c,-1,u.length-a.length,!0)}else if(r.indentAction===y.Outdent){const a=M(t,r.indentation);return T(n,`
`+t.normalizeIndentation(a+r.appendText),o)}}const i=e.getLineContent(n.startLineNumber),s=E.getLeadingWhitespace(i).substring(0,n.startColumn-1);if(t.autoIndent>=v.Full){const a=et(t.autoIndent,e,n,{unshiftIndent:u=>M(t,u),shiftIndent:u=>W(t,u),normalizeIndentation:u=>t.normalizeIndentation(u)},t.languageConfigurationService);if(a){let u=t.visibleColumnFromColumn(e,n.getEndPosition());const c=n.endColumn,m=e.getLineContent(n.endLineNumber),h=E.firstNonWhitespaceIndex(m);if(h>=0?n=n.setEndPosition(n.endLineNumber,Math.max(n.endColumn,h+1)):n=n.setEndPosition(n.endLineNumber,e.getLineMaxColumn(n.endLineNumber)),o)return new w(n,`
`+t.normalizeIndentation(a.afterEnter),!0);{let b=0;return c<=h+1&&(t.insertSpaces||(u=Math.ceil(u/t.indentSize)),b=Math.min(u+1-t.normalizeIndentation(a.afterEnter).length-1,0)),new _(n,`
`+t.normalizeIndentation(a.afterEnter),0,b,!0)}}}return T(n,`
`+t.normalizeIndentation(s),o)}static lineInsertBefore(t,e,o){if(e===null||o===null)return[];const n=[];for(let r=0,i=o.length;r<i;r++){let s=o[r].positionLineNumber;if(s===1)n[r]=new w(new g(1,1,1,1),`
`);else{s--;const a=e.getLineMaxColumn(s);n[r]=this._enter(t,e,!1,new g(s,a,s,a))}}return n}static lineInsertAfter(t,e,o){if(e===null||o===null)return[];const n=[];for(let r=0,i=o.length;r<i;r++){const s=o[r].positionLineNumber,a=e.getLineMaxColumn(s);n[r]=this._enter(t,e,!1,new g(s,a,s,a))}return n}static lineBreakInsert(t,e,o){const n=[];for(let r=0,i=o.length;r<i;r++)n[r]=this._enter(t,e,!0,o[r]);return n}}class _t{static getEdits(t,e,o,n,r,i){const s=this._distributePasteToCursors(t,o,n,r,i);return s?(o=o.sort(g.compareRangesUsingStarts),this._distributedPaste(t,e,o,s)):this._simplePaste(t,e,o,n,r)}static _distributePasteToCursors(t,e,o,n,r){if(n||e.length===1)return null;if(r&&r.length===e.length)return r;if(t.multiCursorPaste==="spread"){o.charCodeAt(o.length-1)===k.LineFeed&&(o=o.substring(0,o.length-1)),o.charCodeAt(o.length-1)===k.CarriageReturn&&(o=o.substring(0,o.length-1));const i=E.splitLines(o);if(i.length===e.length)return i}return null}static _distributedPaste(t,e,o,n){const r=[];for(let i=0,s=o.length;i<s;i++)r[i]=new I(o[i],n[i]);return new f(d.Other,r,{shouldPushStackElementBefore:!0,shouldPushStackElementAfter:!0})}static _simplePaste(t,e,o,n,r){const i=[];for(let s=0,a=o.length;s<a;s++){const u=o[s],c=u.getPosition();if(r&&!u.isEmpty()&&(r=!1),r&&n.indexOf(`
`)!==n.length-1&&(r=!1),r){const m=new g(c.lineNumber,1,c.lineNumber,1);i[s]=new G(m,n,u,!0)}else i[s]=new I(u,n)}return new f(d.Other,i,{shouldPushStackElementBefore:!0,shouldPushStackElementAfter:!0})}}class wt{static getEdits(t,e,o,n,r,i,s,a){const u=n.map(c=>this._compositionType(o,c,r,i,s,a));return new f(d.TypingOther,u,{shouldPushStackElementBefore:R(t,d.TypingOther),shouldPushStackElementAfter:!1})}static _compositionType(t,e,o,n,r,i){if(!e.isEmpty())return null;const s=e.getPosition(),a=Math.max(1,s.column-n),u=Math.min(t.getLineMaxColumn(s.lineNumber),s.column+r),c=new g(s.lineNumber,a,s.lineNumber,u);return t.getValueInRange(c)===o&&i===0?null:new _(c,o,0,i)}}class vt{static getEdits(t,e,o){const n=[];for(let i=0,s=e.length;i<s;i++)n[i]=new I(e[i],o);const r=z(o,t);return new f(r,n,{shouldPushStackElementBefore:R(t,r),shouldPushStackElementAfter:!1})}}class Rt{static getCommands(t,e,o){const n=[];for(let r=0,i=o.length;r<i;r++){const s=o[r];if(s.isEmpty()){const a=e.getLineContent(s.startLineNumber);if(/^\s*$/.test(a)&&e.tokenization.isCheapToTokenize(s.startLineNumber)){let u=this._goodIndentForLine(t,e,s.startLineNumber);u=u||"	";const c=t.normalizeIndentation(u);if(!a.startsWith(c)){n[r]=new I(new g(s.startLineNumber,1,s.startLineNumber,a.length+1),c,!0);continue}}n[r]=this._replaceJumpToNextIndent(t,e,s,!0)}else{if(s.startLineNumber===s.endLineNumber){const a=e.getLineMaxColumn(s.startLineNumber);if(s.startColumn!==1||s.endColumn!==a){n[r]=this._replaceJumpToNextIndent(t,e,s,!1);continue}}n[r]=new B(s,{isUnshift:!1,tabSize:t.tabSize,indentSize:t.indentSize,insertSpaces:t.insertSpaces,useTabStops:t.useTabStops,autoIndent:t.autoIndent},t.languageConfigurationService)}}return n}static _goodIndentForLine(t,e,o){let n=null,r="";const i=nt(t.autoIndent,e,o,!1,t.languageConfigurationService);if(i)n=i.action,r=i.indentation;else if(o>1){let s;for(s=o-1;s>=1;s--){const c=e.getLineContent(s);if(E.lastNonWhitespaceIndex(c)>=0)break}if(s<1)return null;const a=e.getLineMaxColumn(s),u=j(t.autoIndent,e,new g(s,a,s,a),t.languageConfigurationService);u&&(r=u.indentation+u.appendText)}return n&&(n===y.Indent&&(r=W(t,r)),n===y.Outdent&&(r=M(t,r)),r=t.normalizeIndentation(r)),r||null}static _replaceJumpToNextIndent(t,e,o,n){let r="";const i=o.getStartPosition();if(t.insertSpaces){const s=t.visibleColumnFromColumn(e,i),a=t.indentSize,u=a-s%a;for(let c=0;c<u;c++)r+=" "}else r="	";return new I(o,r,n)}}class J extends _{_openCharacter;_closeCharacter;closeCharacterRange;enclosingRange;constructor(t,e,o,n,r,i){super(t,e,o,n),this._openCharacter=r,this._closeCharacter=i,this.closeCharacterRange=null,this.enclosingRange=null}_computeCursorStateWithRange(t,e,o){return this.closeCharacterRange=new g(e.startLineNumber,e.endColumn-this._closeCharacter.length,e.endLineNumber,e.endColumn),this.enclosingRange=new g(e.startLineNumber,e.endColumn-this._openCharacter.length-this._closeCharacter.length,e.endLineNumber,e.endColumn),super.computeCursorState(t,o)}}class st extends J{constructor(t,e,o,n){const r=(o?e:"")+n,i=0,s=-n.length;super(t,r,i,s,e,n)}computeCursorState(t,e){const n=e.getInverseEditOperations()[0].range;return this._computeCursorStateWithRange(t,n,e)}}class at extends J{_autoIndentationEdit;_autoClosingEdit;constructor(t,e,o,n){const r=o+n,i=0,s=o.length;super(e,r,i,s,o,n),this._autoIndentationEdit=t,this._autoClosingEdit={range:e,text:r}}getEditOperations(t,e){e.addTrackedEditOperation(this._autoIndentationEdit.range,this._autoIndentationEdit.text),e.addTrackedEditOperation(this._autoClosingEdit.range,this._autoClosingEdit.text)}computeCursorState(t,e){const o=e.getInverseEditOperations();if(o.length!==2)throw new Error("There should be two inverse edit operations!");const n=o[0].range,r=o[1].range,i=n.plusRange(r);return this._computeCursorStateWithRange(t,i,e)}}function z(l,t){return l===" "?t===d.TypingFirstSpace||t===d.TypingConsecutiveSpace?d.TypingConsecutiveSpace:d.TypingFirstSpace:d.TypingOther}function R(l,t){return V(l)&&!V(t)?!0:l===d.TypingFirstSpace?!1:U(l)!==U(t)}function U(l){return l===d.TypingConsecutiveSpace||l===d.TypingFirstSpace?"space":l}function V(l){return l===d.TypingOther||l===d.TypingFirstSpace||l===d.TypingConsecutiveSpace}function q(l,t,e,o,n){if(l.autoClosingOvertype==="never"||!l.autoClosingPairs.autoClosingPairsCloseSingleChar.has(n))return!1;for(let r=0,i=e.length;r<i;r++){const s=e[r];if(!s.isEmpty())return!1;const a=s.getPosition(),u=t.getLineContent(a.lineNumber);if(u.charAt(a.column-1)!==n)return!1;const m=A(n);if((a.column>2?u.charCodeAt(a.column-2):k.Null)===k.Backslash&&m)return!1;if(l.autoClosingOvertype==="auto"){let b=!1;for(let C=0,p=o.length;C<p;C++){const S=o[C];if(a.lineNumber===S.startLineNumber&&a.column===S.startColumn){b=!0;break}}if(!b)return!1}}return!0}function T(l,t,e){return e?new w(l,t,!0):new I(l,t,!0)}function W(l,t,e){return e=e||1,B.shiftIndent(t,t.length+e,l.tabSize,l.indentSize,l.insertSpaces)}function M(l,t,e){return e=e||1,B.unshiftIndent(t,t.length+e,l.tabSize,l.indentSize,l.insertSpaces)}function ut(l,t){return A(t)?l.autoSurround==="quotes"||l.autoSurround==="languageDefined":l.autoSurround==="brackets"||l.autoSurround==="languageDefined"}export{it as AutoClosingOpenCharTypeOperation,xt as AutoClosingOvertypeOperation,At as AutoClosingOvertypeWithInterceptorsOperation,Ot as AutoIndentOperation,J as BaseTypeWithAutoClosingCommand,wt as CompositionOperation,kt as EnterOperation,Nt as InterceptorElectricCharOperation,_t as PasteOperation,Lt as SimpleCharacterTypeOperation,Pt as SurroundSelectionOperation,Rt as TabOperation,vt as TypeWithoutInterceptorsOperation,W as shiftIndent,ut as shouldSurroundChar,M as unshiftIndent};
