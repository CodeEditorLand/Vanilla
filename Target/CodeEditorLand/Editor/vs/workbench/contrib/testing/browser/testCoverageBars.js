var w=Object.defineProperty;var B=Object.getOwnPropertyDescriptor;var u=(t,o,e,r)=>{for(var i=r>1?void 0:r?B(o,e):o,n=t.length-1,s;n>=0;n--)(s=t[n])&&(i=(r?s(o,e,i):s(i))||i);return r&&i&&w(o,e,i),i},l=(t,o)=>(e,r)=>o(e,r,t);import{h as c}from"../../../../../vs/base/browser/dom.js";import{getDefaultHoverDelegate as R}from"../../../../../vs/base/browser/ui/hover/hoverDelegateFactory.js";import{MarkdownString as F}from"../../../../../vs/base/common/htmlContent.js";import{Lazy as _}from"../../../../../vs/base/common/lazy.js";import{Disposable as M,DisposableStore as k,toDisposable as D}from"../../../../../vs/base/common/lifecycle.js";import{autorun as E,observableValue as P}from"../../../../../vs/base/common/observable.js";import{isDefined as L}from"../../../../../vs/base/common/types.js";import"../../../../../vs/base/common/uri.js";import{localize as m}from"../../../../../vs/nls.js";import{IConfigurationService as y}from"../../../../../vs/platform/configuration/common/configuration.js";import{IHoverService as S}from"../../../../../vs/platform/hover/browser/hover.js";import{Registry as U}from"../../../../../vs/platform/registry/common/platform.js";import{ExplorerExtensions as A}from"../../../../../vs/workbench/contrib/files/browser/explorerFileContrib.js";import*as a from"../../../../../vs/workbench/contrib/testing/browser/codeCoverageDisplayUtils.js";import{getTestingConfiguration as I,observeTestingConfiguration as O,TestingConfigKeys as v}from"../../../../../vs/workbench/contrib/testing/common/configuration.js";import"../../../../../vs/workbench/contrib/testing/common/testCoverage.js";import{ITestCoverageService as z}from"../../../../../vs/workbench/contrib/testing/common/testCoverageService.js";let h=class extends M{constructor(e,r,i){super();this.options=e;this.configurationService=r;this.hoverService=i}_coverage;el=new _(()=>{if(this.options.compact){const e=c(".test-coverage-bars.compact",[c(".tpc@overall"),c(".bar@tpcBar")]);return this.attachHover(e.tpcBar,$),e}else{const e=c(".test-coverage-bars",[c(".tpc@overall"),c(".bar@statement"),c(".bar@function"),c(".bar@branch")]);return this.attachHover(e.statement,H),this.attachHover(e.function,T),this.attachHover(e.branch,x),e}});visibleStore=this._register(new k);customHovers=[];get visible(){return!!this._coverage}attachHover(e,r){this._register(this.hoverService.setupManagedHover(R("element"),e,()=>this._coverage&&r(this._coverage)))}setCoverageInfo(e){const r=this.visibleStore;if(!e){this._coverage&&(this._coverage=void 0,this.customHovers.forEach(i=>i.hide()),r.clear());return}if(!this._coverage){const i=this.el.value.root;r.add(D(()=>i.remove())),this.options.container.appendChild(i),r.add(this.configurationService.onDidChangeConfiguration(n=>{this._coverage&&(n.affectsConfiguration(v.CoveragePercent)||n.affectsConfiguration(v.CoverageBarThresholds))&&this.doRender(this._coverage)}))}this._coverage=e,this.doRender(e)}doRender(e){const r=this.el.value,i=this.options.compact?0:2,n=I(this.configurationService,v.CoverageBarThresholds),s=a.calculateDisplayedStat(e,I(this.configurationService,v.CoveragePercent));this.options.overall!==!1?r.overall.textContent=a.displayPercent(s,i):r.overall.style.display="none","tpcBar"in r?f(r.tpcBar,s,!1,n):(f(r.statement,a.percent(e.statement),e.statement.total===0,n),f(r.function,e.declaration&&a.percent(e.declaration),e.declaration?.total===0,n),f(r.branch,e.branch&&a.percent(e.branch),e.branch?.total===0,n))}};h=u([l(1,y),l(2,S)],h);const N=16,f=(t,o,e,r)=>{if(o===void 0){t.style.display="none";return}if(t.style.display="block",t.style.width=`${N}px`,t.style.setProperty("--test-bar-width",`${Math.floor(o*16)}px`),e){t.style.color="currentColor",t.style.opacity="0.5";return}t.style.color=a.getCoverageColor(o,r),t.style.opacity="1"},p=new Intl.NumberFormat,H=t=>m("statementCoverage","{0}/{1} statements covered ({2})",p.format(t.statement.covered),p.format(t.statement.total),a.displayPercent(a.percent(t.statement))),T=t=>t.declaration&&m("functionCoverage","{0}/{1} functions covered ({2})",p.format(t.declaration.covered),p.format(t.declaration.total),a.displayPercent(a.percent(t.declaration))),x=t=>t.branch&&m("branchCoverage","{0}/{1} branches covered ({2})",p.format(t.branch.covered),p.format(t.branch.total),a.displayPercent(a.percent(t.branch))),$=t=>{const o=[H(t),T(t),x(t)].filter(L).join(`

`);return{markdown:new F().appendText(o),markdownNotSupportedFallback:o}};let d=class extends h{resource=P(this,void 0);static hasRegistered=!1;static register(){this.hasRegistered||(this.hasRegistered=!0,U.as(A.FileContributionRegistry).register({create(o,e){return o.createInstance(d,{compact:!0,container:e})}}))}constructor(o,e,r,i){super(o,e,r);const n=O(e,v.ShowCoverageInExplorer);this._register(E(async s=>{let g;const b=i.selected.read(s);if(b&&n.read(s)){const C=this.resource.read(s);C&&(g=b.getComputedForUri(C))}this.setCoverageInfo(g)}))}setResource(o,e){this.resource.set(o,e)}setCoverageInfo(o){super.setCoverageInfo(o),this.options.container?.classList.toggle("explorer-item-with-test-coverage",this.visible)}};d=u([l(1,y),l(2,S),l(3,z)],d);export{d as ExplorerTestCoverageBars,h as ManagedTestCoverageBars};