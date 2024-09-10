var P=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var g=(a,t,e,r)=>{for(var i=r>1?void 0:r?h(t,e):t,o=a.length-1,s;o>=0;o--)(s=a[o])&&(i=(r?s(t,e,i):s(i))||i);return r&&i&&P(t,e,i),i},n=(a,t)=>(e,r)=>t(e,r,a);import{localize as b}from"../../../../nls.js";import{IInstantiationService as D}from"../../../../platform/instantiation/common/instantiation.js";import{ILogService as U}from"../../../../platform/log/common/log.js";import{IStorageService as m,StorageScope as S,StorageTarget as l}from"../../../../platform/storage/common/storage.js";import{IUriIdentityService as p}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{ProfileResourceType as d}from"../../../../platform/userDataProfile/common/userDataProfile.js";import{IUserDataProfileStorageService as C}from"../../../../platform/userDataProfile/common/userDataProfileStorageService.js";import{API_OPEN_EDITOR_COMMAND_ID as k}from"../../../browser/parts/editor/editorCommands.js";import{TreeItemCollapsibleState as u}from"../../../common/views.js";let f=class{constructor(t){this.storageService=t}async initialize(t){const e=JSON.parse(t),r=Object.keys(e.storage);if(r.length){const i=[];for(const o of r)i.push({key:o,value:e.storage[o],scope:S.PROFILE,target:l.USER});this.storageService.storeAll(i,!0)}}};f=g([n(0,m)],f);let c=class{constructor(t,e,r){this.storageService=t;this.userDataProfileStorageService=e;this.logService=r}async getContent(t){const e=await this.getGlobalState(t);return JSON.stringify(e)}async apply(t,e){const r=JSON.parse(t);await this.writeGlobalState(r,e)}async getGlobalState(t){const e={},r=await this.userDataProfileStorageService.readStorageData(t);for(const[i,o]of r)o.value!==void 0&&o.target===l.USER&&(e[i]=o.value);return{storage:e}}async writeGlobalState(t,e){const r=Object.keys(t.storage);if(r.length){const i=new Map,o=[...this.storageService.keys(S.APPLICATION,l.MACHINE),...this.storageService.keys(S.WORKSPACE,l.USER),...this.storageService.keys(S.WORKSPACE,l.MACHINE)];for(const s of r)o.includes(s)?this.logService.info(`Importing Profile (${e.name}): Ignoring global state key '${s}' because it is not a profile key.`):i.set(s,t.storage[s]);await this.userDataProfileStorageService.updateStorageData(e,i,l.USER)}}};c=g([n(0,m),n(1,C),n(2,U)],c);class v{constructor(t,e){this.resource=t;this.uriIdentityService=e}type=d.GlobalState;handle=d.GlobalState;label={label:b("globalState","UI State")};collapsibleState=u.Collapsed;checkbox;async getChildren(){return[{handle:this.resource.toString(),resourceUri:this.resource,collapsibleState:u.None,accessibilityInformation:{label:this.uriIdentityService.extUri.basename(this.resource)},parent:this,command:{id:k,title:"",arguments:[this.resource,void 0,void 0]}}]}}let I=class extends v{constructor(e,r,i,o){super(r,i);this.profile=e;this.instantiationService=o}async hasContent(){const e=await this.instantiationService.createInstance(c).getGlobalState(this.profile);return Object.keys(e.storage).length>0}async getContent(){return this.instantiationService.createInstance(c).getContent(this.profile)}isFromDefaultProfile(){return!this.profile.isDefault&&!!this.profile.useDefaultFlags?.globalState}};I=g([n(2,p),n(3,D)],I);let y=class extends v{constructor(e,r,i){super(r,i);this.content=e}async getContent(){return this.content}isFromDefaultProfile(){return!1}};y=g([n(2,p)],y);export{c as GlobalStateResource,I as GlobalStateResourceExportTreeItem,y as GlobalStateResourceImportTreeItem,f as GlobalStateResourceInitializer,v as GlobalStateResourceTreeItem};
