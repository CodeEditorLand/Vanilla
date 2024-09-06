import*as p from"../../../../vs/base/common/arrays.js";import"../../../../vs/base/common/collections.js";import{Emitter as R,Event as V}from"../../../../vs/base/common/event.js";import*as S from"../../../../vs/base/common/json.js";import{Disposable as F}from"../../../../vs/base/common/lifecycle.js";import{getOrSet as U,ResourceMap as m}from"../../../../vs/base/common/map.js";import*as l from"../../../../vs/base/common/objects.js";import"../../../../vs/base/common/resources.js";import*as _ from"../../../../vs/base/common/types.js";import{URI as P}from"../../../../vs/base/common/uri.js";import{addToValueTree as b,getConfigurationValue as h,removeFromValueTree as x,toValuesTree as k}from"../../../../vs/platform/configuration/common/configuration.js";import{ConfigurationScope as A,Extensions as j,OVERRIDE_PROPERTY_REGEX as v,overrideIdentifiersFromKey as y}from"../../../../vs/platform/configuration/common/configurationRegistry.js";import{FileOperation as I}from"../../../../vs/platform/files/common/files.js";import"../../../../vs/platform/log/common/log.js";import{Registry as D}from"../../../../vs/platform/registry/common/platform.js";import"../../../../vs/platform/workspace/common/workspace.js";function C(d){return Object.isFrozen(d)?d:l.deepFreeze(d)}class f{constructor(e,i,t,n,r){this._contents=e;this._keys=i;this._overrides=t;this.raw=n;this.logService=r}static createEmptyModel(e){return new f({},[],[],void 0,e)}overrideConfigurations=new Map;_rawConfiguration;get rawConfiguration(){if(!this._rawConfiguration)if(this.raw?.length){const e=this.raw.map(i=>{if(i instanceof f)return i;const t=new O("",this.logService);return t.parseRaw(i),t.configurationModel});this._rawConfiguration=e.reduce((i,t)=>t===i?t:i.merge(t),e[0])}else this._rawConfiguration=this;return this._rawConfiguration}get contents(){return this._contents}get overrides(){return this._overrides}get keys(){return this._keys}isEmpty(){return this._keys.length===0&&Object.keys(this._contents).length===0&&this._overrides.length===0}getValue(e){return e?h(this.contents,e):this.contents}inspect(e,i){const t=this;return{get value(){return C(t.rawConfiguration.getValue(e))},get override(){return i?C(t.rawConfiguration.getOverrideValue(e,i)):void 0},get merged(){return C(i?t.rawConfiguration.override(i).getValue(e):t.rawConfiguration.getValue(e))},get overrides(){const n=[];for(const{contents:r,identifiers:o,keys:s}of t.rawConfiguration.overrides){const u=new f(r,s,[],void 0,t.logService).getValue(e);u!==void 0&&n.push({identifiers:o,value:u})}return n.length?C(n):void 0}}}getOverrideValue(e,i){const t=this.getContentsForOverrideIdentifer(i);return t?e?h(t,e):t:void 0}getKeysForOverrideIdentifier(e){const i=[];for(const t of this.overrides)t.identifiers.includes(e)&&i.push(...t.keys);return p.distinct(i)}getAllOverrideIdentifiers(){const e=[];for(const i of this.overrides)e.push(...i.identifiers);return p.distinct(e)}override(e){let i=this.overrideConfigurations.get(e);return i||(i=this.createOverrideConfigurationModel(e),this.overrideConfigurations.set(e,i)),i}merge(...e){const i=l.deepClone(this.contents),t=l.deepClone(this.overrides),n=[...this.keys],r=this.raw?.length?[...this.raw]:[this];for(const o of e)if(r.push(...o.raw?.length?o.raw:[o]),!o.isEmpty()){this.mergeContents(i,o.contents);for(const s of o.overrides){const[u]=t.filter(a=>p.equals(a.identifiers,s.identifiers));u?(this.mergeContents(u.contents,s.contents),u.keys.push(...s.keys),u.keys=p.distinct(u.keys)):t.push(l.deepClone(s))}for(const s of o.keys)n.indexOf(s)===-1&&n.push(s)}return new f(i,n,t,r.every(o=>o instanceof f)?void 0:r,this.logService)}createOverrideConfigurationModel(e){const i=this.getContentsForOverrideIdentifer(e);if(!i||typeof i!="object"||!Object.keys(i).length)return this;const t={};for(const n of p.distinct([...Object.keys(this.contents),...Object.keys(i)])){let r=this.contents[n];const o=i[n];o&&(typeof r=="object"&&typeof o=="object"?(r=l.deepClone(r),this.mergeContents(r,o)):r=o),t[n]=r}return new f(t,this.keys,this.overrides,void 0,this.logService)}mergeContents(e,i){for(const t of Object.keys(i)){if(t in e&&_.isObject(e[t])&&_.isObject(i[t])){this.mergeContents(e[t],i[t]);continue}e[t]=l.deepClone(i[t])}}getContentsForOverrideIdentifer(e){let i=null,t=null;const n=r=>{r&&(t?this.mergeContents(t,r):t=l.deepClone(r))};for(const r of this.overrides)r.identifiers.length===1&&r.identifiers[0]===e?i=r.contents:r.identifiers.includes(e)&&n(r.contents);return n(i),t}toJSON(){return{contents:this.contents,overrides:this.overrides,keys:this.keys}}addValue(e,i){this.updateValue(e,i,!0)}setValue(e,i){this.updateValue(e,i,!1)}removeValue(e){const i=this.keys.indexOf(e);i!==-1&&(this.keys.splice(i,1),x(this.contents,e),v.test(e)&&this.overrides.splice(this.overrides.findIndex(t=>p.equals(t.identifiers,y(e))),1))}updateValue(e,i,t){if(b(this.contents,e,i,n=>this.logService.error(n)),t=t||this.keys.indexOf(e)===-1,t&&this.keys.push(e),v.test(e)){const n=y(e),r={identifiers:n,keys:Object.keys(this.contents[e]),contents:k(this.contents[e],s=>this.logService.error(s))},o=this.overrides.findIndex(s=>p.equals(s.identifiers,n));o!==-1?this.overrides[o]=r:this.overrides.push(r)}}}class O{constructor(e,i){this._name=e;this.logService=i}_raw=null;_configurationModel=null;_restrictedConfigurations=[];_parseErrors=[];get configurationModel(){return this._configurationModel||f.createEmptyModel(this.logService)}get restrictedConfigurations(){return this._restrictedConfigurations}get errors(){return this._parseErrors}parse(e,i){if(!_.isUndefinedOrNull(e)){const t=this.doParseContent(e);this.parseRaw(t,i)}}reparse(e){this._raw&&this.parseRaw(this._raw,e)}parseRaw(e,i){this._raw=e;const{contents:t,keys:n,overrides:r,restricted:o,hasExcludedProperties:s}=this.doParseRaw(e,i);this._configurationModel=new f(t,n,r,s?[e]:void 0,this.logService),this._restrictedConfigurations=o||[]}doParseContent(e){let i={},t=null,n=[];const r=[],o=[];function s(a){Array.isArray(n)?n.push(a):t!==null&&(n[t]=a)}const u={onObjectBegin:()=>{const a={};s(a),r.push(n),n=a,t=null},onObjectProperty:a=>{t=a},onObjectEnd:()=>{n=r.pop()},onArrayBegin:()=>{const a=[];s(a),r.push(n),n=a,t=null},onArrayEnd:()=>{n=r.pop()},onLiteralValue:s,onError:(a,c,w)=>{o.push({error:a,offset:c,length:w})}};if(e)try{S.visit(e,u),i=n[0]||{}}catch(a){this.logService.error(`Error while parsing settings file ${this._name}: ${a}`),this._parseErrors=[a]}return i}doParseRaw(e,i){const t=D.as(j.Configuration).getConfigurationProperties(),n=this.filter(e,t,!0,i);e=n.raw;const r=k(e,u=>this.logService.error(`Conflict in settings file ${this._name}: ${u}`)),o=Object.keys(e),s=this.toOverrides(e,u=>this.logService.error(`Conflict in settings file ${this._name}: ${u}`));return{contents:r,keys:o,overrides:s,restricted:n.restricted,hasExcludedProperties:n.hasExcludedProperties}}filter(e,i,t,n){let r=!1;if(!n?.scopes&&!n?.skipRestricted&&!n?.exclude?.length)return{raw:e,restricted:[],hasExcludedProperties:r};const o={},s=[];for(const u in e)if(v.test(u)&&t){const a=this.filter(e[u],i,!1,n);o[u]=a.raw,r=r||a.hasExcludedProperties,s.push(...a.restricted)}else{const a=i[u],c=a?typeof a.scope<"u"?a.scope:A.WINDOW:void 0;a?.restricted&&s.push(u),!n.exclude?.includes(u)&&(n.include?.includes(u)||(c===void 0||n.scopes===void 0||n.scopes.includes(c))&&!(n.skipRestricted&&a?.restricted))?o[u]=e[u]:r=!0}return{raw:o,restricted:s,hasExcludedProperties:r}}toOverrides(e,i){const t=[];for(const n of Object.keys(e))if(v.test(n)){const r={};for(const o in e[n])r[o]=e[n][o];t.push({identifiers:y(n),keys:Object.keys(r),contents:k(r,i)})}return t}}class ye extends F{constructor(i,t,n,r,o){super();this.userSettingsResource=i;this.parseOptions=t;this.fileService=r;this.logService=o;this.parser=new O(this.userSettingsResource.toString(),o),this._register(this.fileService.watch(n.dirname(this.userSettingsResource))),this._register(this.fileService.watch(this.userSettingsResource)),this._register(V.any(V.filter(this.fileService.onDidFilesChange,s=>s.contains(this.userSettingsResource)),V.filter(this.fileService.onDidRunOperation,s=>(s.isOperation(I.CREATE)||s.isOperation(I.COPY)||s.isOperation(I.DELETE)||s.isOperation(I.WRITE))&&n.isEqual(s.resource,i)))(()=>this._onDidChange.fire()))}parser;_onDidChange=this._register(new R);onDidChange=this._onDidChange.event;async loadConfiguration(){try{const i=await this.fileService.readFile(this.userSettingsResource);return this.parser.parse(i.value.toString()||"{}",this.parseOptions),this.parser.configurationModel}catch{return f.createEmptyModel(this.logService)}}reparse(i){return i&&(this.parseOptions=i),this.parser.reparse(this.parseOptions),this.parser.configurationModel}getRestrictedSettings(){return this.parser.restrictedConfigurations}}class K{constructor(e,i,t,n,r,o,s,u,a,c,w,L,W){this.key=e;this.overrides=i;this._value=t;this.overrideIdentifiers=n;this.defaultConfiguration=r;this.policyConfiguration=o;this.applicationConfiguration=s;this.userConfiguration=u;this.localUserConfiguration=a;this.remoteUserConfiguration=c;this.workspaceConfiguration=w;this.folderConfigurationModel=L;this.memoryConfigurationModel=W}get value(){return C(this._value)}toInspectValue(e){return e?.value!==void 0||e?.override!==void 0||e?.overrides!==void 0?e:void 0}_defaultInspectValue;get defaultInspectValue(){return this._defaultInspectValue||(this._defaultInspectValue=this.defaultConfiguration.inspect(this.key,this.overrides.overrideIdentifier)),this._defaultInspectValue}get defaultValue(){return this.defaultInspectValue.merged}get default(){return this.toInspectValue(this.defaultInspectValue)}_policyInspectValue;get policyInspectValue(){return this._policyInspectValue===void 0&&(this._policyInspectValue=this.policyConfiguration?this.policyConfiguration.inspect(this.key):null),this._policyInspectValue}get policyValue(){return this.policyInspectValue?.merged}get policy(){return this.policyInspectValue?.value!==void 0?{value:this.policyInspectValue.value}:void 0}_applicationInspectValue;get applicationInspectValue(){return this._applicationInspectValue===void 0&&(this._applicationInspectValue=this.applicationConfiguration?this.applicationConfiguration.inspect(this.key):null),this._applicationInspectValue}get applicationValue(){return this.applicationInspectValue?.merged}get application(){return this.toInspectValue(this.applicationInspectValue)}_userInspectValue;get userInspectValue(){return this._userInspectValue||(this._userInspectValue=this.userConfiguration.inspect(this.key,this.overrides.overrideIdentifier)),this._userInspectValue}get userValue(){return this.userInspectValue.merged}get user(){return this.toInspectValue(this.userInspectValue)}_userLocalInspectValue;get userLocalInspectValue(){return this._userLocalInspectValue||(this._userLocalInspectValue=this.localUserConfiguration.inspect(this.key,this.overrides.overrideIdentifier)),this._userLocalInspectValue}get userLocalValue(){return this.userLocalInspectValue.merged}get userLocal(){return this.toInspectValue(this.userLocalInspectValue)}_userRemoteInspectValue;get userRemoteInspectValue(){return this._userRemoteInspectValue||(this._userRemoteInspectValue=this.remoteUserConfiguration.inspect(this.key,this.overrides.overrideIdentifier)),this._userRemoteInspectValue}get userRemoteValue(){return this.userRemoteInspectValue.merged}get userRemote(){return this.toInspectValue(this.userRemoteInspectValue)}_workspaceInspectValue;get workspaceInspectValue(){return this._workspaceInspectValue===void 0&&(this._workspaceInspectValue=this.workspaceConfiguration?this.workspaceConfiguration.inspect(this.key,this.overrides.overrideIdentifier):null),this._workspaceInspectValue}get workspaceValue(){return this.workspaceInspectValue?.merged}get workspace(){return this.toInspectValue(this.workspaceInspectValue)}_workspaceFolderInspectValue;get workspaceFolderInspectValue(){return this._workspaceFolderInspectValue===void 0&&(this._workspaceFolderInspectValue=this.folderConfigurationModel?this.folderConfigurationModel.inspect(this.key,this.overrides.overrideIdentifier):null),this._workspaceFolderInspectValue}get workspaceFolderValue(){return this.workspaceFolderInspectValue?.merged}get workspaceFolder(){return this.toInspectValue(this.workspaceFolderInspectValue)}_memoryInspectValue;get memoryInspectValue(){return this._memoryInspectValue===void 0&&(this._memoryInspectValue=this.memoryConfigurationModel.inspect(this.key,this.overrides.overrideIdentifier)),this._memoryInspectValue}get memoryValue(){return this.memoryInspectValue.merged}get memory(){return this.toInspectValue(this.memoryInspectValue)}}class M{constructor(e,i,t,n,r,o,s,u,a,c){this._defaultConfiguration=e;this._policyConfiguration=i;this._applicationConfiguration=t;this._localUserConfiguration=n;this._remoteUserConfiguration=r;this._workspaceConfiguration=o;this._folderConfigurations=s;this._memoryConfiguration=u;this._memoryConfigurationByResource=a;this.logService=c}_workspaceConsolidatedConfiguration=null;_foldersConsolidatedConfigurations=new m;getValue(e,i,t){return this.getConsolidatedConfigurationModel(e,i,t).getValue(e)}updateValue(e,i,t={}){let n;t.resource?(n=this._memoryConfigurationByResource.get(t.resource),n||(n=f.createEmptyModel(this.logService),this._memoryConfigurationByResource.set(t.resource,n))):n=this._memoryConfiguration,i===void 0?n.removeValue(e):n.setValue(e,i),t.resource||(this._workspaceConsolidatedConfiguration=null)}inspect(e,i,t){const n=this.getConsolidatedConfigurationModel(e,i,t),r=this.getFolderConfigurationModelForResource(i.resource,t),o=i.resource?this._memoryConfigurationByResource.get(i.resource)||this._memoryConfiguration:this._memoryConfiguration,s=new Set;for(const u of n.overrides)for(const a of u.identifiers)n.getOverrideValue(e,a)!==void 0&&s.add(a);return new K(e,i,n.getValue(e),s.size?[...s]:void 0,this._defaultConfiguration,this._policyConfiguration.isEmpty()?void 0:this._policyConfiguration,this.applicationConfiguration.isEmpty()?void 0:this.applicationConfiguration,this.userConfiguration,this.localUserConfiguration,this.remoteUserConfiguration,t?this._workspaceConfiguration:void 0,r||void 0,o)}keys(e){const i=this.getFolderConfigurationModelForResource(void 0,e);return{default:this._defaultConfiguration.keys.slice(0),user:this.userConfiguration.keys.slice(0),workspace:this._workspaceConfiguration.keys.slice(0),workspaceFolder:i?i.keys.slice(0):[]}}updateDefaultConfiguration(e){this._defaultConfiguration=e,this._workspaceConsolidatedConfiguration=null,this._foldersConsolidatedConfigurations.clear()}updatePolicyConfiguration(e){this._policyConfiguration=e}updateApplicationConfiguration(e){this._applicationConfiguration=e,this._workspaceConsolidatedConfiguration=null,this._foldersConsolidatedConfigurations.clear()}updateLocalUserConfiguration(e){this._localUserConfiguration=e,this._userConfiguration=null,this._workspaceConsolidatedConfiguration=null,this._foldersConsolidatedConfigurations.clear()}updateRemoteUserConfiguration(e){this._remoteUserConfiguration=e,this._userConfiguration=null,this._workspaceConsolidatedConfiguration=null,this._foldersConsolidatedConfigurations.clear()}updateWorkspaceConfiguration(e){this._workspaceConfiguration=e,this._workspaceConsolidatedConfiguration=null,this._foldersConsolidatedConfigurations.clear()}updateFolderConfiguration(e,i){this._folderConfigurations.set(e,i),this._foldersConsolidatedConfigurations.delete(e)}deleteFolderConfiguration(e){this.folderConfigurations.delete(e),this._foldersConsolidatedConfigurations.delete(e)}compareAndUpdateDefaultConfiguration(e,i){const t=[];if(!i){const{added:n,updated:r,removed:o}=g(this._defaultConfiguration,e);i=[...n,...r,...o]}for(const n of i)for(const r of y(n)){const o=this._defaultConfiguration.getKeysForOverrideIdentifier(r),s=e.getKeysForOverrideIdentifier(r),u=[...s.filter(a=>o.indexOf(a)===-1),...o.filter(a=>s.indexOf(a)===-1),...o.filter(a=>!l.equals(this._defaultConfiguration.override(r).getValue(a),e.override(r).getValue(a)))];t.push([r,u])}return this.updateDefaultConfiguration(e),{keys:i,overrides:t}}compareAndUpdatePolicyConfiguration(e){const{added:i,updated:t,removed:n}=g(this._policyConfiguration,e),r=[...i,...t,...n];return r.length&&this.updatePolicyConfiguration(e),{keys:r,overrides:[]}}compareAndUpdateApplicationConfiguration(e){const{added:i,updated:t,removed:n,overrides:r}=g(this.applicationConfiguration,e),o=[...i,...t,...n];return o.length&&this.updateApplicationConfiguration(e),{keys:o,overrides:r}}compareAndUpdateLocalUserConfiguration(e){const{added:i,updated:t,removed:n,overrides:r}=g(this.localUserConfiguration,e),o=[...i,...t,...n];return o.length&&this.updateLocalUserConfiguration(e),{keys:o,overrides:r}}compareAndUpdateRemoteUserConfiguration(e){const{added:i,updated:t,removed:n,overrides:r}=g(this.remoteUserConfiguration,e),o=[...i,...t,...n];return o.length&&this.updateRemoteUserConfiguration(e),{keys:o,overrides:r}}compareAndUpdateWorkspaceConfiguration(e){const{added:i,updated:t,removed:n,overrides:r}=g(this.workspaceConfiguration,e),o=[...i,...t,...n];return o.length&&this.updateWorkspaceConfiguration(e),{keys:o,overrides:r}}compareAndUpdateFolderConfiguration(e,i){const t=this.folderConfigurations.get(e),{added:n,updated:r,removed:o,overrides:s}=g(t,i),u=[...n,...r,...o];return(u.length||!t)&&this.updateFolderConfiguration(e,i),{keys:u,overrides:s}}compareAndDeleteFolderConfiguration(e){const i=this.folderConfigurations.get(e);if(!i)throw new Error("Unknown folder");this.deleteFolderConfiguration(e);const{added:t,updated:n,removed:r,overrides:o}=g(i,void 0);return{keys:[...t,...n,...r],overrides:o}}get defaults(){return this._defaultConfiguration}get applicationConfiguration(){return this._applicationConfiguration}_userConfiguration=null;get userConfiguration(){return this._userConfiguration||(this._userConfiguration=this._remoteUserConfiguration.isEmpty()?this._localUserConfiguration:this._localUserConfiguration.merge(this._remoteUserConfiguration)),this._userConfiguration}get localUserConfiguration(){return this._localUserConfiguration}get remoteUserConfiguration(){return this._remoteUserConfiguration}get workspaceConfiguration(){return this._workspaceConfiguration}get folderConfigurations(){return this._folderConfigurations}getConsolidatedConfigurationModel(e,i,t){let n=this.getConsolidatedConfigurationModelForResource(i,t);return i.overrideIdentifier&&(n=n.override(i.overrideIdentifier)),!this._policyConfiguration.isEmpty()&&this._policyConfiguration.getValue(e)!==void 0&&(n=n.merge(this._policyConfiguration)),n}getConsolidatedConfigurationModelForResource({resource:e},i){let t=this.getWorkspaceConsolidatedConfiguration();if(i&&e){const n=i.getFolder(e);n&&(t=this.getFolderConsolidatedConfiguration(n.uri)||t);const r=this._memoryConfigurationByResource.get(e);r&&(t=t.merge(r))}return t}getWorkspaceConsolidatedConfiguration(){return this._workspaceConsolidatedConfiguration||(this._workspaceConsolidatedConfiguration=this._defaultConfiguration.merge(this.applicationConfiguration,this.userConfiguration,this._workspaceConfiguration,this._memoryConfiguration)),this._workspaceConsolidatedConfiguration}getFolderConsolidatedConfiguration(e){let i=this._foldersConsolidatedConfigurations.get(e);if(!i){const t=this.getWorkspaceConsolidatedConfiguration(),n=this._folderConfigurations.get(e);n?(i=t.merge(n),this._foldersConsolidatedConfigurations.set(e,i)):i=t}return i}getFolderConfigurationModelForResource(e,i){if(i&&e){const t=i.getFolder(e);if(t)return this._folderConfigurations.get(t.uri)}}toData(){return{defaults:{contents:this._defaultConfiguration.contents,overrides:this._defaultConfiguration.overrides,keys:this._defaultConfiguration.keys},policy:{contents:this._policyConfiguration.contents,overrides:this._policyConfiguration.overrides,keys:this._policyConfiguration.keys},application:{contents:this.applicationConfiguration.contents,overrides:this.applicationConfiguration.overrides,keys:this.applicationConfiguration.keys},user:{contents:this.userConfiguration.contents,overrides:this.userConfiguration.overrides,keys:this.userConfiguration.keys},workspace:{contents:this._workspaceConfiguration.contents,overrides:this._workspaceConfiguration.overrides,keys:this._workspaceConfiguration.keys},folders:[...this._folderConfigurations.keys()].reduce((e,i)=>{const{contents:t,overrides:n,keys:r}=this._folderConfigurations.get(i);return e.push([i,{contents:t,overrides:n,keys:r}]),e},[])}}allKeys(){const e=new Set;return this._defaultConfiguration.keys.forEach(i=>e.add(i)),this.userConfiguration.keys.forEach(i=>e.add(i)),this._workspaceConfiguration.keys.forEach(i=>e.add(i)),this._folderConfigurations.forEach(i=>i.keys.forEach(t=>e.add(t))),[...e.values()]}allOverrideIdentifiers(){const e=new Set;return this._defaultConfiguration.getAllOverrideIdentifiers().forEach(i=>e.add(i)),this.userConfiguration.getAllOverrideIdentifiers().forEach(i=>e.add(i)),this._workspaceConfiguration.getAllOverrideIdentifiers().forEach(i=>e.add(i)),this._folderConfigurations.forEach(i=>i.getAllOverrideIdentifiers().forEach(t=>e.add(t))),[...e.values()]}getAllKeysForOverrideIdentifier(e){const i=new Set;return this._defaultConfiguration.getKeysForOverrideIdentifier(e).forEach(t=>i.add(t)),this.userConfiguration.getKeysForOverrideIdentifier(e).forEach(t=>i.add(t)),this._workspaceConfiguration.getKeysForOverrideIdentifier(e).forEach(t=>i.add(t)),this._folderConfigurations.forEach(t=>t.getKeysForOverrideIdentifier(e).forEach(n=>i.add(n))),[...i.values()]}static parse(e,i){const t=this.parseConfigurationModel(e.defaults,i),n=this.parseConfigurationModel(e.policy,i),r=this.parseConfigurationModel(e.application,i),o=this.parseConfigurationModel(e.user,i),s=this.parseConfigurationModel(e.workspace,i),u=e.folders.reduce((a,c)=>(a.set(P.revive(c[0]),this.parseConfigurationModel(c[1],i)),a),new m);return new M(t,n,r,o,f.createEmptyModel(i),s,u,f.createEmptyModel(i),new m,i)}static parseConfigurationModel(e,i){return new f(e.contents,e.keys,e.overrides,void 0,i)}}function Ie(...d){if(d.length===0)return{keys:[],overrides:[]};if(d.length===1)return d[0];const e=new Set,i=new Map;for(const n of d)n.keys.forEach(r=>e.add(r)),n.overrides.forEach(([r,o])=>{const s=U(i,r,new Set);o.forEach(u=>s.add(u))});const t=[];return i.forEach((n,r)=>t.push([r,[...n.values()]])),{keys:[...e.values()],overrides:t}}class Ve{constructor(e,i,t,n,r){this.change=e;this.previous=i;this.currentConfiguraiton=t;this.currentWorkspace=n;this.logService=r;for(const o of e.keys)this.affectedKeys.add(o);for(const[,o]of e.overrides)for(const s of o)this.affectedKeys.add(s);this._affectsConfigStr=this._marker;for(const o of this.affectedKeys)this._affectsConfigStr+=o+this._marker}_marker=`
`;_markerCode1=this._marker.charCodeAt(0);_markerCode2=46;_affectsConfigStr;affectedKeys=new Set;source;_previousConfiguration=void 0;get previousConfiguration(){return!this._previousConfiguration&&this.previous&&(this._previousConfiguration=M.parse(this.previous.data,this.logService)),this._previousConfiguration}affectsConfiguration(e,i){const t=this._marker+e,n=this._affectsConfigStr.indexOf(t);if(n<0)return!1;const r=n+t.length;if(r>=this._affectsConfigStr.length)return!1;const o=this._affectsConfigStr.charCodeAt(r);if(o!==this._markerCode1&&o!==this._markerCode2)return!1;if(i){const s=this.previousConfiguration?this.previousConfiguration.getValue(e,i,this.previous?.workspace):void 0,u=this.currentConfiguraiton.getValue(e,i,this.currentWorkspace);return!l.equals(s,u)}return!0}}function g(d,e){const{added:i,removed:t,updated:n}=E(e?.rawConfiguration,d?.rawConfiguration),r=[],o=d?.getAllOverrideIdentifiers()||[],s=e?.getAllOverrideIdentifiers()||[];if(e){const u=s.filter(a=>!o.includes(a));for(const a of u)r.push([a,e.getKeysForOverrideIdentifier(a)])}if(d){const u=o.filter(a=>!s.includes(a));for(const a of u)r.push([a,d.getKeysForOverrideIdentifier(a)])}if(e&&d){for(const u of o)if(s.includes(u)){const a=E({contents:d.getOverrideValue(void 0,u)||{},keys:d.getKeysForOverrideIdentifier(u)},{contents:e.getOverrideValue(void 0,u)||{},keys:e.getKeysForOverrideIdentifier(u)});r.push([u,[...a.added,...a.removed,...a.updated]])}}return{added:i,removed:t,updated:n,overrides:r}}function E(d,e){const i=d?e?d.keys.filter(r=>e.keys.indexOf(r)===-1):[...d.keys]:[],t=e?d?e.keys.filter(r=>d.keys.indexOf(r)===-1):[...e.keys]:[],n=[];if(d&&e){for(const r of e.keys)if(d.keys.indexOf(r)!==-1){const o=h(e.contents,r),s=h(d.contents,r);l.equals(o,s)||n.push(r)}}return{added:i,removed:t,updated:n}}export{M as Configuration,Ve as ConfigurationChangeEvent,f as ConfigurationModel,O as ConfigurationModelParser,ye as UserSettings,Ie as mergeChanges};
