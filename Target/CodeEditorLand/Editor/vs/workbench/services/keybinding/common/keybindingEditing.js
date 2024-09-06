var m=Object.defineProperty;var K=Object.getOwnPropertyDescriptor;var b=(u,a,i,e)=>{for(var t=e>1?void 0:e?K(a,i):a,n=u.length-1,r;n>=0;n--)(r=u[n])&&(t=(e?r(a,i,t):r(t))||t);return e&&t&&m(a,i,t),t},f=(u,a)=>(i,e)=>a(i,e,u);import{Queue as E}from"../../../../../vs/base/common/async.js";import*as c from"../../../../../vs/base/common/json.js";import{setProperty as l}from"../../../../../vs/base/common/jsonEdit.js";import"../../../../../vs/base/common/jsonFormatter.js";import{Disposable as I}from"../../../../../vs/base/common/lifecycle.js";import*as x from"../../../../../vs/base/common/objects.js";import{EditOperation as h}from"../../../../../vs/editor/common/core/editOperation.js";import{Range as R}from"../../../../../vs/editor/common/core/range.js";import{Selection as w}from"../../../../../vs/editor/common/core/selection.js";import"../../../../../vs/editor/common/model.js";import{ITextModelService as P}from"../../../../../vs/editor/common/services/resolverService.js";import{localize as v}from"../../../../../vs/nls.js";import{ContextKeyExpr as p}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IFileService as S}from"../../../../../vs/platform/files/common/files.js";import{InstantiationType as T,registerSingleton as U}from"../../../../../vs/platform/instantiation/common/extensions.js";import{createDecorator as D}from"../../../../../vs/platform/instantiation/common/instantiation.js";import"../../../../../vs/platform/keybinding/common/keybinding.js";import"../../../../../vs/platform/keybinding/common/resolvedKeybindingItem.js";import{ITextFileService as M}from"../../../../../vs/workbench/services/textfile/common/textfiles.js";import{IUserDataProfileService as F}from"../../../../../vs/workbench/services/userDataProfile/common/userDataProfile.js";const V=D("keybindingEditingService");let g=class extends I{constructor(i,e,t,n){super();this.textModelResolverService=i;this.textFileService=e;this.fileService=t;this.userDataProfileService=n;this.queue=new E}_serviceBrand;queue;addKeybinding(i,e,t){return this.queue.queue(()=>this.doEditKeybinding(i,e,t,!0))}editKeybinding(i,e,t){return this.queue.queue(()=>this.doEditKeybinding(i,e,t,!1))}resetKeybinding(i){return this.queue.queue(()=>this.doResetKeybinding(i))}removeKeybinding(i){return this.queue.queue(()=>this.doRemoveKeybinding(i))}async doEditKeybinding(i,e,t,n){const r=await this.resolveAndValidate(),s=r.object.textEditorModel;if(n)this.updateKeybinding(i,e,t,s,-1);else{const o=c.parse(s.getValue()),d=this.findUserKeybindingEntryIndex(i,o);this.updateKeybinding(i,e,t,s,d),i.isDefault&&i.resolvedKeybinding&&this.removeDefaultKeybinding(i,s)}try{await this.save()}finally{r.dispose()}}async doRemoveKeybinding(i){const e=await this.resolveAndValidate(),t=e.object.textEditorModel;i.isDefault?this.removeDefaultKeybinding(i,t):this.removeUserKeybinding(i,t);try{return await this.save()}finally{e.dispose()}}async doResetKeybinding(i){const e=await this.resolveAndValidate(),t=e.object.textEditorModel;i.isDefault||(this.removeUserKeybinding(i,t),this.removeUnassignedDefaultKeybinding(i,t));try{return await this.save()}finally{e.dispose()}}save(){return this.textFileService.save(this.userDataProfileService.currentProfile.keybindingsResource)}updateKeybinding(i,e,t,n,r){const{tabSize:s,insertSpaces:o}=n.getOptions(),d=n.getEOL();if(r!==-1){this.applyEditsToBuffer(l(n.getValue(),[r,"key"],e,{tabSize:s,insertSpaces:o,eol:d})[0],n);const y=l(n.getValue(),[r,"when"],t,{tabSize:s,insertSpaces:o,eol:d});y.length>0&&this.applyEditsToBuffer(y[0],n)}else this.applyEditsToBuffer(l(n.getValue(),[-1],this.asObject(e,i.command,t,!1),{tabSize:s,insertSpaces:o,eol:d})[0],n)}removeUserKeybinding(i,e){const{tabSize:t,insertSpaces:n}=e.getOptions(),r=e.getEOL(),s=c.parse(e.getValue()),o=this.findUserKeybindingEntryIndex(i,s);o!==-1&&this.applyEditsToBuffer(l(e.getValue(),[o],void 0,{tabSize:t,insertSpaces:n,eol:r})[0],e)}removeDefaultKeybinding(i,e){const{tabSize:t,insertSpaces:n}=e.getOptions(),r=e.getEOL(),s=i.resolvedKeybinding?i.resolvedKeybinding.getUserSettingsLabel():null;if(s){const o=this.asObject(s,i.command,i.when?i.when.serialize():void 0,!0);c.parse(e.getValue()).every(y=>!this.areSame(y,o))&&this.applyEditsToBuffer(l(e.getValue(),[-1],o,{tabSize:t,insertSpaces:n,eol:r})[0],e)}}removeUnassignedDefaultKeybinding(i,e){const{tabSize:t,insertSpaces:n}=e.getOptions(),r=e.getEOL(),s=c.parse(e.getValue()),o=this.findUnassignedDefaultKeybindingEntryIndex(i,s).reverse();for(const d of o)this.applyEditsToBuffer(l(e.getValue(),[d],void 0,{tabSize:t,insertSpaces:n,eol:r})[0],e)}findUserKeybindingEntryIndex(i,e){for(let t=0;t<e.length;t++){const n=e[t];if(n.command===i.command){if(!n.when&&!i.when)return t;if(n.when&&i.when){const r=p.deserialize(n.when);if(r&&r.serialize()===i.when.serialize())return t}}}return-1}findUnassignedDefaultKeybindingEntryIndex(i,e){const t=[];for(let n=0;n<e.length;n++)e[n].command===`-${i.command}`&&t.push(n);return t}asObject(i,e,t,n){const r={key:i};return e&&(r.command=n?`-${e}`:e),t&&(r.when=t),r}areSame(i,e){if(i.command!==e.command||i.key!==e.key)return!1;const t=p.deserialize(i.when),n=p.deserialize(e.when);return!(t&&!n||!t&&n||t&&n&&!t.equals(n)||!x.equals(i.args,e.args))}applyEditsToBuffer(i,e){const t=e.getPositionAt(i.offset),n=e.getPositionAt(i.offset+i.length),r=new R(t.lineNumber,t.column,n.lineNumber,n.column),o=e.getValueInRange(r)?h.replace(r,i.content):h.insert(t,i.content);e.pushEditOperations([new w(t.lineNumber,t.column,t.lineNumber,t.column)],[o],()=>[])}async resolveModelReference(){return await this.fileService.exists(this.userDataProfileService.currentProfile.keybindingsResource)||await this.textFileService.write(this.userDataProfileService.currentProfile.keybindingsResource,this.getEmptyContent(),{encoding:"utf8"}),this.textModelResolverService.createModelReference(this.userDataProfileService.currentProfile.keybindingsResource)}async resolveAndValidate(){if(this.textFileService.isDirty(this.userDataProfileService.currentProfile.keybindingsResource))throw new Error(v("errorKeybindingsFileDirty","Unable to write because the keybindings configuration file has unsaved changes. Please save it first and then try again."));const i=await this.resolveModelReference(),e=i.object.textEditorModel,t=e.getEOL();if(e.getValue()){const n=this.parse(e);if(n.parseErrors.length)throw i.dispose(),new Error(v("parseErrors","Unable to write to the keybindings configuration file. Please open it to correct errors/warnings in the file and try again."));if(n.result){if(!Array.isArray(n.result))throw i.dispose(),new Error(v("errorInvalidConfiguration","Unable to write to the keybindings configuration file. It has an object which is not of type Array. Please open the file to clean up and try again."))}else{const r=t+"[]";this.applyEditsToBuffer({content:r,length:r.length,offset:e.getValue().length},e)}}else{const n=this.getEmptyContent();this.applyEditsToBuffer({content:n,length:n.length,offset:0},e)}return i}parse(i){const e=[];return{result:c.parse(i.getValue(),e,{allowTrailingComma:!0,allowEmptyContent:!0}),parseErrors:e}}getEmptyContent(){return"// "+v("emptyKeybindingsHeader","Place your key bindings in this file to override the defaults")+`
[
]`}};g=b([f(0,P),f(1,M),f(2,S),f(3,F)],g),U(V,g,T.Delayed);export{V as IKeybindingEditingService,g as KeybindingsEditingService};
