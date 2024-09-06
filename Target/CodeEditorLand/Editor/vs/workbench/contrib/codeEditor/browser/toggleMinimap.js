import{localize as t,localize2 as n}from"../../../../../vs/nls.js";import{Categories as m}from"../../../../../vs/platform/action/common/actionCommonCategories.js";import{Action2 as a,MenuId as c,registerAction2 as p}from"../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as s}from"../../../../../vs/platform/configuration/common/configuration.js";import{ContextKeyExpr as d}from"../../../../../vs/platform/contextkey/common/contextkey.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";class e extends a{static ID="editor.action.toggleMinimap";constructor(){super({id:e.ID,title:{...n("toggleMinimap","Toggle Minimap"),mnemonicTitle:t({key:"miMinimap",comment:["&& denotes a mnemonic"]},"&&Minimap")},category:m.View,f1:!0,toggled:d.equals("config.editor.minimap.enabled",!0),menu:{id:c.MenubarAppearanceMenu,group:"4_editor",order:1}})}async run(o){const i=o.get(s),r=!i.getValue("editor.minimap.enabled");return i.updateValue("editor.minimap.enabled",r)}}p(e);export{e as ToggleMinimapAction};
