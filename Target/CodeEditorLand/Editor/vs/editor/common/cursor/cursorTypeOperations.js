import{ShiftCommand as C}from"../../../../vs/editor/common/commands/shiftCommand.js";import{CompositionSurroundSelectionCommand as O}from"../../../../vs/editor/common/commands/surroundSelectionCommand.js";import"../../../../vs/editor/common/core/position.js";import"../../../../vs/editor/common/core/range.js";import"../../../../vs/editor/common/core/selection.js";import{AutoClosingOpenCharTypeOperation as S,AutoClosingOvertypeOperation as h,AutoClosingOvertypeWithInterceptorsOperation as I,AutoIndentOperation as T,CompositionOperation as y,EnterOperation as x,InterceptorElectricCharOperation as M,PasteOperation as P,shiftIndent as R,shouldSurroundChar as z,SimpleCharacterTypeOperation as A,SurroundSelectionOperation as v,TabOperation as w,TypeWithoutInterceptorsOperation as W,unshiftIndent as k}from"../../../../vs/editor/common/cursor/cursorTypeEditOperations.js";import{EditOperationResult as Q,EditOperationType as U,isQuote as g}from"../../../../vs/editor/common/cursorCommon.js";import"../../../../vs/editor/common/editorCommon.js";import"../../../../vs/editor/common/model.js";class D{static indent(t,i,e){if(i===null||e===null)return[];const r=[];for(let n=0,l=e.length;n<l;n++)r[n]=new C(e[n],{isUnshift:!1,tabSize:t.tabSize,indentSize:t.indentSize,insertSpaces:t.insertSpaces,useTabStops:t.useTabStops,autoIndent:t.autoIndent},t.languageConfigurationService);return r}static outdent(t,i,e){const r=[];for(let n=0,l=e.length;n<l;n++)r[n]=new C(e[n],{isUnshift:!0,tabSize:t.tabSize,indentSize:t.indentSize,insertSpaces:t.insertSpaces,useTabStops:t.useTabStops,autoIndent:t.autoIndent},t.languageConfigurationService);return r}static shiftIndent(t,i,e){return R(t,i,e)}static unshiftIndent(t,i,e){return k(t,i,e)}static paste(t,i,e,r,n,l){return P.getEdits(t,i,e,r,n,l)}static tab(t,i,e){return w.getCommands(t,i,e)}static compositionType(t,i,e,r,n,l,o,s){return y.getEdits(t,i,e,r,n,l,o,s)}static compositionEndWithInterceptors(t,i,e,r,n,l){if(!r)return null;let o=null;for(const a of r)if(o===null)o=a.insertedText;else if(o!==a.insertedText)return null;if(!o||o.length!==1)return null;const s=o;let p=!1;for(const a of r)if(a.deletedText.length!==0){p=!0;break}if(p){if(!z(i,s)||!i.surroundingPairs.hasOwnProperty(s))return null;const a=g(s);for(const u of r)if(u.deletedSelectionStart!==0||u.deletedSelectionEnd!==u.deletedText.length||/^[ \t]+$/.test(u.deletedText)||a&&g(u.deletedText))return null;const d=[];for(const u of n){if(!u.isEmpty())return null;d.push(u.getPosition())}if(d.length!==r.length)return null;const f=[];for(let u=0,b=d.length;u<b;u++)f.push(new O(d[u],r[u].deletedText,i.surroundingPairs[s]));return new Q(U.TypingOther,f,{shouldPushStackElementBefore:!0,shouldPushStackElementAfter:!1})}const c=I.getEdits(i,e,n,l,s);if(c!==void 0)return c;const m=S.getEdits(i,e,n,s,!0,!1);return m!==void 0?m:null}static typeWithInterceptors(t,i,e,r,n,l,o){const s=x.getEdits(e,r,n,o,t);if(s!==void 0)return s;const p=T.getEdits(e,r,n,o,t);if(p!==void 0)return p;const c=h.getEdits(i,e,r,n,l,o);if(c!==void 0)return c;const m=S.getEdits(e,r,n,o,!1,t);if(m!==void 0)return m;const a=v.getEdits(e,r,n,o,t);if(a!==void 0)return a;const d=M.getEdits(i,e,r,n,o,t);return d!==void 0?d:A.getEdits(i,n,o)}static typeWithoutInterceptors(t,i,e,r,n){return W.getEdits(t,r,n)}}class tt{constructor(t,i,e,r,n,l){this.deletedText=t;this.deletedSelectionStart=i;this.deletedSelectionEnd=e;this.insertedText=r;this.insertedSelectionStart=n;this.insertedSelectionEnd=l}}export{tt as CompositionOutcome,D as TypeOperations};
