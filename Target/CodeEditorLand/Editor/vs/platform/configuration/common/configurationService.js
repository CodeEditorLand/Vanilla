import{equals as E,distinct as O}from"../../../base/common/arrays.js";import{Queue as S,RunOnceScheduler as w}from"../../../base/common/async.js";import{VSBuffer as D}from"../../../base/common/buffer.js";import{Emitter as P}from"../../../base/common/event.js";import{parse as U}from"../../../base/common/json.js";import{applyEdits as M,setProperty as T}from"../../../base/common/jsonEdit.js";import{Disposable as V}from"../../../base/common/lifecycle.js";import{ResourceMap as d}from"../../../base/common/map.js";import{equals as _}from"../../../base/common/objects.js";import{OS as p,OperatingSystem as h}from"../../../base/common/platform.js";import{extUriBiasedIgnorePathCase as F}from"../../../base/common/resources.js";import{FileOperationResult as R}from"../../files/common/files.js";import{NullPolicyService as b}from"../../policy/common/policy.js";import{ConfigurationTarget as u,isConfigurationOverrides as g,isConfigurationUpdateOverrides as q}from"./configuration.js";import{Configuration as C,ConfigurationChangeEvent as L,ConfigurationModel as s,UserSettings as N}from"./configurationModels.js";import{keyFromOverrideIdentifiers as j}from"./configurationRegistry.js";import{DefaultConfiguration as z,NullPolicyConfiguration as A,PolicyConfiguration as k}from"./configurations.js";class ai extends V{constructor(i,e,t,o){super();this.settingsResource=i;this.logService=o;this.defaultConfiguration=this._register(new z(o)),this.policyConfiguration=t instanceof b?new A:this._register(new k(this.defaultConfiguration,t,o)),this.userConfiguration=this._register(new N(this.settingsResource,{},F,e,o)),this.configuration=new C(this.defaultConfiguration.configurationModel,this.policyConfiguration.configurationModel,s.createEmptyModel(o),s.createEmptyModel(o),s.createEmptyModel(o),s.createEmptyModel(o),new d,s.createEmptyModel(o),new d,o),this.configurationEditing=new x(i,e,this),this.reloadConfigurationScheduler=this._register(new w(()=>this.reloadConfiguration(),50)),this._register(this.defaultConfiguration.onDidChangeConfiguration(({defaults:a,properties:n})=>this.onDidDefaultConfigurationChange(a,n))),this._register(this.policyConfiguration.onDidChangeConfiguration(a=>this.onDidPolicyConfigurationChange(a))),this._register(this.userConfiguration.onDidChange(()=>this.reloadConfigurationScheduler.schedule()))}configuration;defaultConfiguration;policyConfiguration;userConfiguration;reloadConfigurationScheduler;_onDidChangeConfiguration=this._register(new P);onDidChangeConfiguration=this._onDidChangeConfiguration.event;configurationEditing;async initialize(){const[i,e,t]=await Promise.all([this.defaultConfiguration.initialize(),this.policyConfiguration.initialize(),this.userConfiguration.loadConfiguration()]);this.configuration=new C(i,e,s.createEmptyModel(this.logService),t,s.createEmptyModel(this.logService),s.createEmptyModel(this.logService),new d,s.createEmptyModel(this.logService),new d,this.logService)}getConfigurationData(){return this.configuration.toData()}getValue(i,e){const t=typeof i=="string"?i:void 0,o=g(i)?i:g(e)?e:{};return this.configuration.getValue(t,o,void 0)}async updateValue(i,e,t,o,a){const n=q(t)?t:g(t)?{resource:t.resource,overrideIdentifiers:t.overrideIdentifier?[t.overrideIdentifier]:void 0}:void 0,f=n?o:t;if(f!==void 0&&f!==u.USER_LOCAL&&f!==u.USER)throw new Error(`Unable to write ${i} to target ${f}.`);n?.overrideIdentifiers&&(n.overrideIdentifiers=O(n.overrideIdentifiers),n.overrideIdentifiers=n.overrideIdentifiers.length?n.overrideIdentifiers:void 0);const l=this.inspect(i,{resource:n?.resource,overrideIdentifier:n?.overrideIdentifiers?n.overrideIdentifiers[0]:void 0});if(l.policyValue!==void 0)throw new Error(`Unable to write ${i} because it is configured in system policy.`);if(_(e,l.defaultValue)&&(e=void 0),n?.overrideIdentifiers?.length&&n.overrideIdentifiers.length>1){const m=n.overrideIdentifiers.sort(),c=this.configuration.localUserConfiguration.overrides.find(I=>E([...I.identifiers].sort(),m));c&&(n.overrideIdentifiers=c.identifiers)}const y=n?.overrideIdentifiers?.length?[j(n.overrideIdentifiers),i]:[i];await this.configurationEditing.write(y,e),await this.reloadConfiguration()}inspect(i,e={}){return this.configuration.inspect(i,e,void 0)}keys(){return this.configuration.keys(void 0)}async reloadConfiguration(){const i=await this.userConfiguration.loadConfiguration();this.onDidChangeUserConfiguration(i)}onDidChangeUserConfiguration(i){const e=this.configuration.toData(),t=this.configuration.compareAndUpdateLocalUserConfiguration(i);this.trigger(t,e,u.USER)}onDidDefaultConfigurationChange(i,e){const t=this.configuration.toData(),o=this.configuration.compareAndUpdateDefaultConfiguration(i,e);this.trigger(o,t,u.DEFAULT)}onDidPolicyConfigurationChange(i){const e=this.configuration.toData(),t=this.configuration.compareAndUpdatePolicyConfiguration(i);this.trigger(t,e,u.DEFAULT)}trigger(i,e,t){const o=new L(i,{data:e},this.configuration,void 0,this.logService);o.source=t,this._onDidChangeConfiguration.fire(o)}}class x{constructor(r,i,e){this.settingsResource=r;this.fileService=i;this.configurationService=e;this.queue=new S}queue;write(r,i){return this.queue.queue(()=>this.doWriteConfiguration(r,i))}async doWriteConfiguration(r,i){let e;try{e=(await this.fileService.readFile(this.settingsResource)).value.toString()}catch(a){if(a.fileOperationResult===R.FILE_NOT_FOUND)e="{}";else throw a}const t=[];if(U(e,t,{allowTrailingComma:!0,allowEmptyContent:!0}),t.length>0)throw new Error("Unable to write into the settings file. Please open the file to correct errors/warnings in the file and try again.");const o=this.getEdits(e,r,i);e=M(e,o),await this.fileService.writeFile(this.settingsResource,D.fromString(e))}getEdits(r,i,e){const{tabSize:t,insertSpaces:o,eol:a}=this.formattingOptions;if(!i.length){const n=JSON.stringify(e,null,o?" ".repeat(t):"	");return[{content:n,length:n.length,offset:0}]}return T(r,i,e,{tabSize:t,insertSpaces:o,eol:a})}_formattingOptions;get formattingOptions(){if(!this._formattingOptions){let r=p===h.Linux||p===h.Macintosh?`
`:`\r
`;const i=this.configurationService.getValue("files.eol",{overrideIdentifier:"jsonc"});i&&typeof i=="string"&&i!=="auto"&&(r=i),this._formattingOptions={eol:r,insertSpaces:!!this.configurationService.getValue("editor.insertSpaces",{overrideIdentifier:"jsonc"}),tabSize:this.configurationService.getValue("editor.tabSize",{overrideIdentifier:"jsonc"})}}return this._formattingOptions}}export{ai as ConfigurationService};
