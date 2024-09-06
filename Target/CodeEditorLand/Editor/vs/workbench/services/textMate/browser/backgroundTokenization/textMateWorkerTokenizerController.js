import{importAMDNodeModule as L}from"../../../../../../vs/amdX.js";import{Disposable as S}from"../../../../../../vs/base/common/lifecycle.js";import{autorun as I,keepObserved as b}from"../../../../../../vs/base/common/observable.js";import"../../../../../../vs/base/common/worker/simpleWorker.js";import{countEOL as C}from"../../../../../../vs/editor/common/core/eolCounter.js";import{LineRange as v}from"../../../../../../vs/editor/common/core/lineRange.js";import{Range as T}from"../../../../../../vs/editor/common/core/range.js";import"../../../../../../vs/editor/common/languages.js";import"../../../../../../vs/editor/common/model.js";import{TokenizationStateStore as y}from"../../../../../../vs/editor/common/model/textModelTokens.js";import"../../../../../../vs/editor/common/textModelEvents.js";import{ContiguousMultilineTokensBuilder as u}from"../../../../../../vs/editor/common/tokens/contiguousMultilineTokensBuilder.js";import"../../../../../../vs/platform/configuration/common/configuration.js";import{observableConfigValue as x}from"../../../../../../vs/platform/observable/common/platformObservableUtils.js";import{ArrayEdit as z,MonotonousIndexTransformer as f,SingleArrayEdit as M}from"../../../../../../vs/workbench/services/textMate/browser/arrayOperation.js";class k extends S{constructor(g,s,c,l,r,p){super();this._model=g;this._worker=s;this._languageIdCodec=c;this._backgroundTokenizationStore=l;this._configurationService=r;this._maxTokenizationLineLength=p;this._register(b(this._loggingEnabled)),this._register(this._model.onDidChangeContent(t=>{this._shouldLog&&console.log("model change",{fileName:this._model.uri.fsPath.split("\\").pop(),changes:h(t.changes)}),this._worker.$acceptModelChanged(this.controllerId,t),this._pendingChanges.push(t)})),this._register(this._model.onDidChangeLanguage(t=>{const n=this._model.getLanguageId(),i=this._languageIdCodec.encodeLanguageId(n);this._worker.$acceptModelLanguageChanged(this.controllerId,n,i)}));const e=this._model.getLanguageId(),o=this._languageIdCodec.encodeLanguageId(e);this._worker.$acceptNewModel({uri:this._model.uri,versionId:this._model.getVersionId(),lines:this._model.getLinesContent(),EOL:this._model.getEOL(),languageId:e,encodedLanguageId:o,maxTokenizationLineLength:this._maxTokenizationLineLength.get(),controllerId:this.controllerId}),this._register(I(t=>{const n=this._maxTokenizationLineLength.read(t);this._worker.$acceptMaxTokenizationLineLength(this.controllerId,n)}))}static _id=0;controllerId=k._id++;_pendingChanges=[];_states=new y;_loggingEnabled=x("editor.experimental.asyncTokenizationLogging",!1,this._configurationService);_applyStateStackDiffFn;_initialState;dispose(){super.dispose(),this._worker.$acceptRemovedModel(this.controllerId)}requestTokens(g,s){this._worker.$retokenize(this.controllerId,g,s)}async setTokensAndStates(g,s,c,l){if(this.controllerId!==g)return;let r=u.deserialize(new Uint8Array(c));if(this._shouldLog&&console.log("received background tokenization result",{fileName:this._model.uri.fsPath.split("\\").pop(),updatedTokenLines:r.map(e=>e.getLineRange()).join(" & "),updatedStateLines:l.map(e=>new v(e.startLineNumber,e.startLineNumber+e.stateDeltas.length).toString()).join(" & ")}),this._shouldLog){const e=this._pendingChanges.filter(o=>o.versionId<=s).map(o=>o.changes).map(o=>h(o)).join(" then ");console.log("Applying changes to local states",e)}for(;this._pendingChanges.length>0&&this._pendingChanges[0].versionId<=s;){const e=this._pendingChanges.shift();this._states.acceptChanges(e.changes)}if(this._pendingChanges.length>0){if(this._shouldLog){const t=this._pendingChanges.map(n=>n.changes).map(n=>h(n)).join(" then ");console.log("Considering non-processed changes",t)}const e=f.fromMany(this._pendingChanges.map(t=>_(t.changes))),o=new u;for(const t of r)for(let n=t.startLineNumber;n<=t.endLineNumber;n++)e.transform(n-1)!==void 0&&o.add(n,t.getLineTokens(n));r=o.finalize();for(const t of this._pendingChanges)for(const n of t.changes)for(let i=0;i<r.length;i++)r[i].applyEdit(n.range,n.text)}const p=f.fromMany(this._pendingChanges.map(e=>_(e.changes)));if(!this._applyStateStackDiffFn||!this._initialState){const{applyStateStackDiff:e,INITIAL:o}=await L("vscode-textmate","release/main.js");this._applyStateStackDiffFn=e,this._initialState=o}for(const e of l){let o=e.startLineNumber<=1?this._initialState:this._states.getEndState(e.startLineNumber-1);for(let t=0;t<e.stateDeltas.length;t++){const n=e.stateDeltas[t];let i;n?(i=this._applyStateStackDiffFn(o,n),this._states.setEndState(e.startLineNumber+t,i)):i=this._states.getEndState(e.startLineNumber+t);const m=p.transform(e.startLineNumber+t-1);m!==void 0&&this._backgroundTokenizationStore.setEndState(m+1,i),e.startLineNumber+t>=this._model.getLineCount()-1&&this._backgroundTokenizationStore.backgroundTokenizationFinished(),o=i}}this._backgroundTokenizationStore.setTokens(r)}get _shouldLog(){return this._loggingEnabled.get()}}function _(d){return new z(d.map(a=>new M(a.range.startLineNumber-1,a.range.endLineNumber-a.range.startLineNumber+1,C(a.text)[0]+1)))}function h(d){return d.map(a=>T.lift(a.range).toString()+" => "+a.text).join(" & ")}export{k as TextMateWorkerTokenizerController};