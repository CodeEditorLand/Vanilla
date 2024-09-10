import*as a from"../../../nls.js";import{Emitter as o}from"../../../base/common/event.js";import{Registry as t}from"../../../platform/registry/common/platform.js";import{Mimes as r}from"../../../base/common/mime.js";import{Extensions as g}from"../../../platform/configuration/common/configurationRegistry.js";const u={ModesRegistry:"editor.modesRegistry"};class l{_languages;_onDidChangeLanguages=new o;onDidChangeLanguages=this._onDidChangeLanguages.event;constructor(){this._languages=[]}registerLanguage(i){return this._languages.push(i),this._onDidChangeLanguages.fire(void 0),{dispose:()=>{for(let e=0,s=this._languages.length;e<s;e++)if(this._languages[e]===i){this._languages.splice(e,1);return}}}}getLanguages(){return this._languages}}const n=new l;t.add(u.ModesRegistry,n);const d="plaintext",p=".txt";n.registerLanguage({id:d,extensions:[p],aliases:[a.localize("plainText.alias","Plain Text"),"text"],mimetypes:[r.text]}),t.as(g.Configuration).registerDefaultConfigurations([{overrides:{"[plaintext]":{"editor.unicodeHighlight.ambiguousCharacters":!1,"editor.unicodeHighlight.invisibleCharacters":!1}}}]);export{l as EditorModesRegistry,u as Extensions,n as ModesRegistry,p as PLAINTEXT_EXTENSION,d as PLAINTEXT_LANGUAGE_ID};
