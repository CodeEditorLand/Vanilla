var a=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var u=(t,r,e,i)=>{for(var c=i>1?void 0:i?I(r,e):r,o=t.length-1,n;o>=0;o--)(n=t[o])&&(c=(i?n(r,e,c):n(c))||c);return i&&c&&a(r,e,c),c},p=(t,r)=>(e,i)=>r(e,i,t);import{DisposableStore as k}from"../../../../vs/base/common/lifecycle.js";import{localize as d}from"../../../../vs/nls.js";import{IKeybindingService as m}from"../../../../vs/platform/keybinding/common/keybinding.js";import{Extensions as f}from"../../../../vs/platform/quickinput/common/quickAccess.js";import{IQuickInputService as l}from"../../../../vs/platform/quickinput/common/quickInput.js";import{Registry as v}from"../../../../vs/platform/registry/common/platform.js";let s=class{constructor(r,e){this.quickInputService=r;this.keybindingService=e}static PREFIX="?";registry=v.as(f.Quickaccess);provide(r){const e=new k;return e.add(r.onDidAccept(()=>{const[i]=r.selectedItems;i&&this.quickInputService.quickAccess.show(i.prefix,{preserveValue:!0})})),e.add(r.onDidChangeValue(i=>{const c=this.registry.getQuickAccessProvider(i.substr(s.PREFIX.length));c&&c.prefix&&c.prefix!==s.PREFIX&&this.quickInputService.quickAccess.show(c.prefix,{preserveValue:!0})})),r.items=this.getQuickAccessProviders().filter(i=>i.prefix!==s.PREFIX),e}getQuickAccessProviders(){return this.registry.getQuickAccessProviders().sort((e,i)=>e.prefix.localeCompare(i.prefix)).flatMap(e=>this.createPicks(e))}createPicks(r){return r.helpEntries.map(e=>{const i=e.prefix||r.prefix,c=i||"\u2026";return{prefix:i,label:c,keybinding:e.commandId?this.keybindingService.lookupKeybinding(e.commandId):void 0,ariaLabel:d("helpPickAriaLabel","{0}, {1}",c,e.description),description:e.description}})}};s=u([p(0,l),p(1,m)],s);export{s as HelpQuickAccessProvider};
