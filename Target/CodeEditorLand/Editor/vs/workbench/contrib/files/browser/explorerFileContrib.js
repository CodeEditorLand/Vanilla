import{Emitter as n}from"../../../../base/common/event.js";import{Registry as s}from"../../../../platform/registry/common/platform.js";var p=(r=>(r.FileContributionRegistry="workbench.registry.explorer.fileContributions",r))(p||{});class l{_onDidRegisterDescriptor=new n;onDidRegisterDescriptor=this._onDidRegisterDescriptor.event;descriptors=[];register(r){this.descriptors.push(r),this._onDidRegisterDescriptor.fire(r)}create(r,i,t){return this.descriptors.map(o=>{const e=o.create(r,i);return t.add(e),e})}}const c=new l;s.add("workbench.registry.explorer.fileContributions",c);export{p as ExplorerExtensions,c as explorerFileContribRegistry};
