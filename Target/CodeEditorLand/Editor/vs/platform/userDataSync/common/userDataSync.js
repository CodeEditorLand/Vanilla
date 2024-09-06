import{distinct as v}from"../../../base/common/arrays.js";import"../../../base/common/buffer.js";import"../../../base/common/collections.js";import"../../../base/common/event.js";import"../../../base/common/jsonFormatter.js";import"../../../base/common/jsonSchema.js";import"../../../base/common/lifecycle.js";import"../../../base/common/resources.js";import{isObject as D,isString as f}from"../../../base/common/types.js";import"../../../base/common/uri.js";import"../../../base/parts/request/common/request.js";import{localize as d}from"../../../nls.js";import{allSettings as U,Extensions as I,ConfigurationScope as u,getAllConfigurationProperties as P,parseScope as x}from"../../configuration/common/configurationRegistry.js";import"../../environment/common/environment.js";import{EXTENSION_IDENTIFIER_PATTERN as b}from"../../extensionManagement/common/extensionManagement.js";import"../../extensions/common/extensions.js";import{createDecorator as a}from"../../instantiation/common/instantiation.js";import{Extensions as E}from"../../jsonschemas/common/jsonContributionRegistry.js";import"../../log/common/log.js";import{Registry as y}from"../../registry/common/platform.js";import"../../userDataProfile/common/userDataProfile.js";import"./userDataSyncMachines.js";function p(){const e=y.as(I.Configuration).getConfigurationProperties();return Object.keys(e).filter(r=>!!e[r].disallowSyncIgnore)}function h(e=!1){const r=y.as(I.Configuration).getConfigurationProperties(),s=R(r,e),o=p();return v([...s,...o])}function Pe(e){if(!e.contributes?.configuration)return[];const r=Array.isArray(e.contributes.configuration)?e.contributes.configuration:[e.contributes.configuration];if(!r.length)return[];const s=P(r);return R(s,!1)}function R(e,r){const s=new Set;for(const o in e){if(r&&e[o].source)continue;const t=f(e[o].scope)?x(e[o].scope):e[o].scope;(e[o].ignoreSync||t===u.MACHINE||t===u.MACHINE_OVERRIDABLE)&&s.add(o)}return[...s.values()]}const xe="settingsSync",C="settingsSync.keybindingsPerPlatform";function be(){const e="vscode://schemas/ignoredSettings",r=y.as(I.Configuration);r.registerConfiguration({id:"settingsSync",order:30,title:d("settings sync","Settings Sync"),type:"object",properties:{[C]:{type:"boolean",description:d("settingsSync.keybindingsPerPlatform","Synchronize keybindings for each platform."),default:!0,scope:u.APPLICATION,tags:["sync","usesOnlineServices"]},"settingsSync.ignoredExtensions":{type:"array",markdownDescription:d("settingsSync.ignoredExtensions","List of extensions to be ignored while synchronizing. The identifier of an extension is always `${publisher}.${name}`. For example: `vscode.csharp`."),items:[{type:"string",pattern:b,errorMessage:d("app.extension.identifier.errorMessage","Expected format '${publisher}.${name}'. Example: 'vscode.csharp'.")}],default:[],scope:u.APPLICATION,uniqueItems:!0,disallowSyncIgnore:!0,tags:["sync","usesOnlineServices"]},"settingsSync.ignoredSettings":{type:"array",description:d("settingsSync.ignoredSettings","Configure settings to be ignored while synchronizing."),default:[],scope:u.APPLICATION,$ref:e,additionalProperties:!0,uniqueItems:!0,disallowSyncIgnore:!0,tags:["sync","usesOnlineServices"]}}});const s=y.as(E.JSONContribution),o=()=>{const t=p(),c=h(),g=Object.keys(U.properties).filter(l=>!c.includes(l)),m=c.filter(l=>!t.includes(l)),i={items:{type:"string",enum:[...g,...m.map(l=>`-${l}`)]}};s.registerSchema(e,i)};return r.onDidUpdateConfiguration(()=>o())}function Ee(e){return e&&D(e)&&f(e.id)&&Array.isArray(e.scopes)}var A=(i=>(i.Settings="settings",i.Keybindings="keybindings",i.Snippets="snippets",i.Tasks="tasks",i.Extensions="extensions",i.GlobalState="globalState",i.Profiles="profiles",i.WorkspaceState="workspaceState",i))(A||{});const he=["settings","keybindings","snippets","tasks","extensions","globalState","profiles"];function L(e,...r){return e?[e,...r]:r}function Ce(e,r,s,o){return o.joinPath(s.userDataSyncHome,...L(e,r,`lastSync${r}.json`))}const Ae=a("IUserDataSyncStoreManagementService"),Le=a("IUserDataSyncStoreService"),Te=a("IUserDataSyncLocalStoreService"),Ne="x-operation-id",T="X-Execution-Id";function Me(e){const r={};return r[T]=e,r}var N=(n=>(n.Unauthorized="Unauthorized",n.Forbidden="Forbidden",n.NotFound="NotFound",n.MethodNotFound="MethodNotFound",n.Conflict="Conflict",n.Gone="Gone",n.PreconditionFailed="PreconditionFailed",n.TooLarge="TooLarge",n.UpgradeRequired="UpgradeRequired",n.PreconditionRequired="PreconditionRequired",n.TooManyRequests="RemoteTooManyRequests",n.TooManyRequestsAndRetryAfter="TooManyRequestsAndRetryAfter",n.RequestFailed="RequestFailed",n.RequestCanceled="RequestCanceled",n.RequestTimeout="RequestTimeout",n.RequestProtocolNotSupported="RequestProtocolNotSupported",n.RequestPathNotEscaped="RequestPathNotEscaped",n.RequestHeadersNotObject="RequestHeadersNotObject",n.NoCollection="NoCollection",n.NoRef="NoRef",n.EmptyResponse="EmptyResponse",n.TurnedOff="TurnedOff",n.SessionExpired="SessionExpired",n.ServiceChanged="ServiceChanged",n.DefaultServiceChanged="DefaultServiceChanged",n.LocalTooManyProfiles="LocalTooManyProfiles",n.LocalTooManyRequests="LocalTooManyRequests",n.LocalPreconditionFailed="LocalPreconditionFailed",n.LocalInvalidContent="LocalInvalidContent",n.LocalError="LocalError",n.IncompatibleLocalContent="IncompatibleLocalContent",n.IncompatibleRemoteContent="IncompatibleRemoteContent",n.Unknown="Unknown",n))(N||{});class S extends Error{constructor(s,o,t,c){super(s);this.code=o;this.resource=t;this.operationId=c;this.name=`${this.code} (UserDataSyncError) syncResource:${this.resource||"unknown"} operationId:${this.operationId||"unknown"}`}}class we extends S{constructor(s,o,t,c,g){super(s,t,void 0,g);this.url=o;this.serverCode=c}}class ke extends S{constructor(r,s){super(r,s)}}(r=>{function e(s){if(s instanceof r)return s;const o=/^(.+) \(UserDataSyncError\) syncResource:(.+) operationId:(.+)$/.exec(s.name);if(o&&o[1]){const t=o[2]==="unknown"?void 0:o[2],c=o[3]==="unknown"?void 0:o[3];return new r(s.message,o[1],t,c)}return new r(s.message,"Unknown")}r.toUserDataSyncError=e})(S||={});var M=(t=>(t.Uninitialized="uninitialized",t.Idle="idle",t.Syncing="syncing",t.HasConflicts="hasConflicts",t))(M||{}),w=(t=>(t[t.None=0]="None",t[t.Added=1]="Added",t[t.Modified=2]="Modified",t[t.Deleted=3]="Deleted",t))(w||{}),k=(o=>(o.Preview="preview",o.Conflict="conflict",o.Accepted="accepted",o))(k||{});const He="sync.store.url.type";function _e(e){return`sync.enable.${e}`}const Oe=a("IUserDataSyncEnablementService"),Fe=a("IUserDataSyncService"),qe=a("IUserDataSyncResourceProviderService"),Be=a("IUserDataAutoSyncService"),Ve=a("IUserDataSyncUtilService"),$e=a("IUserDataSyncLogService"),ze="userDataSync",je="vscode-userdata-sync",Ge="preview";export{he as ALL_SYNC_RESOURCES,C as CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM,w as Change,T as HEADER_EXECUTION_ID,Ne as HEADER_OPERATION_ID,Be as IUserDataAutoSyncService,Oe as IUserDataSyncEnablementService,Te as IUserDataSyncLocalStoreService,$e as IUserDataSyncLogService,qe as IUserDataSyncResourceProviderService,Fe as IUserDataSyncService,Ae as IUserDataSyncStoreManagementService,Le as IUserDataSyncStoreService,Ve as IUserDataSyncUtilService,k as MergeState,Ge as PREVIEW_DIR_NAME,He as SYNC_SERVICE_URL_TYPE,A as SyncResource,M as SyncStatus,xe as USER_DATA_SYNC_CONFIGURATION_SCOPE,ze as USER_DATA_SYNC_LOG_ID,je as USER_DATA_SYNC_SCHEME,ke as UserDataAutoSyncError,S as UserDataSyncError,N as UserDataSyncErrorCode,we as UserDataSyncStoreError,Me as createSyncHeaders,h as getDefaultIgnoredSettings,p as getDisallowedIgnoredSettings,_e as getEnablementKey,Pe as getIgnoredSettingsForExtension,Ce as getLastSyncResourceUri,L as getPathSegments,Ee as isAuthenticationProvider,be as registerConfiguration};
