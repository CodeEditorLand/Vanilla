var H=Object.defineProperty;var Q=Object.getOwnPropertyDescriptor;var R=(c,n,r,t)=>{for(var i=t>1?void 0:t?Q(n,r):n,o=c.length-1,e;o>=0;o--)(e=c[o])&&(i=(t?e(n,r,i):e(i))||i);return t&&i&&H(n,r,i),i},F=(c,n)=>(r,t)=>n(r,t,c);import{ActionRunner as z}from"../../../../../vs/base/common/actions.js";import{firstOrDefault as D}from"../../../../../vs/base/common/arrays.js";import{hash as X}from"../../../../../vs/base/common/hash.js";import{KeyChord as Y,KeyCode as a,KeyMod as C}from"../../../../../vs/base/common/keyCodes.js";import{DisposableStore as $}from"../../../../../vs/base/common/lifecycle.js";import{localize as q,localize2 as p}from"../../../../../vs/nls.js";import{AccessibilitySignal as j,IAccessibilitySignalService as J}from"../../../../../vs/platform/accessibilitySignal/browser/accessibilitySignalService.js";import{MenuId as h,MenuRegistry as I}from"../../../../../vs/platform/actions/common/actions.js";import{CommandsRegistry as N}from"../../../../../vs/platform/commands/common/commands.js";import{ContextKeyExpr as b}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IInstantiationService as Z}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{KeybindingsRegistry as d,KeybindingWeight as l}from"../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{IListService as T,WorkbenchList as ii}from"../../../../../vs/platform/list/browser/listService.js";import{INotificationService as E,NotificationPriority as v,NotificationsFilter as y}from"../../../../../vs/platform/notification/common/notification.js";import{IQuickInputService as ti}from"../../../../../vs/platform/quickinput/common/quickInput.js";import{ITelemetryService as _}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{notificationToMetrics as k}from"../../../../../vs/workbench/browser/parts/notifications/notificationsTelemetry.js";import{NotificationFocusedContext as f,NotificationsCenterVisibleContext as L,NotificationsToastsVisibleContext as u}from"../../../../../vs/workbench/common/contextkeys.js";import{isNotificationViewItem as w}from"../../../../../vs/workbench/common/notifications.js";const x="notifications.showList",P="notifications.hideList",ei="notifications.toggleList",M="notifications.hideToasts",K="notifications.focusToasts",oi="notifications.focusNextToast",ni="notifications.focusPreviousToast",ri="notifications.focusFirstToast",ai="notifications.focusLastToast",ci="notification.collapse",si="notification.expand",W="notification.acceptPrimaryAction",di="notification.toggle",li="notification.clear",U="notifications.clearAll",G="notifications.toggleDoNotDisturbMode",V="notifications.toggleDoNotDisturbModeBySource";function A(c,n){if(w(n))return n;const r=c.lastFocusedList;if(r instanceof ii){let t=r.getFocusedElements()[0];if(w(t)||r.isDOMFocused()&&(t=r.element(0)),w(t))return t}}function Ui(c,n,r){d.registerCommandAndKeybindingRule({id:x,weight:l.WorkbenchContrib,primary:Y(C.CtrlCmd|a.KeyK,C.CtrlCmd|C.Shift|a.KeyN),handler:()=>{n.hide(),c.show()}}),d.registerCommandAndKeybindingRule({id:P,weight:l.WorkbenchContrib+50,when:L,primary:a.Escape,handler:i=>{const o=i.get(_);for(const e of r.notifications)e.visible&&o.publicLog2("notification:hide",k(e.message.original,e.sourceId,e.priority===v.SILENT));c.hide()}}),N.registerCommand(ei,()=>{c.isVisible?c.hide():(n.hide(),c.show())}),d.registerCommandAndKeybindingRule({id:li,weight:l.WorkbenchContrib,when:f,primary:a.Delete,mac:{primary:C.CtrlCmd|a.Backspace},handler:(i,o)=>{const e=i.get(J),g=A(i.get(T),o);g&&!g.hasProgress&&(g.close(),e.playSignal(j.clear))}}),d.registerCommandAndKeybindingRule({id:si,weight:l.WorkbenchContrib,when:f,primary:a.RightArrow,handler:(i,o)=>{A(i.get(T),o)?.expand()}}),d.registerCommandAndKeybindingRule({id:W,weight:l.WorkbenchContrib,when:b.or(f,u),primary:C.CtrlCmd|C.Shift|a.KeyA,handler:i=>{const o=i.get(Z).createInstance(S),e=A(i.get(T))||D(r.notifications);if(!e)return;const g=e.actions?.primary?D(e.actions.primary):void 0;g&&(o.run(g,e),e.close())}}),d.registerCommandAndKeybindingRule({id:ci,weight:l.WorkbenchContrib,when:f,primary:a.LeftArrow,handler:(i,o)=>{A(i.get(T),o)?.collapse()}}),d.registerCommandAndKeybindingRule({id:di,weight:l.WorkbenchContrib,when:f,primary:a.Space,secondary:[a.Enter],handler:i=>{A(i.get(T))?.toggle()}}),N.registerCommand(M,i=>{const o=i.get(_);for(const e of r.notifications)e.visible&&o.publicLog2("notification:hide",k(e.message.original,e.sourceId,e.priority===v.SILENT));n.hide()}),d.registerKeybindingRule({id:M,weight:l.WorkbenchContrib-50,when:u,primary:a.Escape}),d.registerKeybindingRule({id:M,weight:l.WorkbenchContrib+100,when:b.and(u,f),primary:a.Escape}),N.registerCommand(K,()=>n.focus()),d.registerCommandAndKeybindingRule({id:oi,weight:l.WorkbenchContrib,when:b.and(f,u),primary:a.DownArrow,handler:()=>{n.focusNext()}}),d.registerCommandAndKeybindingRule({id:ni,weight:l.WorkbenchContrib,when:b.and(f,u),primary:a.UpArrow,handler:()=>{n.focusPrevious()}}),d.registerCommandAndKeybindingRule({id:ri,weight:l.WorkbenchContrib,when:b.and(f,u),primary:a.PageUp,secondary:[a.Home],handler:()=>{n.focusFirst()}}),d.registerCommandAndKeybindingRule({id:ai,weight:l.WorkbenchContrib,when:b.and(f,u),primary:a.PageDown,secondary:[a.End],handler:()=>{n.focusLast()}}),N.registerCommand(U,()=>c.clearAll()),N.registerCommand(G,i=>{const o=i.get(E);o.setFilter(o.getFilter()===y.ERROR?y.OFF:y.ERROR)}),N.registerCommand(V,i=>{const o=i.get(E),e=i.get(ti),g=o.getFilters().sort((s,B)=>s.label.localeCompare(B.label)),O=new $,m=O.add(e.createQuickPick());m.items=g.map(s=>({id:s.id,label:s.label,tooltip:`${s.label} (${s.id})`,filter:s.filter})),m.canSelectMany=!0,m.placeholder=q("selectSources","Select sources to enable all notifications from"),m.selectedItems=m.items.filter(s=>s.filter===y.OFF),m.show(),O.add(m.onDidAccept(async()=>{for(const s of m.items)o.setFilter({id:s.id,label:s.label,filter:m.selectedItems.includes(s)?y.OFF:y.ERROR});m.hide()})),O.add(m.onDidHide(()=>O.dispose()))});const t=p("notifications","Notifications");I.appendMenuItem(h.CommandPalette,{command:{id:x,title:p("showNotifications","Show Notifications"),category:t}}),I.appendMenuItem(h.CommandPalette,{command:{id:P,title:p("hideNotifications","Hide Notifications"),category:t},when:L}),I.appendMenuItem(h.CommandPalette,{command:{id:U,title:p("clearAllNotifications","Clear All Notifications"),category:t}}),I.appendMenuItem(h.CommandPalette,{command:{id:W,title:p("acceptNotificationPrimaryAction","Accept Notification Primary Action"),category:t}}),I.appendMenuItem(h.CommandPalette,{command:{id:G,title:p("toggleDoNotDisturbMode","Toggle Do Not Disturb Mode"),category:t}}),I.appendMenuItem(h.CommandPalette,{command:{id:V,title:p("toggleDoNotDisturbModeBySource","Toggle Do Not Disturb Mode By Source..."),category:t}}),I.appendMenuItem(h.CommandPalette,{command:{id:K,title:p("focusNotificationToasts","Focus Notification Toast"),category:t},when:u})}let S=class extends z{constructor(r,t){super();this.telemetryService=r;this.notificationService=t}async runAction(r,t){this.telemetryService.publicLog2("workbenchActionExecuted",{id:r.id,from:"message"}),w(t)&&this.telemetryService.publicLog2("notification:actionExecuted",{id:X(t.message.original.toString()).toString(),actionLabel:r.label,source:t.sourceId||"core",silent:t.priority===v.SILENT});try{await super.runAction(r,t)}catch(i){this.notificationService.error(i)}}};S=R([F(0,_),F(1,E)],S);export{W as ACCEPT_PRIMARY_ACTION_NOTIFICATION,U as CLEAR_ALL_NOTIFICATIONS,li as CLEAR_NOTIFICATION,ci as COLLAPSE_NOTIFICATION,si as EXPAND_NOTIFICATION,P as HIDE_NOTIFICATIONS_CENTER,M as HIDE_NOTIFICATION_TOAST,S as NotificationActionRunner,x as SHOW_NOTIFICATIONS_CENTER,G as TOGGLE_DO_NOT_DISTURB_MODE,V as TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE,A as getNotificationFromContext,Ui as registerNotificationCommands};