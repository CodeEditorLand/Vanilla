import"../../../../vs/base/common/cancellation.js";import"../../../../vs/base/common/event.js";import"../../../../vs/base/common/filters.js";import"../../../../vs/base/common/fuzzyScorer.js";import"../../../../vs/base/common/htmlContent.js";import"../../../../vs/base/common/keybindings.js";import"../../../../vs/base/common/lifecycle.js";import{Schemas as r}from"../../../../vs/base/common/network.js";import"../../../../vs/base/common/severity.js";import"../../../../vs/base/common/uri.js";import{createDecorator as a}from"../../../../vs/platform/instantiation/common/instantiation.js";import"../../../../vs/platform/quickinput/common/quickAccess.js";const w={ctrlCmd:!1,alt:!1};var c=(t=>(t[t.Blur=1]="Blur",t[t.Gesture=2]="Gesture",t[t.Other=3]="Other",t))(c||{}),u=(t=>(t.QuickPick="quickPick",t.InputBox="inputBox",t.QuickWidget="quickWidget",t))(u||{}),d=(i=>(i[i.NONE=0]="NONE",i[i.FIRST=1]="FIRST",i[i.SECOND=2]="SECOND",i[i.LAST=3]="LAST",i))(d||{}),s=(e=>(e[e.First=1]="First",e[e.Second=2]="Second",e[e.Last=3]="Last",e[e.Next=4]="Next",e[e.Previous=5]="Previous",e[e.NextPage=6]="NextPage",e[e.PreviousPage=7]="PreviousPage",e[e.NextSeparator=8]="NextSeparator",e[e.PreviousSeparator=9]="PreviousSeparator",e))(s||{}),l=(o=>(o[o.Title=1]="Title",o[o.Inline=2]="Inline",o))(l||{});class p{constructor(n){this.options=n}getItemLabel(n){return n.label}getItemDescription(n){if(!this.options?.skipDescription)return n.description}getItemPath(n){if(!this.options?.skipPath)return n.resource?.scheme===r.file?n.resource.fsPath:n.resource?.path}}const K=new p,N=a("quickInputService");export{N as IQuickInputService,d as ItemActivation,w as NO_KEY_MODS,l as QuickInputButtonLocation,c as QuickInputHideReason,u as QuickInputType,s as QuickPickFocus,p as QuickPickItemScorerAccessor,K as quickPickItemScorerAccessor};