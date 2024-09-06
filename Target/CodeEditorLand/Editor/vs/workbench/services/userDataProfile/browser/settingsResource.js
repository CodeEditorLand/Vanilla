var y=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var c=(o,t,e,i)=>{for(var r=i>1?void 0:i?h(t,e):t,s=o.length-1,l;s>=0;s--)(l=o[s])&&(r=(i?l(t,e,r):l(r))||r);return i&&r&&y(t,e,r),r},n=(o,t)=>(e,i)=>t(e,i,o);import{VSBuffer as p}from"../../../../base/common/buffer.js";import{localize as C}from"../../../../nls.js";import{ConfigurationScope as S,Extensions as P}from"../../../../platform/configuration/common/configurationRegistry.js";import{FileOperationError as D,FileOperationResult as U,IFileService as I}from"../../../../platform/files/common/files.js";import{IInstantiationService as F}from"../../../../platform/instantiation/common/instantiation.js";import{ILogService as m}from"../../../../platform/log/common/log.js";import{Registry as O}from"../../../../platform/registry/common/platform.js";import{IUriIdentityService as R}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{ProfileResourceType as u}from"../../../../platform/userDataProfile/common/userDataProfile.js";import{updateIgnoredSettings as v}from"../../../../platform/userDataSync/common/settingsMerge.js";import{IUserDataSyncUtilService as b}from"../../../../platform/userDataSync/common/userDataSync.js";import{API_OPEN_EDITOR_COMMAND_ID as w}from"../../../browser/parts/editor/editorCommands.js";import{TreeItemCollapsibleState as d}from"../../../common/views.js";import{IUserDataProfileService as N}from"../common/userDataProfile.js";let g=class{constructor(t,e,i){this.userDataProfileService=t;this.fileService=e;this.logService=i}async initialize(t){const e=JSON.parse(t);if(e.settings===null){this.logService.info("Initializing Profile: No settings to apply...");return}await this.fileService.writeFile(this.userDataProfileService.currentProfile.settingsResource,p.fromString(e.settings))}};g=c([n(0,N),n(1,I),n(2,m)],g);let a=class{constructor(t,e,i){this.fileService=t;this.userDataSyncUtilService=e;this.logService=i}async getContent(t){const e=await this.getSettingsContent(t);return JSON.stringify(e)}async getSettingsContent(t){const e=await this.getLocalFileContent(t);if(e===null)return{settings:null};{const i=this.getIgnoredSettings(),r=await this.userDataSyncUtilService.resolveFormattingOptions(t.settingsResource);return{settings:v(e||"{}","{}",i,r)}}}async apply(t,e){const i=JSON.parse(t);if(i.settings===null){this.logService.info(`Importing Profile (${e.name}): No settings to apply...`);return}const r=await this.getLocalFileContent(e),s=await this.userDataSyncUtilService.resolveFormattingOptions(e.settingsResource),l=v(i.settings,r||"{}",this.getIgnoredSettings(),s);await this.fileService.writeFile(e.settingsResource,p.fromString(l))}getIgnoredSettings(){const t=O.as(P.Configuration).getConfigurationProperties();return Object.keys(t).filter(i=>t[i]?.scope===S.MACHINE||t[i]?.scope===S.MACHINE_OVERRIDABLE)}async getLocalFileContent(t){try{return(await this.fileService.readFile(t.settingsResource)).value.toString()}catch(e){if(e instanceof D&&e.fileOperationResult===U.FILE_NOT_FOUND)return null;throw e}}};a=c([n(0,I),n(1,b),n(2,m)],a);let f=class{constructor(t,e,i){this.profile=t;this.uriIdentityService=e;this.instantiationService=i}type=u.Settings;handle=u.Settings;label={label:C("settings","Settings")};collapsibleState=d.Expanded;checkbox;async getChildren(){return[{handle:this.profile.settingsResource.toString(),resourceUri:this.profile.settingsResource,collapsibleState:d.None,parent:this,accessibilityInformation:{label:this.uriIdentityService.extUri.basename(this.profile.settingsResource)},command:{id:w,title:"",arguments:[this.profile.settingsResource,void 0,void 0]}}]}async hasContent(){return(await this.instantiationService.createInstance(a).getSettingsContent(this.profile)).settings!==null}async getContent(){return this.instantiationService.createInstance(a).getContent(this.profile)}isFromDefaultProfile(){return!this.profile.isDefault&&!!this.profile.useDefaultFlags?.settings}};f=c([n(1,R),n(2,F)],f);export{a as SettingsResource,g as SettingsResourceInitializer,f as SettingsResourceTreeItem};
