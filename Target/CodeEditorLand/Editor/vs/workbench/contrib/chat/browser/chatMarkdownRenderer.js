var u=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var l=(d,i,e,t)=>{for(var r=t>1?void 0:t?m(i,e):i,o=d.length-1,n;o>=0;o--)(n=d[o])&&(r=(t?n(i,e,r):n(r))||r);return t&&r&&u(i,e,r),r},s=(d,i)=>(e,t)=>i(e,t,d);import"../../../../../vs/base/browser/markdownRenderer.js";import{getDefaultHoverDelegate as c}from"../../../../../vs/base/browser/ui/hover/hoverDelegateFactory.js";import"../../../../../vs/base/common/htmlContent.js";import{DisposableStore as v}from"../../../../../vs/base/common/lifecycle.js";import{MarkdownRenderer as I}from"../../../../../vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";import{ILanguageService as S}from"../../../../../vs/editor/common/languages/language.js";import{IHoverService as h}from"../../../../../vs/platform/hover/browser/hover.js";import{IOpenerService as f}from"../../../../../vs/platform/opener/common/opener.js";import{ITrustedDomainService as g}from"../../../../../vs/workbench/contrib/url/browser/trustedDomainService.js";const M=["b","blockquote","br","code","em","h1","h2","h3","h4","h5","h6","hr","i","li","ol","p","pre","strong","sub","sup","table","tbody","td","th","thead","tr","ul","a","img","span","div"];let a=class extends I{constructor(e,t,r,o,n){super(e??{},t,r);this.trustedDomainService=o;this.hoverService=n}render(e,t,r){t={...t,remoteImageIsAllowed:p=>this.trustedDomainService.isValid(p),sanitizerOptions:{replaceWithPlaintext:!0,allowedTags:M}};const o=e&&e.supportHtml?{...e,value:`<body>

${e.value}</body>`}:e,n=super.render(o,t,r);return this.attachCustomHover(n)}attachCustomHover(e){const t=new v;return e.element.querySelectorAll("a").forEach(r=>{if(r.title){const o=r.title;r.title="",t.add(this.hoverService.setupManagedHover(c("element"),r,o))}}),{element:e.element,dispose:()=>{e.dispose(),t.dispose()}}}};a=l([s(1,S),s(2,f),s(3,g),s(4,h)],a);export{a as ChatMarkdownRenderer};
