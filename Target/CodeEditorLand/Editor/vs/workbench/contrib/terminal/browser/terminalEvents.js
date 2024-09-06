import{DynamicListEventMultiplexer as o,Event as d,EventMultiplexer as v}from"../../../../../vs/base/common/event.js";import{DisposableMap as C,DisposableStore as M}from"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/platform/terminal/common/capabilities/capabilities.js";import"../../../../../vs/workbench/contrib/terminal/browser/terminal.js";function h(t,l,p,n,c){const e=new M,s=e.add(new v),r=e.add(new C);function m(i,a){const T=s.add(d.map(c(a),y=>({instance:i,data:y})));r.set(a,T)}for(const i of t){const a=i.capabilities.get(n);a&&m(i,a)}const b=e.add(new o(t,l,p,i=>d.map(i.capabilities.onDidAddCapability,a=>({instance:i,changeEvent:a}))));e.add(b.event(i=>{i.changeEvent.id===n&&m(i.instance,i.changeEvent.capability)}));const I=e.add(new o(t,l,p,i=>i.capabilities.onDidRemoveCapability));return e.add(I.event(i=>{i.id===n&&r.deleteAndDispose(i.capability)})),{dispose:()=>e.dispose(),event:s.event}}export{h as createInstanceCapabilityEventMultiplexer};
