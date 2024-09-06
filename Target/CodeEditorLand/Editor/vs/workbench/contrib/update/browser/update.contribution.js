import"../../../../../vs/platform/update/common/update.config.contribution.js";import{mnemonicButtonLabel as N}from"../../../../../vs/base/common/labels.js";import{isWindows as k}from"../../../../../vs/base/common/platform.js";import{URI as g}from"../../../../../vs/base/common/uri.js";import{localize as c,localize2 as n}from"../../../../../vs/nls.js";import{Categories as x}from"../../../../../vs/platform/action/common/actionCommonCategories.js";import{Action2 as i,MenuId as f,registerAction2 as a}from"../../../../../vs/platform/actions/common/actions.js";import{ContextKeyExpr as y}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IsWebContext as U}from"../../../../../vs/platform/contextkey/common/contextkeys.js";import{IFileDialogService as D}from"../../../../../vs/platform/dialogs/common/dialogs.js";import{IInstantiationService as A}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IOpenerService as R}from"../../../../../vs/platform/opener/common/opener.js";import t from"../../../../../vs/platform/product/common/product.js";import{IProductService as S}from"../../../../../vs/platform/product/common/productService.js";import{Registry as E}from"../../../../../vs/platform/registry/common/platform.js";import{IUpdateService as l,StateType as d}from"../../../../../vs/platform/update/common/update.js";import{Extensions as T}from"../../../../../vs/workbench/common/contributions.js";import{CONTEXT_UPDATE_STATE as p,DOWNLOAD_URL as C,ProductContribution as F,RELEASE_NOTES_URL as b,showReleaseNotesInEditor as I,SwitchProductQualityContribution as P,UpdateContribution as W}from"../../../../../vs/workbench/contrib/update/browser/update.js";import{ShowCurrentReleaseNotesActionId as L,ShowCurrentReleaseNotesFromCurrentFileActionId as O}from"../../../../../vs/workbench/contrib/update/common/update.js";import{LifecyclePhase as h}from"../../../../../vs/workbench/services/lifecycle/common/lifecycle.js";const v=E.as(T.Workbench);v.registerWorkbenchContribution(F,h.Restored),v.registerWorkbenchContribution(W,h.Restored),v.registerWorkbenchContribution(P,h.Restored);class _ extends i{constructor(){super({id:L,title:{...n("showReleaseNotes","Show Release Notes"),mnemonicTitle:c({key:"mshowReleaseNotes",comment:["&& denotes a mnemonic"]},"Show &&Release Notes")},category:{value:t.nameShort,original:t.nameShort},f1:!0,precondition:b,menu:[{id:f.MenubarHelpMenu,group:"1_welcome",order:5,when:b}]})}async run(e){const o=e.get(A),r=e.get(S),m=e.get(R);try{await I(o,r.version,!1)}catch{if(r.releaseNotesUrl)await m.open(g.parse(r.releaseNotesUrl));else throw new Error(c("update.noReleaseNotesOnline","This version of {0} does not have release notes online",r.nameLong))}}}class q extends i{constructor(){super({id:O,title:{...n("showReleaseNotesCurrentFile","Open Current File as Release Notes"),mnemonicTitle:c({key:"mshowReleaseNotes",comment:["&& denotes a mnemonic"]},"Show &&Release Notes")},category:n("developerCategory","Developer"),f1:!0})}async run(e){const o=e.get(A),r=e.get(S);try{await I(o,r.version,!0)}catch{throw new Error(c("releaseNotesFromFileNone","Cannot open the current file as Release Notes"))}}}a(_),a(q);class M extends i{constructor(){super({id:"update.checkForUpdate",title:n("checkForUpdates","Check for Updates..."),category:{value:t.nameShort,original:t.nameShort},f1:!0,precondition:p.isEqualTo(d.Idle)})}async run(e){return e.get(l).checkForUpdates(!0)}}class B extends i{constructor(){super({id:"update.downloadUpdate",title:n("downloadUpdate","Download Update"),category:{value:t.nameShort,original:t.nameShort},f1:!0,precondition:p.isEqualTo(d.AvailableForDownload)})}async run(e){await e.get(l).downloadUpdate()}}class z extends i{constructor(){super({id:"update.installUpdate",title:n("installUpdate","Install Update"),category:{value:t.nameShort,original:t.nameShort},f1:!0,precondition:p.isEqualTo(d.Downloaded)})}async run(e){await e.get(l).applyUpdate()}}class H extends i{constructor(){super({id:"update.restartToUpdate",title:n("restartToUpdate","Restart to Update"),category:{value:t.nameShort,original:t.nameShort},f1:!0,precondition:p.isEqualTo(d.Ready)})}async run(e){await e.get(l).quitAndInstall()}}class w extends i{static ID="workbench.action.download";constructor(){super({id:w.ID,title:n("openDownloadPage","Download {0}",t.nameLong),precondition:y.and(U,C),f1:!0,menu:[{id:f.StatusBarWindowIndicatorMenu,when:y.and(U,C)}]})}run(e){const o=e.get(S),r=e.get(R);o.downloadUrl&&r.open(g.parse(o.downloadUrl))}}if(a(w),a(M),a(B),a(z),a(H),k){class s extends i{constructor(){super({id:"_update.applyupdate",title:n("applyUpdate","Apply Update..."),category:x.Developer,f1:!0,precondition:p.isEqualTo(d.Idle)})}async run(o){const r=o.get(l),u=await o.get(D).showOpenDialog({title:c("pickUpdate","Apply Update"),filters:[{name:"Setup",extensions:["exe"]}],canSelectFiles:!0,openLabel:N(c({key:"updateButton",comment:["&& denotes a mnemonic"]},"&&Update"))});!u||!u[0]||await r._applySpecificUpdate(u[0].fsPath)}}a(s)}export{M as CheckForUpdateAction,_ as ShowCurrentReleaseNotesAction,q as ShowCurrentReleaseNotesFromCurrentFileAction};