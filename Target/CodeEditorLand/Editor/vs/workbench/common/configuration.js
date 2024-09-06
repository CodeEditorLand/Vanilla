var W=Object.defineProperty;var A=Object.getOwnPropertyDescriptor;var C=(u,t,e,i)=>{for(var o=i>1?void 0:i?A(t,e):t,f=u.length-1,r;f>=0;f--)(r=u[f])&&(o=(i?r(t,e,o):r(o))||o);return i&&o&&W(t,e,o),o},l=(u,t)=>(e,i)=>t(e,i,u);import{DeferredPromise as M}from"../../../vs/base/common/async.js";import{Emitter as E}from"../../../vs/base/common/event.js";import{Disposable as N}from"../../../vs/base/common/lifecycle.js";import{equals as D}from"../../../vs/base/common/objects.js";import{isWindows as F,OperatingSystem as V}from"../../../vs/base/common/platform.js";import"../../../vs/base/common/uri.js";import{localize as a}from"../../../vs/nls.js";import{ConfigurationTarget as s,IConfigurationService as k}from"../../../vs/platform/configuration/common/configuration.js";import{Extensions as b,ConfigurationScope as m}from"../../../vs/platform/configuration/common/configurationRegistry.js";import{Registry as S}from"../../../vs/platform/registry/common/platform.js";import{IUserDataProfilesService as x}from"../../../vs/platform/userDataProfile/common/userDataProfile.js";import{IWorkspaceContextService as U,WorkbenchState as O}from"../../../vs/platform/workspace/common/workspace.js";import"../../../vs/workbench/common/contributions.js";import{IRemoteAgentService as _}from"../../../vs/workbench/services/remote/common/remoteAgentService.js";const ge=Object.freeze({id:"application",order:100,title:a("applicationConfigurationTitle","Application"),type:"object"}),le=Object.freeze({id:"workbench",order:7,title:a("workbenchConfigurationTitle","Workbench"),type:"object"}),L=Object.freeze({id:"security",scope:m.APPLICATION,title:a("securityConfigurationTitle","Security"),type:"object",order:7}),pe=Object.freeze({id:"problems",title:a("problemsConfigurationTitle","Problems"),type:"object",order:101}),T=Object.freeze({id:"window",order:8,title:a("windowConfigurationTitle","Window"),type:"object"}),j={ConfigurationMigration:"base.contributions.configuration.migration"};class K{migrations=[];_onDidRegisterConfigurationMigrations=new E;onDidRegisterConfigurationMigration=this._onDidRegisterConfigurationMigrations.event;registerConfigurationMigrations(t){this.migrations.push(...t)}}const h=new K;S.add(j.ConfigurationMigration,h);let v=class extends N{constructor(e,i){super();this.configurationService=e;this.workspaceService=i;this._register(this.workspaceService.onDidChangeWorkspaceFolders(async o=>{for(const f of o.added)await this.migrateConfigurationsForFolder(f,h.migrations)})),this.migrateConfigurations(h.migrations),this._register(h.onDidRegisterConfigurationMigration(o=>this.migrateConfigurations(o)))}static ID="workbench.contrib.configurationMigration";async migrateConfigurations(e){await this.migrateConfigurationsForFolder(void 0,e);for(const i of this.workspaceService.getWorkspace().folders)await this.migrateConfigurationsForFolder(i,e)}async migrateConfigurationsForFolder(e,i){await Promise.all([i.map(o=>this.migrateConfigurationsForFolderAndOverride(o,e?.uri))])}async migrateConfigurationsForFolderAndOverride(e,i){const o=this.configurationService.inspect(e.key,{resource:i}),f=this.workspaceService.getWorkbenchState()===O.WORKSPACE?[["user",s.USER],["userLocal",s.USER_LOCAL],["userRemote",s.USER_REMOTE],["workspace",s.WORKSPACE],["workspaceFolder",s.WORKSPACE_FOLDER]]:[["user",s.USER],["userLocal",s.USER_LOCAL],["userRemote",s.USER_REMOTE],["workspace",s.WORKSPACE]];for(const[r,I]of f){const c=o[r];if(!c)continue;const g=[];if(c.value!==void 0){const d=await this.runMigration(e,r,c.value,i,void 0);for(const n of d??[])g.push([n,[]])}for(const{identifiers:d,value:n}of c.overrides??[])if(n!==void 0){const p=await this.runMigration(e,r,n,i,d);for(const R of p??[])g.push([R,d])}g.length&&await Promise.allSettled(g.map(async([[d,n],p])=>this.configurationService.updateValue(d,n.value,{resource:i,overrideIdentifiers:p},I)))}}async runMigration(e,i,o,f,r){const I=g=>{const n=this.configurationService.inspect(g,{resource:f})[i];if(n)return r?n.overrides?.find(({identifiers:p})=>D(p,r))?.value:n.value},c=await e.migrateFn(o,I);return Array.isArray(c)?c:[[e.key,c]]}};v=C([l(0,k),l(1,U)],v);let y=class extends N{constructor(e){super();this.remoteAgentService=e;this.create()}static ID="workbench.contrib.dynamicWorkbenchSecurityConfiguration";_ready=new M;ready=this._ready.p;async create(){try{await this.doCreate()}finally{this._ready.complete()}}async doCreate(){if(!F&&(await this.remoteAgentService.getEnvironment())?.os!==V.Windows)return;S.as(b.Configuration).registerConfiguration({...L,properties:{"security.allowedUNCHosts":{type:"array",items:{type:"string",pattern:"^[^\\\\]+$",patternErrorMessage:a("security.allowedUNCHosts.patternErrorMessage","UNC host names must not contain backslashes.")},default:[],markdownDescription:a("security.allowedUNCHosts","A set of UNC host names (without leading or trailing backslash, for example `192.168.0.1` or `my-server`) to allow without user confirmation. If a UNC host is being accessed that is not allowed via this setting or has not been acknowledged via user confirmation, an error will occur and the operation stopped. A restart is required when changing this setting. Find out more about this setting at https://aka.ms/vscode-windows-unc."),scope:m.MACHINE},"security.restrictUNCAccess":{type:"boolean",default:!0,markdownDescription:a("security.restrictUNCAccess","If enabled, only allows access to UNC host names that are allowed by the `#security.allowedUNCHosts#` setting or after user confirmation. Find out more about this setting at https://aka.ms/vscode-windows-unc."),scope:m.MACHINE}}})}};y=C([l(0,_)],y);const w="window.newWindowProfile";let P=class extends N{constructor(e,i){super();this.userDataProfilesService=e;this.configurationService=i;this.registerNewWindowProfileConfiguration(),this._register(this.userDataProfilesService.onDidChangeProfiles(o=>this.registerNewWindowProfileConfiguration())),this.setNewWindowProfile(),this.checkAndResetNewWindowProfileConfig(),this._register(i.onDidChangeConfiguration(o=>{o.source!==s.DEFAULT&&o.affectsConfiguration(w)&&this.setNewWindowProfile()})),this._register(this.userDataProfilesService.onDidChangeProfiles(()=>this.checkAndResetNewWindowProfileConfig()))}static ID="workbench.contrib.dynamicWindowConfiguration";configurationNode;newWindowProfile;registerNewWindowProfileConfiguration(){const e=S.as(b.Configuration),i={...T,properties:{[w]:{type:["string","null"],default:null,enum:[...this.userDataProfilesService.profiles.map(o=>o.name),null],enumItemLabels:[...this.userDataProfilesService.profiles.map(o=>""),a("active window","Active Window")],description:a("newWindowProfile","Specifies the profile to use when opening a new window. If a profile name is provided, the new window will use that profile. If no profile name is provided, the new window will use the profile of the active window or the Default profile if no active window exists."),scope:m.APPLICATION}}};this.configurationNode?e.updateConfigurations({add:[i],remove:[this.configurationNode]}):e.registerConfiguration(i),this.configurationNode=i}setNewWindowProfile(){const e=this.configurationService.getValue(w);this.newWindowProfile=e?this.userDataProfilesService.profiles.find(i=>i.name===e):void 0}checkAndResetNewWindowProfileConfig(){const e=this.configurationService.getValue(w);if(!e)return;const i=this.newWindowProfile?this.userDataProfilesService.profiles.find(o=>o.id===this.newWindowProfile.id):void 0;e!==i?.name&&this.configurationService.updateValue(w,i?.name)}};P=C([l(0,x),l(1,k)],P);export{w as CONFIG_NEW_WINDOW_PROFILE,v as ConfigurationMigrationWorkbenchContribution,P as DynamicWindowConfiguration,y as DynamicWorkbenchSecurityConfiguration,j as Extensions,ge as applicationConfigurationNodeBase,pe as problemsConfigurationNodeBase,L as securityConfigurationNodeBase,T as windowConfigurationNodeBase,le as workbenchConfigurationNodeBase};
