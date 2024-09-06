var T=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var l=(m,o,e,c)=>{for(var i=c>1?void 0:c?_(o,e):o,s=m.length-1,a;s>=0;s--)(a=m[s])&&(i=(c?a(o,e,i):a(i))||i);return c&&i&&T(o,e,i),i},r=(m,o)=>(e,c)=>o(e,c,m);import"../../../../base/common/cancellation.js";import{matchesFuzzy as P}from"../../../../base/common/filters.js";import"../../../../base/common/lifecycle.js";import{isString as I}from"../../../../base/common/types.js";import{localize as h}from"../../../../nls.js";import{IConfigurationService as y}from"../../../../platform/configuration/common/configuration.js";import{IDialogService as C}from"../../../../platform/dialogs/common/dialogs.js";import{INotificationService as E}from"../../../../platform/notification/common/notification.js";import{PickerQuickAccessProvider as d,TriggerAction as g}from"../../../../platform/quickinput/browser/pickerQuickAccess.js";import{IQuickInputService as R}from"../../../../platform/quickinput/common/quickInput.js";import{IStorageService as Q}from"../../../../platform/storage/common/storage.js";import{IThemeService as b}from"../../../../platform/theme/common/themeService.js";import{IExtensionService as w}from"../../../services/extensions/common/extensions.js";import{ConfiguringTask as A,ContributedTask as L,CustomTask as x}from"../common/tasks.js";import{ITaskService as q}from"../common/taskService.js";import{TaskQuickPick as z}from"./taskQuickPick.js";let k=class extends d{constructor(e,c,i,s,a,v,n,p){super(k.PREFIX,{noResultsPick:{label:h("noTaskResults","No matching tasks")}});this._taskService=c;this._configurationService=i;this._quickInputService=s;this._notificationService=a;this._dialogService=v;this._themeService=n;this._storageService=p}static PREFIX="task ";async _getPicks(e,c,i){if(i.isCancellationRequested)return[];const s=new z(this._taskService,this._configurationService,this._quickInputService,this._notificationService,this._themeService,this._dialogService,this._storageService),a=await s.getTopLevelEntries(),v=[];for(const n of a.entries){const p=P(e,n.label);if(!p)continue;n.type==="separator"&&v.push(n);const t=n.task,u=n;u.highlights={label:p},u.trigger=S=>{if(S===1&&u.buttons?.length===2){const f=t&&!I(t)?t.getKey():void 0;return f&&this._taskService.removeRecentlyUsedTask(f),g.REFRESH_PICKER}else return L.is(t)?this._taskService.customize(t,void 0,!0):x.is(t)&&this._taskService.openConfig(t),g.CLOSE_PICKER},u.accept=async()=>{if(I(t)){const S=await s.show(h("TaskService.pickRunTask","Select the task to run"),void 0,t);S&&this._taskService.run(S,{attachProblemMatcher:!0})}else this._taskService.run(await this._toTask(t),{attachProblemMatcher:!0})},v.push(u)}return v}async _toTask(e){return A.is(e)?this._taskService.tryResolveTask(e):e}};k=l([r(0,w),r(1,q),r(2,y),r(3,R),r(4,E),r(5,C),r(6,b),r(7,Q)],k);export{k as TasksQuickAccessProvider};
