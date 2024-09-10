import{Event as l}from"../../../../base/common/event.js";import"../../../../base/common/severity.js";import{URI as P}from"../../../../base/common/uri.js";import"../../../../base/parts/ipc/common/ipc.js";import{getExtensionId as D,getGalleryExtensionId as _}from"../../../../platform/extensionManagement/common/extensionManagementUtil.js";import{ImplicitActivationEvents as p}from"../../../../platform/extensionManagement/common/implicitActivationEvents.js";import{ExtensionIdentifier as u,ExtensionIdentifierMap as A,ExtensionIdentifierSet as x,ExtensionType as v,TargetPlatform as S}from"../../../../platform/extensions/common/extensions.js";import"../../../../platform/extensions/common/extensionsApiProposals.js";import{createDecorator as R}from"../../../../platform/instantiation/common/instantiation.js";import"../../../../platform/profiling/common/profiling.js";import"./extensionHostKind.js";import"./extensionHostProtocol.js";import"./extensionRunningLocation.js";import"./extensionsRegistry.js";const oe=Object.freeze({identifier:new u("nullExtensionDescription"),name:"Null Extension Description",version:"0.0.0",publisher:"vscode",engines:{vscode:""},extensionLocation:P.parse("void:location"),isBuiltin:!1,targetPlatform:S.UNDEFINED,isUserBuiltin:!1,isUnderDevelopment:!1}),se="extensions.webWorker",re=R("extensionService");class ae{constructor(e){this.dependency=e}}var T=(s=>(s[s.EagerAutoStart=1]="EagerAutoStart",s[s.EagerManualStart=2]="EagerManualStart",s[s.Lazy=3]="Lazy",s))(T||{});class le{_versionId;_allExtensions;_myExtensions;_myActivationEvents;get versionId(){return this._versionId}get allExtensions(){return this._allExtensions}get myExtensions(){return this._myExtensions}constructor(e,t,s){this._versionId=e,this._allExtensions=t.slice(0),this._myExtensions=s.slice(0),this._myActivationEvents=null}toSnapshot(){return{versionId:this._versionId,allExtensions:this._allExtensions,myExtensions:this._myExtensions,activationEvents:p.createActivationEventsMap(this._allExtensions)}}set(e,t,s){if(this._versionId>e)throw new Error(`ExtensionHostExtensions: invalid versionId ${e} (current: ${this._versionId})`);const a=[],d=[],E=[],c=[],o=I(this._allExtensions),g=I(t),m=(i,r)=>i.extensionLocation.toString()===r.extensionLocation.toString()||i.isBuiltin===r.isBuiltin||i.isUserBuiltin===r.isUserBuiltin||i.isUnderDevelopment===r.isUnderDevelopment;for(const i of this._allExtensions){const r=g.get(i.identifier);if(!r){a.push(i.identifier),o.delete(i.identifier);continue}if(!m(i,r)){a.push(i.identifier),o.delete(i.identifier);continue}}for(const i of t){const r=o.get(i.identifier);if(!r){d.push(i);continue}if(!m(r,i)){a.push(r.identifier),o.delete(r.identifier);continue}}const y=new x(this._myExtensions),b=new x(s);for(const i of this._myExtensions)b.has(i)||E.push(i);for(const i of s)y.has(i)||c.push(i);const h=p.createActivationEventsMap(d),f={versionId:e,toRemove:a,toAdd:d,addActivationEvents:h,myToRemove:E,myToAdd:c};return this.delta(f),f}delta(e){if(this._versionId>=e.versionId)return null;const{toRemove:t,toAdd:s,myToRemove:a,myToAdd:d}=e,E=new x(t),c=new x(a);for(let o=0;o<this._allExtensions.length;o++)E.has(this._allExtensions[o].identifier)&&(this._allExtensions.splice(o,1),o--);for(let o=0;o<this._myExtensions.length;o++)c.has(this._myExtensions[o])&&(this._myExtensions.splice(o,1),o--);for(const o of s)this._allExtensions.push(o);for(const o of d)this._myExtensions.push(o);return this._myActivationEvents=null,e}containsExtension(e){for(const t of this._myExtensions)if(u.equals(t,e))return!0;return!1}containsActivationEvent(e){return this._myActivationEvents||(this._myActivationEvents=this._readMyActivationEvents()),this._myActivationEvents.has(e)}_readMyActivationEvents(){const e=new Set;for(const t of this._allExtensions){if(!this.containsExtension(t.identifier))continue;const s=p.readActivationEvents(t);for(const a of s)e.add(a)}return e}}function I(n){const e=new A;for(const t of n)e.set(t.identifier,t);return e}function C(n,e){return n.enabledApiProposals?n.enabledApiProposals.includes(e):!1}function de(n,e){if(!C(n,e))throw new Error(`Extension '${n.identifier.value}' CANNOT use API proposal: ${e}.
Its package.json#enabledApiProposals-property declares: ${n.enabledApiProposals?.join(", ")??"[]"} but NOT ${e}.
 The missing proposal MUST be added and you must start in extension development mode or use the following command line switch: --enable-proposed-api ${n.identifier.value}`)}class Ee{constructor(e,t,s,a){this.codeLoadingTime=e;this.activateCallTime=t;this.activateResolvedTime=s;this.activationReason=a}}class ce{description;value;constructor(e,t){this.description=e,this.value=t}}var w=(t=>(t[t.Normal=0]="Normal",t[t.Immediate=1]="Immediate",t))(w||{});function xe(n){return{type:n.isBuiltin?v.System:v.User,isBuiltin:n.isBuiltin||n.isUserBuiltin,identifier:{id:_(n.publisher,n.name),uuid:n.uuid},manifest:n,location:n.extensionLocation,targetPlatform:n.targetPlatform,validations:[],isValid:!0}}function ve(n,e){const t=D(n.manifest.publisher,n.manifest.name);return{id:t,identifier:new u(t),isBuiltin:n.type===v.System,isUserBuiltin:n.type===v.User&&n.isBuiltin,isUnderDevelopment:!!e,extensionLocation:n.location,uuid:n.identifier.uuid,targetPlatform:n.targetPlatform,publisherDisplayName:n.publisherDisplayName,...n.manifest}}class pe{onDidRegisterExtensions=l.None;onDidChangeExtensionsStatus=l.None;onDidChangeExtensions=l.None;onWillActivateByEvent=l.None;onDidChangeResponsiveChange=l.None;onWillStop=l.None;extensions=[];activateByEvent(e){return Promise.resolve(void 0)}activateById(e,t){return Promise.resolve(void 0)}activationEventIsDone(e){return!1}whenInstalledExtensionsRegistered(){return Promise.resolve(!0)}getExtension(){return Promise.resolve(void 0)}readExtensionPointContributions(e){return Promise.resolve(Object.create(null))}getExtensionsStatus(){return Object.create(null)}getInspectPorts(e,t){return Promise.resolve([])}stopExtensionHosts(){}async startExtensionHosts(){}async setRemoteEnvironment(e){}canAddExtension(){return!1}canRemoveExtension(){return!1}}export{w as ActivationKind,Ee as ActivationTimes,le as ExtensionHostExtensions,T as ExtensionHostStartup,ce as ExtensionPointContribution,re as IExtensionService,ae as MissingExtensionDependency,pe as NullExtensionService,de as checkProposedApiEnabled,C as isProposedApiEnabled,oe as nullExtensionDescription,xe as toExtension,ve as toExtensionDescription,se as webWorkerExtHostConfig};
