var H=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var y=(m,a,e,t)=>{for(var i=t>1?void 0:t?x(a,e):a,o=m.length-1,r;o>=0;o--)(r=m[o])&&(i=(t?r(a,e,i):r(i))||i);return t&&i&&H(a,e,i),i},c=(m,a)=>(e,t)=>a(e,t,m);import*as R from"../../../../base/browser/dom.js";import{Codicon as w}from"../../../../base/common/codicons.js";import{basename as S,isEqual as P}from"../../../../base/common/resources.js";import{URI as u}from"../../../../base/common/uri.js";import{localize as n}from"../../../../nls.js";import{Action2 as I,MenuId as g,registerAction2 as h}from"../../../../platform/actions/common/actions.js";import{IConfigurationService as k}from"../../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as l,IContextKeyService as N}from"../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as L}from"../../../../platform/contextview/browser/contextView.js";import{IHoverService as _}from"../../../../platform/hover/browser/hover.js";import{IInstantiationService as M}from"../../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as O}from"../../../../platform/keybinding/common/keybinding.js";import{INotificationService as W}from"../../../../platform/notification/common/notification.js";import{IOpenerService as $}from"../../../../platform/opener/common/opener.js";import{ITelemetryService as q}from"../../../../platform/telemetry/common/telemetry.js";import{IThemeService as K}from"../../../../platform/theme/common/themeService.js";import{IUserDataProfilesService as F,reviveProfile as Y}from"../../../../platform/userDataProfile/common/userDataProfile.js";import{Change as D,IUserDataSyncEnablementService as J,IUserDataSyncService as z,MergeState as B}from"../../../../platform/userDataSync/common/userDataSync.js";import{TreeViewPane as j}from"../../../browser/parts/views/treeView.js";import"../../../browser/parts/views/viewsViewlet.js";import{DEFAULT_EDITOR_ASSOCIATION as G}from"../../../common/editor.js";import{IViewDescriptorService as Q,TreeItemCollapsibleState as b}from"../../../common/views.js";import{IAccessibleViewInformationService as X}from"../../../services/accessibility/common/accessibleViewInformationService.js";import{IEditorService as Z}from"../../../services/editor/common/editorService.js";import{getSyncAreaLabel as ee,IUserDataSyncWorkbenchService as re,SYNC_CONFLICTS_VIEW_ID as C}from"../../../services/userDataSync/common/userDataSync.js";let d=class extends j{constructor(e,t,i,o,r,p,s,v,f,A,V,T,U,oe,te,ie,ce,E){super(e,i,o,r,p,s,v,f,A,V,T,U,E);this.editorService=t;this.userDataSyncService=oe;this.userDataSyncWorkbenchService=te;this.userDataSyncEnablementService=ie;this.userDataProfilesService=ce;this._register(this.userDataSyncService.onDidChangeConflicts(()=>this.treeView.refresh())),this.registerActions()}renderTreeView(e){super.renderTreeView(R.append(e,R.$("")));const t=this;this.treeView.message=n("explanation","Please go through each entry and merge to resolve conflicts."),this.treeView.dataProvider={getChildren(){return t.getTreeItems()}}}async getTreeItems(){const e=[],t=this.userDataSyncService.conflicts.map(o=>o.conflicts.map(r=>({...r,syncResource:o.syncResource,profile:o.profile}))).flat().sort((o,r)=>o.profile.id===r.profile.id?0:o.profile.isDefault?-1:r.profile.isDefault?1:o.profile.name.localeCompare(r.profile.name)),i=[];for(const o of t){let r=i[i.length-1]?.[0].id===o.profile.id?i[i.length-1][1]:void 0;r||i.push([o.profile,r=[]]),r.push(o)}for(const[o,r]of i){const p=[];for(const s of r){const v=JSON.stringify(s),f={handle:v,resourceUri:s.remoteResource,label:{label:S(s.remoteResource),strikethrough:s.mergeState===B.Accepted&&(s.localChange===D.Deleted||s.remoteChange===D.Deleted)},description:ee(s.syncResource),collapsibleState:b.None,command:{id:"workbench.actions.sync.openConflicts",title:"",arguments:[{$treeViewId:"",$treeItemHandle:v}]},contextValue:"sync-conflict-resource"};p.push(f)}e.push({handle:o.id,label:{label:o.name},collapsibleState:b.Expanded,children:p})}return i.length===1&&i[0][0].isDefault?e[0].children??[]:e}parseHandle(e){const t=JSON.parse(e);return{syncResource:t.syncResource,profile:Y(t.profile,this.userDataProfilesService.profilesHome.scheme),localResource:u.revive(t.localResource),remoteResource:u.revive(t.remoteResource),baseResource:u.revive(t.baseResource),previewResource:u.revive(t.previewResource),acceptedResource:u.revive(t.acceptedResource),localChange:t.localChange,remoteChange:t.remoteChange,mergeState:t.mergeState}}registerActions(){const e=this;this._register(h(class extends I{constructor(){super({id:"workbench.actions.sync.openConflicts",title:n({key:"workbench.actions.sync.openConflicts",comment:["This is an action title to show the conflicts between local and remote version of resources"]},"Show Conflicts")})}async run(i,o){const r=e.parseHandle(o.$treeItemHandle);return e.open(r)}})),this._register(h(class extends I{constructor(){super({id:"workbench.actions.sync.acceptRemote",title:n("workbench.actions.sync.acceptRemote","Accept Remote"),icon:w.cloudDownload,menu:{id:g.ViewItemContext,when:l.and(l.equals("view",C),l.equals("viewItem","sync-conflict-resource")),group:"inline",order:1}})}async run(i,o){const r=e.parseHandle(o.$treeItemHandle);await e.userDataSyncWorkbenchService.accept({syncResource:r.syncResource,profile:r.profile},r.remoteResource,void 0,e.userDataSyncEnablementService.isEnabled())}})),this._register(h(class extends I{constructor(){super({id:"workbench.actions.sync.acceptLocal",title:n("workbench.actions.sync.acceptLocal","Accept Local"),icon:w.cloudUpload,menu:{id:g.ViewItemContext,when:l.and(l.equals("view",C),l.equals("viewItem","sync-conflict-resource")),group:"inline",order:2}})}async run(i,o){const r=e.parseHandle(o.$treeItemHandle);await e.userDataSyncWorkbenchService.accept({syncResource:r.syncResource,profile:r.profile},r.localResource,void 0,e.userDataSyncEnablementService.isEnabled())}}))}async open(e){if(!this.userDataSyncService.conflicts.some(({conflicts:o})=>o.some(({localResource:r})=>P(r,e.localResource))))return;const t=n({key:"remoteResourceName",comment:["remote as in file in cloud"]},"{0} (Remote)",S(e.remoteResource)),i=n("localResourceName","{0} (Local)",S(e.remoteResource));await this.editorService.openEditor({input1:{resource:e.remoteResource,label:n("Theirs","Theirs"),description:t},input2:{resource:e.localResource,label:n("Yours","Yours"),description:i},base:{resource:e.baseResource},result:{resource:e.previewResource},options:{preserveFocus:!0,revealIfVisible:!0,pinned:!0,override:G.id}})}};d=y([c(1,Z),c(2,O),c(3,L),c(4,k),c(5,N),c(6,Q),c(7,M),c(8,$),c(9,K),c(10,q),c(11,W),c(12,_),c(13,z),c(14,re),c(15,J),c(16,F),c(17,X)],d);export{d as UserDataSyncConflictsViewPane};
