import{stringDiff as v}from"../../../base/common/diff/diff.js";import{BugIndicatingError as w}from"../../../base/common/errors.js";import{FileAccess as P}from"../../../base/common/network.js";import{createProxyObject as _,getAllMethodNames as D}from"../../../base/common/objects.js";import{StopWatch as E}from"../../../base/common/stopwatch.js";import{Position as T}from"../core/position.js";import{Range as f}from"../core/range.js";import{DiffComputer as k}from"../diff/legacyLinesDiffComputer.js";import{linesDiffComputers as S}from"../diff/linesDiffComputers.js";import{computeDefaultDocumentColors as H}from"../languages/defaultDocumentColorsComputer.js";import{computeLinks as $}from"../languages/linkComputer.js";import{BasicInplaceReplace as W}from"../languages/supports/inplaceReplaceSupport.js";import{createMonacoBaseAPI as A}from"./editorBaseApi.js";import{EditorWorkerHost as j}from"./editorWorkerHost.js";import{findSectionHeaders as O}from"./findSectionHeaders.js";import{WorkerTextModelSyncServer as q}from"./textModelSync/textModelSync.impl.js";import{UnicodeTextModelHighlighter as F}from"./unicodeTextModelHighlighter.js";const U=!0;class V{_requestHandlerBrand;_workerTextModelSyncServer=new q;constructor(){}dispose(){}_getModel(n){return this._workerTextModelSyncServer.getModel(n)}_getModels(){return this._workerTextModelSyncServer.getModels()}$acceptNewModel(n){this._workerTextModelSyncServer.$acceptNewModel(n)}$acceptModelChanged(n,e){this._workerTextModelSyncServer.$acceptModelChanged(n,e)}$acceptRemovedModel(n){this._workerTextModelSyncServer.$acceptRemovedModel(n)}async $computeUnicodeHighlights(n,e,l){const r=this._getModel(n);return r?F.computeUnicodeHighlights(r,e,l):{ranges:[],hasMore:!1,ambiguousCharacterCount:0,invisibleCharacterCount:0,nonBasicAsciiCharacterCount:0}}async $findSectionHeaders(n,e){const l=this._getModel(n);return l?O(l,e):[]}async $computeDiff(n,e,l,r){const s=this._getModel(n),c=this._getModel(e);return!s||!c?null:I.computeDiff(s,c,l,r)}static computeDiff(n,e,l,r){const s=r==="advanced"?S.getDefault():S.getLegacy(),c=n.getLinesContent(),a=e.getLinesContent(),o=s.computeDiff(c,a,l),t=o.changes.length>0?!1:this._modelsAreIdentical(n,e);function i(u){return u.map(m=>[m.original.startLineNumber,m.original.endLineNumberExclusive,m.modified.startLineNumber,m.modified.endLineNumberExclusive,m.innerChanges?.map(g=>[g.originalRange.startLineNumber,g.originalRange.startColumn,g.originalRange.endLineNumber,g.originalRange.endColumn,g.modifiedRange.startLineNumber,g.modifiedRange.startColumn,g.modifiedRange.endLineNumber,g.modifiedRange.endColumn])])}return{identical:t,quitEarly:o.hitTimeout,changes:i(o.changes),moves:o.moves.map(u=>[u.lineRangeMapping.original.startLineNumber,u.lineRangeMapping.original.endLineNumberExclusive,u.lineRangeMapping.modified.startLineNumber,u.lineRangeMapping.modified.endLineNumberExclusive,i(u.changes)])}}static _modelsAreIdentical(n,e){const l=n.getLineCount(),r=e.getLineCount();if(l!==r)return!1;for(let s=1;s<=l;s++){const c=n.getLineContent(s),a=e.getLineContent(s);if(c!==a)return!1}return!0}async $computeDirtyDiff(n,e,l){const r=this._getModel(n),s=this._getModel(e);if(!r||!s)return null;const c=r.getLinesContent(),a=s.getLinesContent();return new k(c,a,{shouldComputeCharChanges:!1,shouldPostProcessCharChanges:!1,shouldIgnoreTrimWhitespace:l,shouldMakePrettyDiff:!0,maxComputationTime:1e3}).computeDiff().changes}static _diffLimit=1e5;async $computeMoreMinimalEdits(n,e,l){const r=this._getModel(n);if(!r)return e;const s=[];let c;e=e.slice(0).sort((o,t)=>{if(o.range&&t.range)return f.compareRangesUsingStarts(o.range,t.range);const i=o.range?0:1,u=t.range?0:1;return i-u});let a=0;for(let o=1;o<e.length;o++)f.getEndPosition(e[a].range).equals(f.getStartPosition(e[o].range))?(e[a].range=f.fromPositions(f.getStartPosition(e[a].range),f.getEndPosition(e[o].range)),e[a].text+=e[o].text):(a++,e[a]=e[o]);e.length=a+1;for(let{range:o,text:t,eol:i}of e){if(typeof i=="number"&&(c=i),f.isEmpty(o)&&!t)continue;const u=r.getValueInRange(o);if(t=t.replace(/\r\n|\n|\r/g,r.eol),u===t)continue;if(Math.max(t.length,u.length)>I._diffLimit){s.push({range:o,text:t});continue}const m=v(u,t,l),g=r.offsetAt(f.lift(o).getStartPosition());for(const p of m){const L=r.positionAt(g+p.originalStart),y=r.positionAt(g+p.originalStart+p.originalLength),h={text:t.substr(p.modifiedStart,p.modifiedLength),range:{startLineNumber:L.lineNumber,startColumn:L.column,endLineNumber:y.lineNumber,endColumn:y.column}};r.getValueInRange(h.range)!==h.text&&s.push(h)}}return typeof c=="number"&&s.push({eol:c,text:"",range:{startLineNumber:0,startColumn:0,endLineNumber:0,endColumn:0}}),s}$computeHumanReadableDiff(n,e,l){const r=this._getModel(n);if(!r)return e;const s=[];let c;e=e.slice(0).sort((t,i)=>{if(t.range&&i.range)return f.compareRangesUsingStarts(t.range,i.range);const u=t.range?0:1,m=i.range?0:1;return u-m});for(let{range:t,text:i,eol:u}of e){let h=function(M,d){return new T(M.lineNumber+d.lineNumber-1,d.lineNumber===1?M.column+d.column-1:d.column)},N=function(M,d){const b=[];for(let C=d.startLineNumber;C<=d.endLineNumber;C++){const x=M[C-1];C===d.startLineNumber&&C===d.endLineNumber?b.push(x.substring(d.startColumn-1,d.endColumn-1)):C===d.startLineNumber?b.push(x.substring(d.startColumn-1)):C===d.endLineNumber?b.push(x.substring(0,d.endColumn-1)):b.push(x)}return b};var a=h,o=N;if(typeof u=="number"&&(c=u),f.isEmpty(t)&&!i)continue;const m=r.getValueInRange(t);if(i=i.replace(/\r\n|\n|\r/g,r.eol),m===i)continue;if(Math.max(i.length,m.length)>I._diffLimit){s.push({range:t,text:i});continue}const g=m.split(/\r\n|\n|\r/),p=i.split(/\r\n|\n|\r/),L=S.getDefault().computeDiff(g,p,l),y=f.lift(t).getStartPosition();for(const M of L.changes)if(M.innerChanges)for(const d of M.innerChanges)s.push({range:f.fromPositions(h(y,d.originalRange.getStartPosition()),h(y,d.originalRange.getEndPosition())),text:N(p,d.modifiedRange).join(r.eol)});else throw new w("The experimental diff algorithm always produces inner changes")}return typeof c=="number"&&s.push({eol:c,text:"",range:{startLineNumber:0,startColumn:0,endLineNumber:0,endColumn:0}}),s}async $computeLinks(n){const e=this._getModel(n);return e?$(e):null}async $computeDefaultDocumentColors(n){const e=this._getModel(n);return e?H(e):null}static _suggestionsLimit=1e4;async $textualSuggest(n,e,l,r){const s=new E,c=new RegExp(l,r),a=new Set;e:for(const o of n){const t=this._getModel(o);if(t){for(const i of t.words(c))if(!(i===e||!isNaN(Number(i)))&&(a.add(i),a.size>I._suggestionsLimit))break e}}return{words:Array.from(a),duration:s.elapsed()}}async $computeWordRanges(n,e,l,r){const s=this._getModel(n);if(!s)return Object.create(null);const c=new RegExp(l,r),a=Object.create(null);for(let o=e.startLineNumber;o<e.endLineNumber;o++){const t=s.getLineWords(o,c);for(const i of t){if(!isNaN(Number(i.word)))continue;let u=a[i.word];u||(u=[],a[i.word]=u),u.push({startLineNumber:o,startColumn:i.startColumn,endLineNumber:o,endColumn:i.endColumn})}}return a}async $navigateValueSet(n,e,l,r,s){const c=this._getModel(n);if(!c)return null;const a=new RegExp(r,s);e.startColumn===e.endColumn&&(e={startLineNumber:e.startLineNumber,startColumn:e.startColumn,endLineNumber:e.endLineNumber,endColumn:e.endColumn+1});const o=c.getValueInRange(e),t=c.getWordAtPosition({lineNumber:e.startLineNumber,column:e.startColumn},a);if(!t)return null;const i=c.getValueInRange(t);return W.INSTANCE.navigateValueSet(e,o,t,i,l)}}class I extends V{constructor(e,l){super();this._host=e;this._foreignModuleFactory=l}_foreignModule=null;async $ping(){return"pong"}$loadForeignModule(e,l,r){const a={host:_(r,(o,t)=>this._host.$fhr(o,t)),getMirrorModels:()=>this._getModels()};return this._foreignModuleFactory?(this._foreignModule=this._foreignModuleFactory(a,l),Promise.resolve(D(this._foreignModule))):new Promise((o,t)=>{const i=u=>{this._foreignModule=u.create(a,l),o(D(this._foreignModule))};U?import(`${P.asBrowserUri(`${e}.js`).toString(!0)}`).then(i).catch(t):require([`${e}`],i,t)})}$fmr(e,l){if(!this._foreignModule||typeof this._foreignModule[e]!="function")return Promise.reject(new Error("Missing requestHandler or method: "+e));try{return Promise.resolve(this._foreignModule[e].apply(this._foreignModule,l))}catch(r){return Promise.reject(r)}}}function ae(R){return new I(j.getChannel(R),null)}typeof importScripts=="function"&&(globalThis.monaco=A());export{V as BaseEditorSimpleWorker,I as EditorSimpleWorker,ae as create};
