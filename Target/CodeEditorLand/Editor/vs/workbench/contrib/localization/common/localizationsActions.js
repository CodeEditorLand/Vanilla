import{CancellationTokenSource as k}from"../../../../../vs/base/common/cancellation.js";import{DisposableStore as v}from"../../../../../vs/base/common/lifecycle.js";import{localize as i,localize2 as r}from"../../../../../vs/nls.js";import{Action2 as g,MenuId as d}from"../../../../../vs/platform/actions/common/actions.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";import{ILanguagePackService as b}from"../../../../../vs/platform/languagePacks/common/languagePacks.js";import{IQuickInputService as P}from"../../../../../vs/platform/quickinput/common/quickInput.js";import{IExtensionsWorkbenchService as y}from"../../../../../vs/workbench/contrib/extensions/common/extensions.js";import{ILocaleService as m}from"../../../../../vs/workbench/services/localization/common/locale.js";class p extends g{static ID="workbench.action.configureLocale";constructor(){super({id:p.ID,title:r("configureLocale","Configure Display Language"),menu:{id:d.CommandPalette},metadata:{description:r("configureLocaleDescription","Changes the locale of VS Code based on installed language packs. Common languages include French, Chinese, Spanish, Japanese, German, Korean, and more.")}})}async run(t){const o=t.get(b),I=t.get(P),f=t.get(m),L=t.get(y),c=await o.getInstalledLanguages(),n=new v,e=n.add(I.createQuickPick({useSeparators:!0}));if(e.matchOnDescription=!0,e.placeholder=i("chooseLocale","Select Display Language"),c?.length){const a=[{type:"separator",label:i("installed","Installed")}];e.items=a.concat(this.withMoreInfoButton(c))}const S=new k;n.add(e.onDispose(()=>{S.cancel(),n.dispose()}));const h=new Set(c?.map(a=>a.id)??[]);o.getAvailableLanguages().then(a=>{const l=a.filter(u=>u.id&&!h.has(u.id));l.length&&(e.items=[...e.items,{type:"separator",label:i("available","Available")},...this.withMoreInfoButton(l)]),e.busy=!1}),n.add(e.onDidAccept(async()=>{const a=e.activeItems[0];a&&(e.hide(),await f.setLocale(a))})),n.add(e.onDidTriggerItemButton(async a=>{e.hide(),a.item.extensionId&&await L.open(a.item.extensionId)})),e.show(),e.busy=!0}withMoreInfoButton(t){for(const o of t)o.extensionId&&(o.buttons=[{tooltip:i("moreInfo","More Info"),iconClass:"codicon-info"}]);return t}}class s extends g{static ID="workbench.action.clearLocalePreference";static LABEL=r("clearDisplayLanguage","Clear Display Language Preference");constructor(){super({id:s.ID,title:s.LABEL,menu:{id:d.CommandPalette}})}async run(t){await t.get(m).clearLocalePreference()}}export{s as ClearDisplayLanguageAction,p as ConfigureDisplayLanguageAction};
