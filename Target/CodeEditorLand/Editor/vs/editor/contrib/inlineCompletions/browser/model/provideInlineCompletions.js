import{assertNever as E}from"../../../../../base/common/assert.js";import{DeferredPromise as N}from"../../../../../base/common/async.js";import{CancellationToken as k}from"../../../../../base/common/cancellation.js";import{SetMap as M}from"../../../../../base/common/map.js";import{onUnexpectedExternalError as w}from"../../../../../base/common/errors.js";import"../../../../../base/common/lifecycle.js";import"../../../../common/core/editOperation.js";import{Position as L}from"../../../../common/core/position.js";import{Range as h}from"../../../../common/core/range.js";import"../../../../common/languageFeatureRegistry.js";import"../../../../common/languages.js";import"../../../../common/languages/languageConfigurationRegistry.js";import"../../../../common/model.js";import{fixBracketsInLine as A}from"../../../../common/model/bracketPairsTextModelPart/fixBrackets.js";import{SingleTextEdit as B}from"../../../../common/core/textEdit.js";import{getReadonlyEmptyArray as D}from"../utils.js";import{SnippetParser as G,Text as W}from"../../../snippet/browser/snippetParser.js";import{LineEditWithAdditionalLines as z}from"../../../../common/tokenizationTextModelPart.js";import{OffsetRange as F}from"../../../../common/core/offsetRange.js";async function ye(r,e,i,a,f=k.None,p){const l=e instanceof L?J(e,i):e,c=r.all(i),t=new M;for(const n of c)n.groupId&&t.add(n.groupId,n);function u(n){if(!n.yieldsToGroupIds)return[];const s=[];for(const d of n.yieldsToGroupIds||[]){const m=t.get(d);for(const o of m)s.push(o)}return s}const I=new Map,g=new Set;function P(n,s){if(s=[...s,n],g.has(n))return s;g.add(n);try{const d=u(n);for(const m of d){const o=P(m,s);if(o)return o}}finally{g.delete(n)}}function x(n){const s=I.get(n);if(s)return s;const d=P(n,[]);d&&w(new Error(`Inline completions: cyclic yield-to dependency detected. Path: ${d.map(o=>o.toString?o.toString():""+o).join(" -> ")}`));const m=new N;return I.set(n,m.p),(async()=>{if(!d){const o=u(n);for(const R of o){const v=await x(R);if(v&&v.items.length>0)return}}try{return e instanceof L?await n.provideInlineCompletions(i,e,a,f):await n.provideInlineEdits?.(i,e,a,f)}catch(o){w(o);return}})().then(o=>m.complete(o),o=>m.error(o)),m.p}const b=await Promise.all(c.map(async n=>({provider:n,completions:await x(n)}))),y=new Map,T=[];for(const n of b){const s=n.completions;if(!s)continue;const d=new H(s,n.provider);T.push(d);for(const m of s.items){const o=C.from(m,d,l,i,p);y.set(o.hash(),o)}}return new j(Array.from(y.values()),new Set(y.keys()),T)}class j{constructor(e,i,a){this.completions=e;this.hashs=i;this.providerResults=a}has(e){return this.hashs.has(e.hash())}dispose(){for(const e of this.providerResults)e.removeRef()}}class H{constructor(e,i){this.inlineCompletions=e;this.provider=i}refCount=1;addRef(){this.refCount++}removeRef(){this.refCount--,this.refCount===0&&this.provider.freeInlineCompletions(this.inlineCompletions)}}class C{constructor(e,i,a,f,p,l,c,t){this.filterText=e;this.command=i;this.range=a;this.insertText=f;this.snippetInfo=p;this.additionalTextEdits=l;this.sourceInlineCompletion=c;this.source=t;e=e.replace(/\r\n|\r/g,`
`),f=e.replace(/\r\n|\r/g,`
`)}static from(e,i,a,f,p){let l,c,t=e.range?h.lift(e.range):a;if(typeof e.insertText=="string"){if(l=e.insertText,p&&e.completeBracketPairs){l=S(l,t.getStartPosition(),f,p);const u=l.length-e.insertText.length;u!==0&&(t=new h(t.startLineNumber,t.startColumn,t.endLineNumber,t.endColumn+u))}c=void 0}else if("snippet"in e.insertText){const u=e.insertText.snippet.length;if(p&&e.completeBracketPairs){e.insertText.snippet=S(e.insertText.snippet,t.getStartPosition(),f,p);const g=e.insertText.snippet.length-u;g!==0&&(t=new h(t.startLineNumber,t.startColumn,t.endLineNumber,t.endColumn+g))}const I=new G().parse(e.insertText.snippet);I.children.length===1&&I.children[0]instanceof W?(l=I.children[0].value,c=void 0):(l=I.toString(),c={snippet:e.insertText.snippet,range:t})}else E(e.insertText);return new C(l,e.command,t,l,c,e.additionalTextEdits||D(),e,i)}withRange(e){return new C(this.filterText,this.command,e,this.insertText,this.snippetInfo,this.additionalTextEdits,this.sourceInlineCompletion,this.source)}hash(){return JSON.stringify({insertText:this.insertText,range:this.range.toString()})}toSingleTextEdit(){return new B(this.range,this.insertText)}}function J(r,e){const i=e.getWordAtPosition(r),a=e.getLineMaxColumn(r.lineNumber);return i?new h(r.lineNumber,i.startColumn,r.lineNumber,a):h.fromPositions(r,r.with(void 0,a))}function S(r,e,i,a){const p=i.getLineContent(e.lineNumber).substring(0,e.column-1)+r,l=z.replace(F.ofStartAndLength(e.column-1,p.length-(e.column-1)),r),t=i.tokenization.tokenizeLineWithEdit(e.lineNumber,l)?.mainLineTokens?.sliceAndInflate(e.column-1,p.length,0);return t?A(t,a):r}export{C as InlineCompletionItem,H as InlineCompletionList,j as InlineCompletionProviderResult,ye as provideInlineCompletions};
