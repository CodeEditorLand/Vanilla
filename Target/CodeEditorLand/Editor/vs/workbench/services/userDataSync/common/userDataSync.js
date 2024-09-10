import{createDecorator as s}from"../../../../platform/instantiation/common/instantiation.js";import{SyncStatus as r,SyncResource as o}from"../../../../platform/userDataSync/common/userDataSync.js";import"../../../../base/common/event.js";import{ContextKeyExpr as a,RawContextKey as t}from"../../../../platform/contextkey/common/contextkey.js";import{localize as e,localize2 as i}from"../../../../nls.js";import"../../../../base/common/uri.js";import{Codicon as l}from"../../../../base/common/codicons.js";import{registerIcon as S}from"../../../../platform/theme/common/iconRegistry.js";import"../../../common/views.js";import{Categories as y}from"../../../../platform/action/common/actionCommonCategories.js";import"../../../../platform/actions/common/actions.js";import"../../../../platform/action/common/action.js";const k=s("IUserDataSyncWorkbenchService");function L(c){switch(c){case o.Settings:return e("settings","Settings");case o.Keybindings:return e("keybindings","Keyboard Shortcuts");case o.Snippets:return e("snippets","Snippets");case o.Tasks:return e("tasks","Tasks");case o.Extensions:return e("extensions","Extensions");case o.GlobalState:return e("ui state label","UI State");case o.Profiles:return e("profiles","Profiles");case o.WorkspaceState:return e("workspace state label","Workspace State")}}var u=(n=>(n.Unavailable="unavailable",n.Available="available",n))(u||{});const V=i("sync category","Settings Sync"),W=S("settings-sync-view-icon",l.sync,e("syncViewIcon","View icon of the Settings Sync view.")),d=new t("syncStatus",r.Uninitialized),Y=new t("syncEnabled",!1),p=new t("userDataSyncAccountStatus","unavailable"),z=new t("enableSyncActivityViews",!1),X=new t("enableSyncConflictsView",!1),M=new t("hasConflicts",!1),B="workbench.userDataSync.actions.configure",F="workbench.userDataSync.actions.showLog",K="workbench.view.sync",G="workbench.views.sync.conflicts",q={id:"workbench.userDataSync.actions.downloadSyncActivity",title:i("download sync activity title","Download Settings Sync Activity"),category:y.Developer,f1:!0,precondition:a.and(p.isEqualTo("available"),d.notEqualsTo(r.Uninitialized))};export{u as AccountStatus,B as CONFIGURE_SYNC_COMMAND_ID,p as CONTEXT_ACCOUNT_STATE,z as CONTEXT_ENABLE_ACTIVITY_VIEWS,X as CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW,M as CONTEXT_HAS_CONFLICTS,Y as CONTEXT_SYNC_ENABLEMENT,d as CONTEXT_SYNC_STATE,q as DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR,k as IUserDataSyncWorkbenchService,F as SHOW_SYNC_LOG_COMMAND_ID,G as SYNC_CONFLICTS_VIEW_ID,V as SYNC_TITLE,K as SYNC_VIEW_CONTAINER_ID,W as SYNC_VIEW_ICON,L as getSyncAreaLabel};
