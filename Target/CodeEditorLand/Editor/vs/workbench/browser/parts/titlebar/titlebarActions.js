import"../../../../../vs/base/common/actions.js";import{localize as i,localize2 as f}from"../../../../../vs/nls.js";import{Action2 as T,MenuId as c,registerAction2 as u}from"../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as I}from"../../../../../vs/platform/configuration/common/configuration.js";import{ContextKeyExpr as o,IContextKeyService as E}from"../../../../../vs/platform/contextkey/common/contextkey.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";import{IStorageService as L,StorageScope as p,StorageTarget as h}from"../../../../../vs/platform/storage/common/storage.js";import{CustomTitleBarVisibility as n,TitleBarSetting as r,TitlebarStyle as A}from"../../../../../vs/platform/window/common/window.js";import{ACCOUNTS_ACTIVITY_ID as y,GLOBAL_ACTIVITY_ID as b}from"../../../../../vs/workbench/common/activity.js";import{IsAuxiliaryWindowFocusedContext as w,IsMainWindowFullscreenContext as C,TitleBarStyleContext as _,TitleBarVisibleContext as m}from"../../../../../vs/workbench/common/contextkeys.js";import{LayoutSettings as V}from"../../../../../vs/workbench/services/layout/browser/layoutService.js";class v extends T{constructor(s,t,a,d,B){const S=B?w.toNegated():o.true();super({id:`toggle.${s}`,title:t,metadata:a?{description:a}:void 0,toggled:o.equals(`config.${s}`,!0),menu:[{id:c.TitleBarContext,when:S,order:d,group:"2_config"},{id:c.TitleBarTitleContext,when:S,order:d,group:"2_config"}]});this.section=s}run(s,...t){const a=s.get(I),d=a.getValue(this.section);a.updateValue(this.section,!d)}}u(class extends v{constructor(){super(V.COMMAND_CENTER,i("toggle.commandCenter","Command Center"),i("toggle.commandCenterDescription","Toggle visibility of the Command Center in title bar"),1,!1)}}),u(class extends v{constructor(){super("workbench.layoutControl.enabled",i("toggle.layout","Layout Controls"),i("toggle.layoutDescription","Toggle visibility of the Layout Controls in title bar"),2,!0)}}),u(class extends T{constructor(){super({id:`toggle.${r.CUSTOM_TITLE_BAR_VISIBILITY}`,title:i("toggle.hideCustomTitleBar","Hide Custom Title Bar"),menu:[{id:c.TitleBarContext,order:0,when:o.equals(_.key,A.NATIVE),group:"3_toggle"},{id:c.TitleBarTitleContext,order:0,when:o.equals(_.key,A.NATIVE),group:"3_toggle"}]})}run(e,...s){e.get(I).updateValue(r.CUSTOM_TITLE_BAR_VISIBILITY,n.NEVER)}}),u(class extends T{constructor(){super({id:`toggle.${r.CUSTOM_TITLE_BAR_VISIBILITY}.windowed`,title:i("toggle.hideCustomTitleBarInFullScreen","Hide Custom Title Bar In Full Screen"),menu:[{id:c.TitleBarContext,order:1,when:C,group:"3_toggle"},{id:c.TitleBarTitleContext,order:1,when:C,group:"3_toggle"}]})}run(e,...s){e.get(I).updateValue(r.CUSTOM_TITLE_BAR_VISIBILITY,n.WINDOWED)}});class x extends T{constructor(){super({id:"toggle.toggleCustomTitleBar",title:i("toggle.customTitleBar","Custom Title Bar"),toggled:m,menu:[{id:c.MenubarAppearanceMenu,order:6,when:o.or(o.and(o.equals(_.key,A.NATIVE),o.and(o.equals("config.workbench.layoutControl.enabled",!1),o.equals("config.window.commandCenter",!1),o.notEquals("config.workbench.editor.editorActionsLocation","titleBar"),o.notEquals("config.workbench.activityBar.location","top"),o.notEquals("config.workbench.activityBar.location","bottom"))?.negate()),C),group:"2_workbench_layout"}]})}run(e,...s){const t=e.get(I),a=e.get(E);switch(t.getValue(r.CUSTOM_TITLE_BAR_VISIBILITY)){case n.NEVER:t.updateValue(r.CUSTOM_TITLE_BAR_VISIBILITY,n.AUTO);break;case n.WINDOWED:{C.evaluate(a.getContext(null))?t.updateValue(r.CUSTOM_TITLE_BAR_VISIBILITY,n.AUTO):t.updateValue(r.CUSTOM_TITLE_BAR_VISIBILITY,n.NEVER);break}case n.AUTO:default:t.updateValue(r.CUSTOM_TITLE_BAR_VISIBILITY,n.NEVER);break}}}u(x),u(class extends T{constructor(){super({id:"showCustomTitleBar",title:f("showCustomTitleBar","Show Custom Title Bar"),precondition:m.negate(),f1:!0})}run(e,...s){e.get(I).updateValue(r.CUSTOM_TITLE_BAR_VISIBILITY,n.AUTO)}}),u(class extends T{constructor(){super({id:"hideCustomTitleBar",title:f("hideCustomTitleBar","Hide Custom Title Bar"),precondition:m,f1:!0})}run(e,...s){e.get(I).updateValue(r.CUSTOM_TITLE_BAR_VISIBILITY,n.NEVER)}}),u(class extends T{constructor(){super({id:"hideCustomTitleBarInFullScreen",title:f("hideCustomTitleBarInFullScreen","Hide Custom Title Bar In Full Screen"),precondition:o.and(m,C),f1:!0})}run(e,...s){e.get(I).updateValue(r.CUSTOM_TITLE_BAR_VISIBILITY,n.WINDOWED)}}),u(class l extends T{static settingsID="workbench.editor.editorActionsLocation";constructor(){const e=o.and(o.equals("config.workbench.editor.showTabs","none").negate(),o.equals(`config.${l.settingsID}`,"default"))?.negate();super({id:`toggle.${l.settingsID}`,title:i("toggle.editorActions","Editor Actions"),toggled:o.equals(`config.${l.settingsID}`,"hidden").negate(),menu:[{id:c.TitleBarContext,order:3,when:e,group:"2_config"},{id:c.TitleBarTitleContext,order:3,when:e,group:"2_config"}]})}run(e,...s){const t=e.get(I),a=e.get(L),d=t.getValue(l.settingsID);if(d==="hidden"){if(t.getValue(V.EDITOR_TABS_MODE)!=="none")t.updateValue(l.settingsID,"titleBar");else{const S=a.get(l.settingsID,p.PROFILE);t.updateValue(l.settingsID,S??"default")}a.remove(l.settingsID,p.PROFILE)}else t.updateValue(l.settingsID,"hidden"),a.store(l.settingsID,d,p.PROFILE,h.USER)}});const Z={id:y,label:i("accounts","Accounts"),tooltip:i("accounts","Accounts"),class:void 0,enabled:!0,run:function(){}},ee={id:b,label:i("manage","Manage"),tooltip:i("manage","Manage"),class:void 0,enabled:!0,run:function(){}};export{Z as ACCOUNTS_ACTIVITY_TILE_ACTION,ee as GLOBAL_ACTIVITY_TITLE_ACTION};
