var S=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var h=(l,t,o,e)=>{for(var r=e>1?void 0:e?_(t,o):t,s=l.length-1,i;s>=0;s--)(i=l[s])&&(r=(e?i(t,o,r):i(r))||r);return e&&r&&S(t,o,r),r},u=(l,t)=>(o,e)=>t(o,e,l);import{RunOnceScheduler as x}from"../../../../../vs/base/common/async.js";import{DisposableStore as v}from"../../../../../vs/base/common/lifecycle.js";import{LRUCache as M}from"../../../../../vs/base/common/map.js";import{TernarySearchTree as b}from"../../../../../vs/base/common/ternarySearchTree.js";import"../../../../../vs/editor/common/core/position.js";import{CompletionItemKinds as f}from"../../../../../vs/editor/common/languages.js";import"../../../../../vs/editor/common/model.js";import"../../../../../vs/editor/contrib/suggest/browser/suggest.js";import{IConfigurationService as P}from"../../../../../vs/platform/configuration/common/configuration.js";import{InstantiationType as T,registerSingleton as C}from"../../../../../vs/platform/instantiation/common/extensions.js";import{createDecorator as O}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IStorageService as N,StorageScope as d,StorageTarget as k,WillSaveStateReason as w}from"../../../../../vs/platform/storage/common/storage.js";class g{constructor(t){this.name=t}select(t,o,e){if(e.length===0)return 0;const r=e[0].score[0];for(let s=0;s<e.length;s++){const{score:i,completion:n}=e[s];if(i[0]!==r)break;if(n.preselect)return s}return 0}}class I extends g{constructor(){super("first")}memorize(t,o,e){}toJSON(){}fromJSON(){}}class $ extends g{constructor(){super("recentlyUsed")}_cache=new M(300,.66);_seq=0;memorize(t,o,e){const r=`${t.getLanguageId()}/${e.textLabel}`;this._cache.set(r,{touch:this._seq++,type:e.completion.kind,insertText:e.completion.insertText})}select(t,o,e){if(e.length===0)return 0;const r=t.getLineContent(o.lineNumber).substr(o.column-10,o.column-1);if(/\s$/.test(r))return super.select(t,o,e);const s=e[0].score[0];let i=-1,n=-1,p=-1;for(let c=0;c<e.length&&e[c].score[0]===s;c++){const y=`${t.getLanguageId()}/${e[c].textLabel}`,m=this._cache.peek(y);if(m&&m.touch>p&&m.type===e[c].completion.kind&&m.insertText===e[c].completion.insertText&&(p=m.touch,n=c),e[c].completion.preselect&&i===-1)return i=c}return n!==-1?n:i!==-1?i:0}toJSON(){return this._cache.toJSON()}fromJSON(t){this._cache.clear();const o=0;for(const[e,r]of t)r.touch=o,r.type=typeof r.type=="number"?r.type:f.fromString(r.type),this._cache.set(e,r);this._seq=this._cache.size}}class J extends g{constructor(){super("recentlyUsedByPrefix")}_trie=b.forStrings();_seq=0;memorize(t,o,e){const{word:r}=t.getWordUntilPosition(o),s=`${t.getLanguageId()}/${r}`;this._trie.set(s,{type:e.completion.kind,insertText:e.completion.insertText,touch:this._seq++})}select(t,o,e){const{word:r}=t.getWordUntilPosition(o);if(!r)return super.select(t,o,e);const s=`${t.getLanguageId()}/${r}`;let i=this._trie.get(s);if(i||(i=this._trie.findSubstr(s)),i)for(let n=0;n<e.length;n++){const{kind:p,insertText:c}=e[n].completion;if(p===i.type&&c===i.insertText)return n}return super.select(t,o,e)}toJSON(){const t=[];return this._trie.forEach((o,e)=>t.push([e,o])),t.sort((o,e)=>-(o[1].touch-e[1].touch)).forEach((o,e)=>o[1].touch=e),t.slice(0,200)}fromJSON(t){if(this._trie.clear(),t.length>0){this._seq=t[0][1].touch+1;for(const[o,e]of t)e.type=typeof e.type=="number"?e.type:f.fromString(e.type),this._trie.set(o,e)}}}let a=class{constructor(t,o){this._storageService=t;this._configService=o;this._persistSoon=new x(()=>this._saveState(),500),this._disposables.add(t.onWillSaveState(e=>{e.reason===w.SHUTDOWN&&this._saveState()}))}static _strategyCtors=new Map([["recentlyUsedByPrefix",J],["recentlyUsed",$],["first",I]]);static _storagePrefix="suggest/memories";_serviceBrand;_persistSoon;_disposables=new v;_strategy;dispose(){this._disposables.dispose(),this._persistSoon.dispose()}memorize(t,o,e){this._withStrategy(t,o).memorize(t,o,e),this._persistSoon.schedule()}select(t,o,e){return this._withStrategy(t,o).select(t,o,e)}_withStrategy(t,o){const e=this._configService.getValue("editor.suggestSelection",{overrideIdentifier:t.getLanguageIdAtPosition(o.lineNumber,o.column),resource:t.uri});if(this._strategy?.name!==e){this._saveState();const r=a._strategyCtors.get(e)||I;this._strategy=new r;try{const i=this._configService.getValue("editor.suggest.shareSuggestSelections")?d.PROFILE:d.WORKSPACE,n=this._storageService.get(`${a._storagePrefix}/${e}`,i);n&&this._strategy.fromJSON(JSON.parse(n))}catch{}}return this._strategy}_saveState(){if(this._strategy){const o=this._configService.getValue("editor.suggest.shareSuggestSelections")?d.PROFILE:d.WORKSPACE,e=JSON.stringify(this._strategy);this._storageService.store(`${a._storagePrefix}/${this._strategy.name}`,e,o,k.MACHINE)}}};a=h([u(0,N),u(1,P)],a);const L=O("ISuggestMemories");C(L,a,T.Delayed);export{L as ISuggestMemoryService,$ as LRUMemory,g as Memory,I as NoMemory,J as PrefixMemory,a as SuggestMemoryService};
