import{ShiftCommand as C}from"../commands/shiftCommand.js";import{CompositionSurroundSelectionCommand as O}from"../commands/surroundSelectionCommand.js";import{EditOperationResult as h,EditOperationType as I,isQuote as S}from"../cursorCommon.js";import{AutoClosingOpenCharTypeOperation as g,AutoClosingOvertypeOperation as T,AutoClosingOvertypeWithInterceptorsOperation as y,AutoIndentOperation as x,CompositionOperation as M,EnterOperation as P,InterceptorElectricCharOperation as R,PasteOperation as z,SimpleCharacterTypeOperation as A,SurroundSelectionOperation as j,TabOperation as v,TypeWithoutInterceptorsOperation as w,shiftIndent as W,shouldSurroundChar as k,unshiftIndent as Q}from"./cursorTypeEditOperations.js";class F{static indent(t,i,e){if(i===null||e===null)return[];const r=[];for(let n=0,l=e.length;n<l;n++)r[n]=new C(e[n],{isUnshift:!1,tabSize:t.tabSize,indentSize:t.indentSize,insertSpaces:t.insertSpaces,useTabStops:t.useTabStops,autoIndent:t.autoIndent},t.languageConfigurationService);return r}static outdent(t,i,e){const r=[];for(let n=0,l=e.length;n<l;n++)r[n]=new C(e[n],{isUnshift:!0,tabSize:t.tabSize,indentSize:t.indentSize,insertSpaces:t.insertSpaces,useTabStops:t.useTabStops,autoIndent:t.autoIndent},t.languageConfigurationService);return r}static shiftIndent(t,i,e){return W(t,i,e)}static unshiftIndent(t,i,e){return Q(t,i,e)}static paste(t,i,e,r,n,l){return z.getEdits(t,i,e,r,n,l)}static tab(t,i,e){return v.getCommands(t,i,e)}static compositionType(t,i,e,r,n,l,o,s){return M.getEdits(t,i,e,r,n,l,o,s)}static compositionEndWithInterceptors(t,i,e,r,n,l){if(!r)return null;let o=null;for(const a of r)if(o===null)o=a.insertedText;else if(o!==a.insertedText)return null;if(!o||o.length!==1)return null;const s=o;let p=!1;for(const a of r)if(a.deletedText.length!==0){p=!0;break}if(p){if(!k(i,s)||!i.surroundingPairs.hasOwnProperty(s))return null;const a=S(s);for(const u of r)if(u.deletedSelectionStart!==0||u.deletedSelectionEnd!==u.deletedText.length||/^[ \t]+$/.test(u.deletedText)||a&&S(u.deletedText))return null;const d=[];for(const u of n){if(!u.isEmpty())return null;d.push(u.getPosition())}if(d.length!==r.length)return null;const f=[];for(let u=0,b=d.length;u<b;u++)f.push(new O(d[u],r[u].deletedText,i.surroundingPairs[s]));return new h(I.TypingOther,f,{shouldPushStackElementBefore:!0,shouldPushStackElementAfter:!1})}const c=y.getEdits(i,e,n,l,s);if(c!==void 0)return c;const m=g.getEdits(i,e,n,s,!0,!1);return m!==void 0?m:null}static typeWithInterceptors(t,i,e,r,n,l,o){const s=P.getEdits(e,r,n,o,t);if(s!==void 0)return s;const p=x.getEdits(e,r,n,o,t);if(p!==void 0)return p;const c=T.getEdits(i,e,r,n,l,o);if(c!==void 0)return c;const m=g.getEdits(e,r,n,o,!1,t);if(m!==void 0)return m;const a=j.getEdits(e,r,n,o,t);if(a!==void 0)return a;const d=R.getEdits(i,e,r,n,o,t);return d!==void 0?d:A.getEdits(i,n,o)}static typeWithoutInterceptors(t,i,e,r,n){return w.getEdits(t,r,n)}}class G{constructor(t,i,e,r,n,l){this.deletedText=t;this.deletedSelectionStart=i;this.deletedSelectionEnd=e;this.insertedText=r;this.insertedSelectionStart=n;this.insertedSelectionEnd=l}}export{G as CompositionOutcome,F as TypeOperations};
