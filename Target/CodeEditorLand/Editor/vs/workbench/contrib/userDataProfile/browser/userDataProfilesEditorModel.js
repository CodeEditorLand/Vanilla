var q=Object.defineProperty;var z=Object.getOwnPropertyDescriptor;var F=(u,g,e,i)=>{for(var t=i>1?void 0:i?z(g,e):g,s=u.length-1,o;s>=0;s--)(o=u[s])&&(t=(i?o(g,e,t):o(t))||t);return i&&t&&q(g,e,t),t},n=(u,g)=>(e,i)=>g(e,i,u);import{Action as m,Separator as H}from"../../../../base/common/actions.js";import{createCancelablePromise as G,RunOnceScheduler as j}from"../../../../base/common/async.js";import{CancellationToken as N,CancellationTokenSource as J}from"../../../../base/common/cancellation.js";import{Codicon as v}from"../../../../base/common/codicons.js";import{getErrorMessage as Q}from"../../../../base/common/errors.js";import{Emitter as k}from"../../../../base/common/event.js";import{Disposable as X,DisposableStore as A,toDisposable as W}from"../../../../base/common/lifecycle.js";import{ResourceMap as Y}from"../../../../base/common/map.js";import{equals as x}from"../../../../base/common/objects.js";import{isWeb as M}from"../../../../base/common/platform.js";import{ThemeIcon as y}from"../../../../base/common/themables.js";import{URI as P}from"../../../../base/common/uri.js";import{generateUuid as O}from"../../../../base/common/uuid.js";import{localize as a}from"../../../../nls.js";import{ICommandService as R}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as Z}from"../../../../platform/configuration/common/configuration.js";import{IDialogService as $}from"../../../../platform/dialogs/common/dialogs.js";import{IFileService as ee}from"../../../../platform/files/common/files.js";import{InMemoryFileSystemProvider as ie}from"../../../../platform/files/common/inMemoryFilesystemProvider.js";import{IInstantiationService as b}from"../../../../platform/instantiation/common/instantiation.js";import{IOpenerService as te}from"../../../../platform/opener/common/opener.js";import{IProductService as re}from"../../../../platform/product/common/productService.js";import{ITelemetryService as se}from"../../../../platform/telemetry/common/telemetry.js";import{isUserDataProfile as C,IUserDataProfilesService as _,ProfileResourceType as r,toUserDataProfile as K}from"../../../../platform/userDataProfile/common/userDataProfile.js";import{API_OPEN_EDITOR_COMMAND_ID as oe}from"../../../browser/parts/editor/editorCommands.js";import{CONFIG_NEW_WINDOW_PROFILE as E}from"../../../common/configuration.js";import{EditorModel as ne}from"../../../common/editor/editorModel.js";import"../../../common/views.js";import{SIDE_GROUP as ae}from"../../../services/editor/common/editorService.js";import{IHostService as le}from"../../../services/host/browser/host.js";import{ExtensionsResourceExportTreeItem as fe,ExtensionsResourceImportTreeItem as ce}from"../../../services/userDataProfile/browser/extensionsResource.js";import{KeybindingsResource as de,KeybindingsResourceTreeItem as he}from"../../../services/userDataProfile/browser/keybindingsResource.js";import{SettingsResource as pe,SettingsResourceTreeItem as me}from"../../../services/userDataProfile/browser/settingsResource.js";import{SnippetsResource as ue,SnippetsResourceTreeItem as Pe}from"../../../services/userDataProfile/browser/snippetsResource.js";import{TasksResource as ge,TasksResourceTreeItem as ve}from"../../../services/userDataProfile/browser/tasksResource.js";import{isProfileURL as ye,IUserDataProfileImportExportService as L,IUserDataProfileManagementService as T,IUserDataProfileService as B}from"../../../services/userDataProfile/common/userDataProfile.js";function pi(u){return u.resourceType!==void 0}function mi(u){return u.label!==void 0}let S=class extends X{constructor(e,i,t,s,o,p,c,h){super();this.userDataProfileManagementService=o;this.userDataProfilesService=p;this.commandService=c;this.instantiationService=h;this._name=e,this._icon=i,this._flags=t,this._active=s,this._register(this.onDidChange(f=>{f.message||this.validate(),this.save()}))}_onDidChange=this._register(new k);onDidChange=this._onDidChange.event;saveScheduler=this._register(new j(()=>this.doSave(),500));_name="";get name(){return this._name}set name(e){e=e.trim(),this._name!==e&&(this._name=e,this._onDidChange.fire({name:!0}))}_icon;get icon(){return this._icon}set icon(e){this._icon!==e&&(this._icon=e,this._onDidChange.fire({icon:!0}))}_flags;get flags(){return this._flags}set flags(e){x(this._flags,e)||(this._flags=e,this._onDidChange.fire({flags:!0}))}_active=!1;get active(){return this._active}set active(e){this._active!==e&&(this._active=e,this._onDidChange.fire({active:!0}))}_message;get message(){return this._message}set message(e){this._message!==e&&(this._message=e,this._onDidChange.fire({message:!0}))}_disabled=!1;get disabled(){return this._disabled}set disabled(e){this._disabled!==e&&(this._disabled=e,this._onDidChange.fire({disabled:!0}))}getFlag(e){return this.flags?.[e]??!1}setFlag(e,i){const t=this.flags?{...this.flags}:{};i?t[e]=!0:delete t[e],this.flags=t}validate(){if(!this.name){this.message=a("name required","Profile name is required and must be a non-empty value.");return}if(this.shouldValidateName()&&this.name!==this.getInitialName()&&this.userDataProfilesService.profiles.some(e=>e.name===this.name)){this.message=a("profileExists","Profile with name {0} already exists.",this.name);return}if(this.flags&&this.flags.settings&&this.flags.keybindings&&this.flags.tasks&&this.flags.snippets&&this.flags.extensions){this.message=a("invalid configurations","The profile should contain at least one configuration.");return}this.message=void 0}async getChildren(e){if(e===void 0){const i=[r.Settings,r.Keybindings,r.Tasks,r.Snippets,r.Extensions];return Promise.all(i.map(async t=>{const s=t===r.Settings||t===r.Keybindings||t===r.Tasks?await this.getChildrenForResourceType(t):[];return{handle:t,checkbox:void 0,resourceType:t,action:s.length?new m("_open",a("open","Open to the Side"),y.asClassName(v.goToFile),!0,()=>s[0]?.action?.run()):void 0}}))}return this.getChildrenForResourceType(e)}async getChildrenForResourceType(e){return[]}async getChildrenFromProfile(e,i){e=this.getFlag(i)?this.userDataProfilesService.defaultProfile:e;let t=[];switch(i){case r.Settings:t=await this.instantiationService.createInstance(me,e).getChildren();break;case r.Keybindings:t=await this.instantiationService.createInstance(he,e).getChildren();break;case r.Snippets:t=await this.instantiationService.createInstance(Pe,e).getChildren()??[];break;case r.Tasks:t=await this.instantiationService.createInstance(ve,e).getChildren();break;case r.Extensions:t=await this.instantiationService.createInstance(fe,e).getChildren();break}return t.map(s=>this.toUserDataProfileResourceChildElement(s))}toUserDataProfileResourceChildElement(e){return{handle:e.handle,checkbox:e.checkbox,label:e.label?.label??"",resource:P.revive(e.resourceUri),icon:e.themeIcon,action:new m("_openChild",a("open","Open to the Side"),y.asClassName(v.goToFile),!0,async()=>{e.parent.type===r.Extensions?await this.commandService.executeCommand("extension.open",e.handle,void 0,!0,void 0,!0):e.resourceUri&&await this.commandService.executeCommand(oe,e.resourceUri,[ae],void 0)})}}getInitialName(){return""}shouldValidateName(){return!0}save(){this.saveScheduler.schedule()}hasUnsavedChanges(e){return this.name!==e.name||this.icon!==e.icon||!x(this.flags??{},e.useDefaultFlags??{})}async saveProfile(e){if(!this.hasUnsavedChanges(e)||(this.validate(),this.message))return;const i=this.flags?this.flags.settings&&this.flags.keybindings&&this.flags.tasks&&this.flags.globalState&&this.flags.extensions?void 0:this.flags:void 0;return await this.userDataProfileManagementService.updateProfile(e,{name:this.name,icon:this.icon,useDefaultFlags:e.useDefaultFlags&&!i?{}:i})}};S=F([n(4,T),n(5,_),n(6,R),n(7,b)],S);let I=class extends S{constructor(e,i,t,s,o,p,c,h,f){super(e.name,e.icon,e.useDefaultFlags,s.currentProfile.id===e.id,p,c,h,f);this._profile=e;this.titleButtons=i;this.actions=t;this.userDataProfileService=s;this.configurationService=o;this._isNewWindowProfile=this.configurationService.getValue(E)===this.profile.name,this._register(o.onDidChangeConfiguration(l=>{l.affectsConfiguration(E)&&(this.isNewWindowProfile=this.configurationService.getValue(E)===this.profile.name)})),this._register(this.userDataProfileService.onDidChangeCurrentProfile(()=>this.active=this.userDataProfileService.currentProfile.id===this.profile.id)),this._register(this.userDataProfilesService.onDidChangeProfiles(({updated:l})=>{const d=l.find(V=>V.id===this.profile.id);d&&(this._profile=d,this.reset(),this._onDidChange.fire({profile:!0}))}))}get profile(){return this._profile}reset(){this.name=this._profile.name,this.icon=this._profile.icon,this.flags=this._profile.useDefaultFlags}async toggleNewWindowProfile(){this._isNewWindowProfile?await this.configurationService.updateValue(E,null):await this.configurationService.updateValue(E,this.profile.name)}_isNewWindowProfile=!1;get isNewWindowProfile(){return this._isNewWindowProfile}set isNewWindowProfile(e){this._isNewWindowProfile!==e&&(this._isNewWindowProfile=e,this._onDidChange.fire({newWindowProfile:!0}))}async toggleCurrentWindowProfile(){this.userDataProfileService.currentProfile.id===this.profile.id?await this.userDataProfileManagementService.switchProfile(this.userDataProfilesService.defaultProfile):await this.userDataProfileManagementService.switchProfile(this.profile)}async doSave(){await this.saveProfile(this.profile)}async getChildrenForResourceType(e){return this.getChildrenFromProfile(this.profile,e)}getInitialName(){return this.profile.name}};I=F([n(3,B),n(4,Z),n(5,T),n(6,_),n(7,R),n(8,b)],I);const U="userdataprofiletemplatepreview";let D=class extends S{constructor(e,i,t,s,o,p,c,h,f,l){super(e,void 0,void 0,!1,c,h,f,l);this.titleButtons=t;this.actions=s;this.fileService=o;this.userDataProfileImportExportService=p;this.defaultName=e,this._copyFrom=i,this._copyFlags=this.getCopyFlagsFrom(i),this.initialize(),this._register(this.fileService.registerProvider(U,this._register(new ie)))}_copyFromTemplates=new Y;get copyFromTemplates(){return this._copyFromTemplates}templatePromise;template=null;defaultName;defaultIcon;_copyFrom;get copyFrom(){return this._copyFrom}set copyFrom(e){this._copyFrom!==e&&(this._copyFrom=e,this._onDidChange.fire({copyFrom:!0}),this.flags=void 0,this.copyFlags=this.getCopyFlagsFrom(e),e instanceof P&&(this.templatePromise?.cancel(),this.templatePromise=void 0),this.initialize())}_copyFlags;get copyFlags(){return this._copyFlags}set copyFlags(e){x(this._copyFlags,e)||(this._copyFlags=e,this._onDidChange.fire({copyFlags:!0}))}_previewProfile;get previewProfile(){return this._previewProfile}set previewProfile(e){this._previewProfile!==e&&(this._previewProfile=e,this._onDidChange.fire({preview:!0}))}getCopyFlagsFrom(e){return e?{settings:!0,keybindings:!0,snippets:!0,tasks:!0,extensions:!0}:void 0}async initialize(){this.disabled=!0;try{if(this.copyFrom instanceof P){await this.resolveTemplate(this.copyFrom),this.template&&(this.copyFromTemplates.set(this.copyFrom,this.template.name),this.defaultName===this.name&&(this.name=this.defaultName=this.template.name??""),this.defaultIcon===this.icon&&(this.icon=this.defaultIcon=this.template.icon),this.setCopyFlag(r.Settings,!!this.template.settings),this.setCopyFlag(r.Keybindings,!!this.template.keybindings),this.setCopyFlag(r.Tasks,!!this.template.tasks),this.setCopyFlag(r.Snippets,!!this.template.snippets),this.setCopyFlag(r.Extensions,!!this.template.extensions),this._onDidChange.fire({copyFromInfo:!0}));return}if(C(this.copyFrom)){this.defaultName===this.name&&(this.name=this.defaultName=a("copy from","{0} (Copy)",this.copyFrom.name)),this.defaultIcon===this.icon&&(this.icon=this.defaultIcon=this.copyFrom.icon),this.setCopyFlag(r.Settings,!0),this.setCopyFlag(r.Keybindings,!0),this.setCopyFlag(r.Tasks,!0),this.setCopyFlag(r.Snippets,!0),this.setCopyFlag(r.Extensions,!0),this._onDidChange.fire({copyFromInfo:!0});return}this.defaultName===this.name&&(this.name=this.defaultName=a("untitled","Untitled")),this.defaultIcon===this.icon&&(this.icon=this.defaultIcon=void 0),this.setCopyFlag(r.Settings,!1),this.setCopyFlag(r.Keybindings,!1),this.setCopyFlag(r.Tasks,!1),this.setCopyFlag(r.Snippets,!1),this.setCopyFlag(r.Extensions,!1),this._onDidChange.fire({copyFromInfo:!0})}finally{this.disabled=!1}}async resolveTemplate(e){return this.templatePromise||(this.templatePromise=G(async i=>{const t=await this.userDataProfileImportExportService.resolveProfileTemplate(e);i.isCancellationRequested||(this.template=t)})),await this.templatePromise,this.template}hasResource(e){if(this.template)switch(e){case r.Settings:return!!this.template.settings;case r.Keybindings:return!!this.template.keybindings;case r.Snippets:return!!this.template.snippets;case r.Tasks:return!!this.template.tasks;case r.Extensions:return!!this.template.extensions}return!0}getCopyFlag(e){return this.copyFlags?.[e]??!1}setCopyFlag(e,i){const t=this.copyFlags?{...this.copyFlags}:{};t[e]=i,this.copyFlags=t}getCopyFromName(){if(C(this.copyFrom))return this.copyFrom.name;if(this.copyFrom instanceof P)return this.copyFromTemplates.get(this.copyFrom)}async getChildrenForResourceType(e){return this.getFlag(e)?this.getChildrenFromProfile(this.userDataProfilesService.defaultProfile,e):this.getCopyFlag(e)?this.copyFrom instanceof P?(await this.resolveTemplate(this.copyFrom),this.template?this.getChildrenFromProfileTemplate(this.template,e):[]):this.copyFrom?this.getChildrenFromProfile(this.copyFrom,e):[]:[]}async getChildrenFromProfileTemplate(e,i){const t=K(O(),this.name,P.file("/root").with({scheme:U}),P.file("/cache").with({scheme:U}));switch(i){case r.Settings:return e.settings?(await this.instantiationService.createInstance(pe).apply(e.settings,t),this.getChildrenFromProfile(t,i)):[];case r.Keybindings:return e.keybindings?(await this.instantiationService.createInstance(de).apply(e.keybindings,t),this.getChildrenFromProfile(t,i)):[];case r.Snippets:return e.snippets?(await this.instantiationService.createInstance(ue).apply(e.snippets,t),this.getChildrenFromProfile(t,i)):[];case r.Tasks:return e.tasks?(await this.instantiationService.createInstance(ge).apply(e.tasks,t),this.getChildrenFromProfile(t,i)):[];case r.Extensions:return e.extensions?(await this.instantiationService.createInstance(ce,e.extensions).getChildren()).map(o=>this.toUserDataProfileResourceChildElement(o)):[]}return[]}shouldValidateName(){return!this.copyFrom}getInitialName(){return this.previewProfile?.name??""}async doSave(){if(this.previewProfile){const e=await this.saveProfile(this.previewProfile);e&&(this.previewProfile=e)}}};D=F([n(4,ee),n(5,L),n(6,T),n(7,_),n(8,R),n(9,b)],D);let w=class extends ne{constructor(e,i,t,s,o,p,c,h,f,l){super();this.userDataProfileService=e;this.userDataProfilesService=i;this.userDataProfileManagementService=t;this.userDataProfileImportExportService=s;this.dialogService=o;this.telemetryService=p;this.hostService=c;this.productService=h;this.openerService=f;this.instantiationService=l;for(const d of i.profiles)d.isTransient||this._profiles.push(this.createProfileElement(d));this._register(W(()=>this._profiles.splice(0,this._profiles.length).map(([,d])=>d.dispose()))),this._register(i.onDidChangeProfiles(d=>this.onDidChangeProfiles(d)))}static INSTANCE;static getInstance(e){return w.INSTANCE||(w.INSTANCE=e.createInstance(w)),w.INSTANCE}_profiles=[];get profiles(){return this._profiles.map(([e])=>e).sort((e,i)=>e instanceof D?1:i instanceof D||e instanceof I&&e.profile.isDefault?-1:i instanceof I&&i.profile.isDefault?1:e.name.localeCompare(i.name))}newProfileElement;_onDidChange=this._register(new k);onDidChange=this._onDidChange.event;templates;onDidChangeProfiles(e){let i=!1;for(const t of e.added)!t.isTransient&&t.name!==this.newProfileElement?.name&&(i=!0,this._profiles.push(this.createProfileElement(t)));for(const t of e.removed){t.id===this.newProfileElement?.previewProfile?.id&&(this.newProfileElement.previewProfile=void 0);const s=this._profiles.findIndex(([o])=>o instanceof I&&o.profile.id===t.id);s!==-1&&(i=!0,this._profiles.splice(s,1).map(([,o])=>o.dispose()))}i&&this._onDidChange.fire(void 0)}getTemplates(){return this.templates||(this.templates=this.userDataProfileManagementService.getBuiltinProfileTemplates()),this.templates}createProfileElement(e){const i=new A,t=i.add(new m("userDataProfile.activate",a("active","Use this Profile for Current Window"),y.asClassName(v.check),!0,()=>this.userDataProfileManagementService.switchProfile(l.profile))),s=i.add(new m("userDataProfile.copyFromProfile",a("copyFromProfile","Duplicate..."),y.asClassName(v.copy),!0,()=>this.createNewProfile(l.profile))),o=i.add(new m("userDataProfile.export",a("export","Export..."),y.asClassName(v.export),!0,()=>this.userDataProfileImportExportService.exportProfile(e))),p=i.add(new m("userDataProfile.delete",a("delete","Delete"),y.asClassName(v.trash),!0,()=>this.removeProfile(l.profile))),c=i.add(new m("userDataProfile.newWindow",a("open new window","Open New Window with this Profile"),y.asClassName(v.emptyWindow),!0,()=>this.openWindow(l.profile))),h=[];h.push(t),h.push(c);const f=[];f.push(s),f.push(o),e.isDefault||(f.push(new H),f.push(p));const l=i.add(this.instantiationService.createInstance(I,e,[[],[]],[h,f]));return t.enabled=this.userDataProfileService.currentProfile.id!==l.profile.id,i.add(this.userDataProfileService.onDidChangeCurrentProfile(()=>t.enabled=this.userDataProfileService.currentProfile.id!==l.profile.id)),[l,i]}async createNewProfile(e){if(this.newProfileElement){if(!(await this.dialogService.confirm({type:"info",message:a("new profile exists","A new profile is already being created. Do you want to discard it and create a new one?"),primaryButton:a("discard","Discard & Create"),cancelButton:a("cancel","Cancel")})).confirmed)return;this.revert()}if(e instanceof P)try{await this.userDataProfileImportExportService.resolveProfileTemplate(e)}catch(i){this.dialogService.error(Q(i));return}if(!this.newProfileElement){const i=new A,t=new J;i.add(W(()=>t.dispose(!0)));const s=[],o=[],p=i.add(new m("userDataProfile.create",a("create","Create"),void 0,!0,()=>this.saveNewProfile(!1,t.token)));s.push(p),M&&e instanceof P&&ye(e)&&s.push(new m("userDataProfile.createInDesktop",a("import in desktop","Create in {0}",this.productService.nameLong),void 0,!0,()=>this.openerService.open(e,{openExternal:!0})));const c=i.add(new m("userDataProfile.cancel",a("cancel","Cancel"),y.asClassName(v.trash),!0,()=>this.discardNewProfile()));o.push(c);const h=i.add(new m("userDataProfile.preview",a("preview","Preview"),y.asClassName(v.openPreview),!0,()=>this.previewNewProfile(t.token)));M||o.push(h);const f=i.add(new m("userDataProfile.export",a("export","Export..."),y.asClassName(v.export),C(e),()=>this.exportNewProfile(t.token)));this.newProfileElement=i.add(this.instantiationService.createInstance(D,e?"":a("untitled","Untitled"),e,[s,o],[[c],[f]]));const l=()=>{p.enabled&&(this.newProfileElement?.copyFrom&&this.userDataProfilesService.profiles.some(d=>d.name===this.newProfileElement?.name)?p.label=a("replace","Replace"):p.label=a("create","Create"))};l(),i.add(this.newProfileElement.onDidChange(d=>{d.preview&&(h.checked=!!this.newProfileElement?.previewProfile),(d.disabled||d.message)&&(h.enabled=p.enabled=!this.newProfileElement?.disabled&&!this.newProfileElement?.message),(d.name||d.copyFrom)&&(l(),f.enabled=C(this.newProfileElement?.copyFrom))})),i.add(this.userDataProfilesService.onDidChangeProfiles(d=>{l(),this.newProfileElement?.validate()})),this._profiles.push([this.newProfileElement,i]),this._onDidChange.fire(this.newProfileElement)}return this.newProfileElement}revert(){this.removeNewProfile(),this._onDidChange.fire(void 0)}removeNewProfile(){if(this.newProfileElement){const e=this._profiles.findIndex(([i])=>i===this.newProfileElement);e!==-1&&this._profiles.splice(e,1).map(([,i])=>i.dispose()),this.newProfileElement=void 0}}async previewNewProfile(e){if(!this.newProfileElement||this.newProfileElement.previewProfile)return;const i=await this.saveNewProfile(!0,e);i&&(this.newProfileElement.previewProfile=i,await this.openWindow(i))}async exportNewProfile(e){if(!this.newProfileElement||!C(this.newProfileElement.copyFrom))return;const i=K(O(),this.newProfileElement.name,this.newProfileElement.copyFrom.location,this.newProfileElement.copyFrom.cacheHome,{icon:this.newProfileElement.icon,useDefaultFlags:this.newProfileElement.flags},this.userDataProfilesService.defaultProfile);await this.userDataProfileImportExportService.exportProfile(i,this.newProfileElement.copyFlags)}async saveNewProfile(e,i){if(!this.newProfileElement||(this.newProfileElement.validate(),this.newProfileElement.message))return;this.newProfileElement.disabled=!0;let t;try{if(this.newProfileElement.previewProfile)e||(t=await this.userDataProfileManagementService.updateProfile(this.newProfileElement.previewProfile,{transient:!1}));else{const{flags:s,icon:o,name:p,copyFrom:c}=this.newProfileElement,h=s?s.settings&&s.keybindings&&s.tasks&&s.globalState&&s.extensions?void 0:s:void 0,f={source:c instanceof P?"template":C(c)?"profile":c?"external":void 0};if(c instanceof P){const l=await this.newProfileElement.resolveTemplate(c);l&&(this.telemetryService.publicLog2("userDataProfile.createFromTemplate",f),t=await this.userDataProfileImportExportService.createProfileFromTemplate(l,{name:p,useDefaultFlags:h,icon:o,resourceTypeFlags:this.newProfileElement.copyFlags,transient:e},i??N.None))}else C(c)?(this.telemetryService.publicLog2("userDataProfile.createFromProfile",f),t=await this.userDataProfileImportExportService.createFromProfile(c,{name:p,useDefaultFlags:h,icon:o,resourceTypeFlags:this.newProfileElement.copyFlags,transient:e},i??N.None)):(this.telemetryService.publicLog2("userDataProfile.createEmptyProfile",f),t=await this.userDataProfileManagementService.createProfile(p,{useDefaultFlags:h,icon:o,transient:e}))}}finally{this.newProfileElement&&(this.newProfileElement.disabled=!1)}if(i?.isCancellationRequested){if(t)try{await this.userDataProfileManagementService.removeProfile(t)}catch{}return}if(t&&!t.isTransient&&this.newProfileElement){this.removeNewProfile();const s=this._profiles.find(([o])=>o.name===t.name);s?this._onDidChange.fire(s[0]):this.onDidChangeProfiles({added:[t],removed:[],updated:[],all:this.userDataProfilesService.profiles})}return t}async discardNewProfile(){this.newProfileElement&&(this.newProfileElement.previewProfile&&await this.userDataProfileManagementService.removeProfile(this.newProfileElement.previewProfile),this.removeNewProfile(),this._onDidChange.fire(void 0))}async removeProfile(e){(await this.dialogService.confirm({type:"info",message:a("deleteProfile","Are you sure you want to delete the profile '{0}'?",e.name),primaryButton:a("delete","Delete"),cancelButton:a("cancel","Cancel")})).confirmed&&await this.userDataProfileManagementService.removeProfile(e)}async openWindow(e){await this.hostService.openWindow({forceProfile:e.name})}};w=F([n(0,B),n(1,_),n(2,T),n(3,L),n(4,$),n(5,se),n(6,le),n(7,re),n(8,te),n(9,b)],w);export{S as AbstractUserDataProfileElement,D as NewProfileElement,I as UserDataProfileElement,w as UserDataProfilesEditorModel,mi as isProfileResourceChildElement,pi as isProfileResourceTypeElement};
