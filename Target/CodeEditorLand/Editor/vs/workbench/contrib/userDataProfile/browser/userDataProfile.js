var z=Object.defineProperty;var K=Object.getOwnPropertyDescriptor;var T=(g,P,e,r)=>{for(var i=r>1?void 0:r?K(P,e):P,s=g.length-1,o;s>=0;s--)(o=g[s])&&(i=(r?o(P,e,i):o(i))||i);return r&&i&&z(P,e,i),i},n=(g,P)=>(e,r)=>P(e,r,g);import{Disposable as X,DisposableStore as I,MutableDisposable as q}from"../../../../base/common/lifecycle.js";import{isWeb as B}from"../../../../base/common/platform.js";import{URI as W}from"../../../../base/common/uri.js";import"../../../../editor/browser/editorExtensions.js";import{localize as f,localize2 as a}from"../../../../nls.js";import{Categories as _}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as p,MenuId as u,MenuRegistry as y,registerAction2 as d}from"../../../../platform/actions/common/actions.js";import{ContextKeyExpr as Q,IContextKeyService as $}from"../../../../platform/contextkey/common/contextkey.js";import{SyncDescriptor as Y}from"../../../../platform/instantiation/common/descriptors.js";import{IInstantiationService as M}from"../../../../platform/instantiation/common/instantiation.js";import{INotificationService as j}from"../../../../platform/notification/common/notification.js";import{IOpenerService as J}from"../../../../platform/opener/common/opener.js";import{IQuickInputService as k}from"../../../../platform/quickinput/common/quickInput.js";import{Registry as N}from"../../../../platform/registry/common/platform.js";import{ITelemetryService as V}from"../../../../platform/telemetry/common/telemetry.js";import{IURLService as Z}from"../../../../platform/url/common/url.js";import{IUserDataProfilesService as C}from"../../../../platform/userDataProfile/common/userDataProfile.js";import{IWorkspaceContextService as ee}from"../../../../platform/workspace/common/workspace.js";import{EditorPaneDescriptor as re}from"../../../browser/editor.js";import"../../../common/contributions.js";import{EditorExtensions as R}from"../../../common/editor.js";import{IEditorGroupsService as U}from"../../../services/editor/common/editorGroupsService.js";import{IBrowserWorkbenchEnvironmentService as ie}from"../../../services/environment/browser/environmentService.js";import{IHostService as O}from"../../../services/host/browser/host.js";import{ILifecycleService as te,LifecyclePhase as A}from"../../../services/lifecycle/common/lifecycle.js";import{CURRENT_PROFILE_CONTEXT as oe,HAS_PROFILES_CONTEXT as w,IS_CURRENT_PROFILE_TRANSIENT_CONTEXT as se,isProfileURL as ne,IUserDataProfileManagementService as L,IUserDataProfileService as F,PROFILES_CATEGORY as m,PROFILES_ENABLEMENT_CONTEXT as v,PROFILES_TITLE as ae}from"../../../services/userDataProfile/common/userDataProfile.js";import{IWorkspaceTagsService as ce}from"../../tags/common/workspaceTags.js";import"../common/userDataProfile.js";import{UserDataProfilesEditor as H,UserDataProfilesEditorInput as D,UserDataProfilesEditorInputSerializer as le}from"./userDataProfilesEditor.js";const b=new u("OpenProfile");let E=class extends X{constructor(e,r,i,s,o,l,t,S,h,c,fe,x){super();this.userDataProfileService=e;this.userDataProfilesService=r;this.userDataProfileManagementService=i;this.telemetryService=s;this.workspaceContextService=o;this.workspaceTagsService=l;this.editorGroupsService=S;this.instantiationService=h;this.lifecycleService=c;this.urlService=fe;this.currentProfileContext=oe.bindTo(t),v.bindTo(t).set(this.userDataProfilesService.isEnabled()),this.isCurrentProfileTransientContext=se.bindTo(t),this.currentProfileContext.set(this.userDataProfileService.currentProfile.id),this.isCurrentProfileTransientContext.set(!!this.userDataProfileService.currentProfile.isTransient),this._register(this.userDataProfileService.onDidChangeCurrentProfile(G=>{this.currentProfileContext.set(this.userDataProfileService.currentProfile.id),this.isCurrentProfileTransientContext.set(!!this.userDataProfileService.currentProfile.isTransient)})),this.hasProfilesContext=w.bindTo(t),this.hasProfilesContext.set(this.userDataProfilesService.profiles.length>1),this._register(this.userDataProfilesService.onDidChangeProfiles(G=>this.hasProfilesContext.set(this.userDataProfilesService.profiles.length>1))),this.registerEditor(),this.registerActions(),this._register(this.urlService.registerHandler(this)),B&&c.when(A.Eventually).then(()=>r.cleanUp()),this.reportWorkspaceProfileInfo(),x.options?.profileToPreview&&c.when(A.Restored).then(()=>this.handleURL(W.revive(x.options.profileToPreview)))}static ID="workbench.contrib.userDataProfiles";currentProfileContext;isCurrentProfileTransientContext;hasProfilesContext;async handleURL(e){if(ne(e)){const r=await this.openProfilesEditor();if(r)return r.createNewProfile(e),!0}return!1}async openProfilesEditor(){return await this.editorGroupsService.activeGroup.openEditor(new D(this.instantiationService))}registerEditor(){N.as(R.EditorPane).registerEditorPane(re.create(H,H.ID,f("userdataprofilesEditor","Profiles Editor")),[new Y(D)]),N.as(R.EditorFactory).registerEditorSerializer(D.ID,le)}registerActions(){this._register(this.registerManageProfilesAction()),this._register(this.registerSwitchProfileAction()),this.registerOpenProfileSubMenu(),this.registerNewWindowWithProfileAction(),this.registerProfilesActions(),this._register(this.userDataProfilesService.onDidChangeProfiles(()=>this.registerProfilesActions())),this._register(this.registerExportCurrentProfileAction()),this.registerCreateFromCurrentProfileAction(),this.registerNewProfileAction(),this.registerDeleteProfileAction(),this.registerHelpAction()}registerOpenProfileSubMenu(){y.appendMenuItem(u.MenubarFileMenu,{title:f("New Profile Window","New Window with Profile"),submenu:b,group:"1_new",order:4})}profilesDisposable=this._register(new q);registerProfilesActions(){this.profilesDisposable.value=new I;for(const e of this.userDataProfilesService.profiles)e.isTransient||this.profilesDisposable.value.add(this.registerNewWindowAction(e))}registerNewWindowWithProfileAction(){return d(class extends p{constructor(){super({id:"workbench.profiles.actions.newWindowWithProfile",title:a("newWindowWithProfile","New Window with Profile..."),category:m,precondition:w,f1:!0})}async run(r){const i=r.get(k),s=r.get(C),o=r.get(O),l=await i.pick(s.profiles.map(t=>({label:t.name,profile:t})),{title:f("new window with profile","New Window with Profile"),placeHolder:f("pick profile","Select Profile"),canPickMany:!1});if(l)return o.openWindow({remoteAuthority:null,forceProfile:l.profile.name})}})}registerNewWindowAction(e){const r=new I,i=`workbench.action.openProfile.${e.name.replace("/s+/","_")}`;return r.add(d(class extends p{constructor(){super({id:i,title:a("openShort","{0}",e.name),menu:{id:b,group:"0_profiles",when:w}})}run(o){return o.get(O).openWindow({remoteAuthority:null,forceProfile:e.name})}})),r.add(y.appendMenuItem(u.CommandPalette,{command:{id:i,category:m,title:a("open","Open {0} Profile",e.name),precondition:w}})),r}registerSwitchProfileAction(){const e=this;return d(class extends p{constructor(){super({id:"workbench.profiles.actions.switchProfile",title:a("switchProfile","Switch Profile..."),category:m,f1:!0,precondition:v})}async run(i){const s=i.get(k),o=[];for(const t of e.userDataProfilesService.profiles)o.push({id:t.id,label:t.id===e.userDataProfileService.currentProfile.id?`$(check) ${t.name}`:t.name,profile:t});const l=await s.pick(o.sort((t,S)=>t.profile.name.localeCompare(S.profile.name)),{placeHolder:f("selectProfile","Select Profile")});l&&await e.userDataProfileManagementService.switchProfile(l.profile)}})}registerManageProfilesAction(){const e=new I;return e.add(d(class extends p{constructor(){super({id:"workbench.profiles.actions.manageProfiles",title:{...a("manage profiles","Profiles"),mnemonicTitle:f({key:"miOpenProfiles",comment:["&& denotes a mnemonic"]},"&&Profiles")},menu:[{id:u.GlobalActivity,group:"2_configuration",order:1},{id:u.MenubarPreferencesMenu,group:"2_configuration",order:1}]})}run(i){const s=i.get(U),o=i.get(M);return s.activeGroup.openEditor(new D(o))}})),e.add(y.appendMenuItem(u.CommandPalette,{command:{id:"workbench.profiles.actions.manageProfiles",category:_.Preferences,title:a("open profiles","Open Profiles (UI)")}})),e}registerExportCurrentProfileAction(){const e=this,r=new I,i="workbench.profiles.actions.exportProfile";return r.add(d(class extends p{constructor(){super({id:i,title:a("export profile","Export Profile..."),category:m,f1:!0})}async run(){(await e.openProfilesEditor())?.selectProfile(e.userDataProfileService.currentProfile)}})),r.add(y.appendMenuItem(u.MenubarShare,{command:{id:i,title:a("export profile in share","Export Profile ({0})...",e.userDataProfileService.currentProfile.name),precondition:v}})),r}registerCreateFromCurrentProfileAction(){const e=this;this._register(d(class extends p{constructor(){super({id:"workbench.profiles.actions.createFromCurrentProfile",title:a("save profile as","Save Current Profile As..."),category:m,f1:!0,precondition:v})}async run(){(await e.openProfilesEditor())?.createNewProfile(e.userDataProfileService.currentProfile)}}))}registerNewProfileAction(){const e=this;this._register(d(class extends p{constructor(){super({id:"workbench.profiles.actions.createProfile",title:a("create profile","New Profile..."),category:m,precondition:v,f1:!0,menu:[{id:b,group:"1_manage_profiles",order:1}]})}async run(i){return(await e.openProfilesEditor())?.createNewProfile()}}))}registerDeleteProfileAction(){this._register(d(class extends p{constructor(){super({id:"workbench.profiles.actions.deleteProfile",title:a("delete profile","Delete Profile..."),category:m,f1:!0,precondition:Q.and(v,w)})}async run(r){const i=r.get(k),s=r.get(F),o=r.get(C),l=r.get(L),t=r.get(j),S=o.profiles.filter(h=>!h.isDefault&&!h.isTransient);if(S.length){const h=await i.pick(S.map(c=>({label:c.name,description:c.id===s.currentProfile.id?f("current","Current"):void 0,profile:c})),{title:f("delete specific profile","Delete Profile..."),placeHolder:f("pick profile to delete","Select Profiles to Delete"),canPickMany:!0});if(h)try{await Promise.all(h.map(c=>l.removeProfile(c.profile)))}catch(c){t.error(c)}}}}))}registerHelpAction(){this._register(d(class extends p{constructor(){super({id:"workbench.profiles.actions.help",title:ae,category:_.Help,menu:[{id:u.CommandPalette}]})}run(r){return r.get(J).open(W.parse("https://aka.ms/vscode-profiles-help"))}}))}async reportWorkspaceProfileInfo(){await this.lifecycleService.when(A.Eventually);const e=await this.workspaceTagsService.getTelemetryWorkspaceId(this.workspaceContextService.getWorkspace(),this.workspaceContextService.getWorkbenchState());this.telemetryService.publicLog2("workspaceProfileInfo",{workspaceId:e,defaultProfile:this.userDataProfileService.currentProfile.isDefault})}};E=T([n(0,F),n(1,C),n(2,L),n(3,V),n(4,ee),n(5,ce),n(6,$),n(7,U),n(8,M),n(9,te),n(10,Z),n(11,ie)],E);export{b as OpenProfileMenu,E as UserDataProfilesWorkbenchContribution};
