var y=Object.defineProperty;var u=Object.getOwnPropertyDescriptor;var l=(t,i,e,d)=>{for(var n=d>1?void 0:d?u(i,e):i,o=t.length-1,c;o>=0;o--)(c=t[o])&&(n=(d?c(i,e,n):c(n))||n);return d&&n&&y(i,e,n),n},m=(t,i)=>(e,d)=>i(e,d,t);import{HierarchicalKind as a}from"../../../../base/common/hierarchicalKind.js";import{Lazy as b}from"../../../../base/common/lazy.js";import{codeActionCommandId as v,fixAllCommandId as s,organizeImportsCommandId as f,refactorCommandId as A,sourceActionCommandId as p}from"./codeAction.js";import{CodeActionAutoApply as C,CodeActionCommandArgs as K,CodeActionKind as g}from"../common/types.js";import{IKeybindingService as k}from"../../../../platform/keybinding/common/keybinding.js";let r=class{constructor(i){this.keybindingService=i}static codeActionCommands=[A,v,p,f,s];getResolver(){const i=new b(()=>this.keybindingService.getKeybindings().filter(e=>r.codeActionCommands.indexOf(e.command)>=0).filter(e=>e.resolvedKeybinding).map(e=>{let d=e.commandArgs;return e.command===f?d={kind:g.SourceOrganizeImports.value}:e.command===s&&(d={kind:g.SourceFixAll.value}),{resolvedKeybinding:e.resolvedKeybinding,...K.fromUser(d,{kind:a.None,apply:C.Never})}}));return e=>{if(e.kind)return this.bestKeybindingForCodeAction(e,i.value)?.resolvedKeybinding}}bestKeybindingForCodeAction(i,e){if(!i.kind)return;const d=new a(i.kind);return e.filter(n=>n.kind.contains(d)).filter(n=>n.preferred?i.isPreferred:!0).reduceRight((n,o)=>n?n.kind.contains(o.kind)?o:n:o,void 0)}};r=l([m(0,k)],r);export{r as CodeActionKeybindingResolver};
