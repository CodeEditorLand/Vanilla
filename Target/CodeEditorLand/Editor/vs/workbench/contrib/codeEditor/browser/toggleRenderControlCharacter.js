import{localize as n,localize2 as i}from"../../../../../vs/nls.js";import{Categories as a}from"../../../../../vs/platform/action/common/actionCommonCategories.js";import{Action2 as c,MenuId as s,registerAction2 as l}from"../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as d}from"../../../../../vs/platform/configuration/common/configuration.js";import{ContextKeyExpr as m}from"../../../../../vs/platform/contextkey/common/contextkey.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";class e extends c{static ID="editor.action.toggleRenderControlCharacter";constructor(){super({id:e.ID,title:{...i("toggleRenderControlCharacters","Toggle Control Characters"),mnemonicTitle:n({key:"miToggleRenderControlCharacters",comment:["&& denotes a mnemonic"]},"Render &&Control Characters")},category:a.View,f1:!0,toggled:m.equals("config.editor.renderControlCharacters",!0),menu:{id:s.MenubarAppearanceMenu,group:"4_editor",order:5}})}run(o){const r=o.get(d),t=!r.getValue("editor.renderControlCharacters");return r.updateValue("editor.renderControlCharacters",t)}}l(e);export{e as ToggleRenderControlCharacterAction};