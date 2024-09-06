import{Codicon as d}from"../../../../base/common/codicons.js";import{Event as k}from"../../../../base/common/event.js";import{DisposableStore as P}from"../../../../base/common/lifecycle.js";import{ThemeIcon as f}from"../../../../base/common/themables.js";import*as s from"../../../../nls.js";import"../../../../platform/instantiation/common/instantiation.js";import{IQuickInputService as h}from"../../../../platform/quickinput/common/quickInput.js";import{ISnippetsService as v}from"./snippets.js";import{SnippetSource as a}from"./snippetsFile.js";async function T(S,l){const o=S.get(v),b=S.get(h);let r;Array.isArray(l)?r=l:r=await o.getSnippets(l,{includeDisabledSnippets:!0,includeNoPrefixSnippets:!0}),r.sort((t,p)=>t.snippetSource-p.snippetSource);const m=()=>{const t=[];let p;for(const i of r){const c={label:i.prefix||i.name,detail:i.description||i.body,snippet:i};if(!p||p.snippetSource!==i.snippetSource||p.source!==i.source){let n="";switch(i.snippetSource){case a.User:n=s.localize("sep.userSnippet","User Snippets");break;case a.Extension:n=i.source;break;case a.Workspace:n=s.localize("sep.workspaceSnippet","Workspace Snippets");break}t.push({type:"separator",label:n})}i.snippetSource===a.Extension&&(o.isEnabled(i)?c.buttons=[{iconClass:f.asClassName(d.eyeClosed),tooltip:s.localize("disableSnippet","Hide from IntelliSense")}]:(c.description=s.localize("isDisabled","(hidden from IntelliSense)"),c.buttons=[{iconClass:f.asClassName(d.eye),tooltip:s.localize("enable.snippet","Show in IntelliSense")}])),t.push(c),p=i}return t},u=new P,e=u.add(b.createQuickPick({useSeparators:!0}));e.placeholder=s.localize("pick.placeholder","Select a snippet"),e.matchOnDetail=!0,e.ignoreFocusOut=!1,e.keepScrollPosition=!0,u.add(e.onDidTriggerItemButton(t=>{const p=o.isEnabled(t.item.snippet);o.updateEnablement(t.item.snippet,!p),e.items=m()})),e.items=m(),e.items.length||(e.validationMessage=s.localize("pick.noSnippetAvailable","No snippet available")),e.show(),await Promise.race([k.toPromise(e.onDidAccept),k.toPromise(e.onDidHide)]);const I=e.selectedItems[0]?.snippet;return u.dispose(),I}export{T as pickSnippet};
