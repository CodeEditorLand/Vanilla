var S=Object.defineProperty;var b=Object.getOwnPropertyDescriptor;var C=(s,e,i,t)=>{for(var o=t>1?void 0:t?b(e,i):e,a=s.length-1,r;a>=0;a--)(r=s[a])&&(o=(t?r(e,i,o):r(o))||o);return t&&o&&S(e,i,o),o},g=(s,e)=>(i,t)=>e(i,t,s);import{Emitter as R,DebounceEmitter as N}from"../../../../base/common/event.js";import{IDecorationsService as $}from"../common/decorations.js";import{TernarySearchTree as I}from"../../../../base/common/ternarySearchTree.js";import{toDisposable as E,DisposableStore as y}from"../../../../base/common/lifecycle.js";import{isThenable as T}from"../../../../base/common/async.js";import{LinkedList as B}from"../../../../base/common/linkedList.js";import{createStyleSheet as P,createCSSRule as h,removeCSSRulesContainingSelector as D,asCSSPropertyValue as U}from"../../../../base/browser/dom.js";import{IThemeService as w}from"../../../../platform/theme/common/themeService.js";import{ThemeIcon as m}from"../../../../base/common/themables.js";import{isFalsyOrWhitespace as k}from"../../../../base/common/strings.js";import{localize as x}from"../../../../nls.js";import{isCancellationError as M}from"../../../../base/common/errors.js";import{CancellationTokenSource as O}from"../../../../base/common/cancellation.js";import{InstantiationType as L,registerSingleton as q}from"../../../../platform/instantiation/common/extensions.js";import{hash as A}from"../../../../base/common/hash.js";import{IUriIdentityService as F}from"../../../../platform/uriIdentity/common/uriIdentity.js";import{asArray as H,distinct as z}from"../../../../base/common/arrays.js";import{asCssVariable as j}from"../../../../platform/theme/common/colorRegistry.js";import{getIconRegistry as V}from"../../../../platform/theme/common/iconRegistry.js";class c{constructor(e,i,t){this.themeService=e;this.data=i;const o=A(t).toString(36);this.itemColorClassName=`${c._classNamesPrefix}-itemColor-${o}`,this.itemBadgeClassName=`${c._classNamesPrefix}-itemBadge-${o}`,this.bubbleBadgeClassName=`${c._classNamesPrefix}-bubbleBadge-${o}`,this.iconBadgeClassName=`${c._classNamesPrefix}-iconBadge-${o}`}static keyOf(e){if(Array.isArray(e))return e.map(c.keyOf).join(",");{const{color:i,letter:t}=e;return m.isThemeIcon(t)?`${i}+${t.id}`:`${i}/${t}`}}static _classNamesPrefix="monaco-decoration";data;itemColorClassName;itemBadgeClassName;iconBadgeClassName;bubbleBadgeClassName;_refCounter=0;acquire(){this._refCounter+=1}release(){return--this._refCounter===0}appendCSSRules(e){Array.isArray(this.data)?this._appendForMany(this.data,e):this._appendForOne(this.data,e)}_appendForOne(e,i){const{color:t,letter:o}=e;h(`.${this.itemColorClassName}`,`color: ${f(t)};`,i),m.isThemeIcon(o)?this._createIconCSSRule(o,t,i):o&&h(`.${this.itemBadgeClassName}::after`,`content: "${o}"; color: ${f(t)};`,i)}_appendForMany(e,i){const{color:t}=e.find(r=>!!r.color)??e[0];h(`.${this.itemColorClassName}`,`color: ${f(t)};`,i);const o=[];let a;for(const r of e)if(m.isThemeIcon(r.letter)){a=r.letter;break}else r.letter&&o.push(r.letter);a?this._createIconCSSRule(a,t,i):(o.length&&h(`.${this.itemBadgeClassName}::after`,`content: "${o.join(", ")}"; color: ${f(t)};`,i),h(`.${this.bubbleBadgeClassName}::after`,`content: "\uEA71"; color: ${f(t)}; font-family: codicon; font-size: 14px; margin-right: 14px; opacity: 0.4;`,i))}_createIconCSSRule(e,i,t){const o=m.getModifier(e);o&&(e=m.modify(e,void 0));const a=V().getIcon(e.id);if(!a)return;const r=this.themeService.getProductIconTheme().getIcon(a);r&&h(`.${this.iconBadgeClassName}::after`,`content: '${r.fontCharacter}';
			color: ${e.color?f(e.color.id):f(i)};
			font-family: ${U(r.font?.id??"codicon")};
			font-size: 16px;
			margin-right: 14px;
			font-weight: normal;
			${o==="spin"?"animation: codicon-spin 1.5s steps(30) infinite":""};
			`,t)}removeCSSRules(e){D(this.itemColorClassName,e),D(this.itemBadgeClassName,e),D(this.bubbleBadgeClassName,e),D(this.iconBadgeClassName,e)}}class W{constructor(e){this._themeService=e}_dispoables=new y;_styleElement=P(void 0,void 0,this._dispoables);_decorationRules=new Map;dispose(){this._dispoables.dispose()}asDecoration(e,i){e.sort((d,v)=>(v.weight||0)-(d.weight||0));const t=c.keyOf(e);let o=this._decorationRules.get(t);o||(o=new c(this._themeService,e,t),this._decorationRules.set(t,o),o.appendCSSRules(this._styleElement)),o.acquire();const a=o.itemColorClassName;let r=o.itemBadgeClassName;const n=o.iconBadgeClassName;let l=z(e.filter(d=>!k(d.tooltip)).map(d=>d.tooltip)).join(" \u2022 ");const _=e.some(d=>d.strikethrough);return i&&(r=o.bubbleBadgeClassName,l=x("bubbleTitle","Contains emphasized items")),{labelClassName:a,badgeClassName:r,iconClassName:n,strikethrough:_,tooltip:l,dispose:()=>{o?.release()&&(this._decorationRules.delete(t),o.removeCSSRules(this._styleElement),o=void 0)}}}}class G{_data=I.forUris(e=>!0);constructor(e){this._data.fill(!0,H(e))}affectsResource(e){return this._data.hasElementOrSubtree(e)}}class p{constructor(e,i){this.source=e;this.thenable=i}}function f(s){return s?j(s):"inherit"}let u=class{_store=new y;_onDidChangeDecorationsDelayed=this._store.add(new N({merge:e=>e.flat()}));_onDidChangeDecorations=this._store.add(new R);onDidChangeDecorations=this._onDidChangeDecorations.event;_provider=new B;_decorationStyles;_data;constructor(e,i){this._decorationStyles=new W(i),this._data=I.forUris(t=>e.extUri.ignorePathCasing(t)),this._store.add(this._onDidChangeDecorationsDelayed.event(t=>{this._onDidChangeDecorations.fire(new G(t))}))}dispose(){this._store.dispose(),this._data.clear()}registerDecorationsProvider(e){const i=this._provider.unshift(e);this._onDidChangeDecorations.fire({affectsResource(){return!0}});const t=()=>{const a=[];for(const[r,n]of this._data)n.delete(e)&&a.push(r);a.length>0&&this._onDidChangeDecorationsDelayed.fire(a)},o=e.onDidChange(a=>{if(!a)t();else for(const r of a){const n=this._ensureEntry(r);this._fetchData(n,r,e)}});return E(()=>{i(),o.dispose(),t()})}_ensureEntry(e){let i=this._data.get(e);return i||(i=new Map,this._data.set(e,i)),i}getDecoration(e,i){const t=[];let o=!1;const a=this._ensureEntry(e);for(const r of this._provider){let n=a.get(r);n===void 0&&(n=this._fetchData(a,e,r)),n&&!(n instanceof p)&&t.push(n)}if(i){const r=this._data.findSuperstr(e);if(r)for(const n of r)for(const l of n[1].values())l&&!(l instanceof p)&&l.bubble&&(t.push(l),o=!0)}return t.length===0?void 0:this._decorationStyles.asDecoration(t,o)}_fetchData(e,i,t){const o=e.get(t);o instanceof p&&(o.source.cancel(),e.delete(t));const a=new O,r=t.provideDecorations(i,a.token);if(T(r)){const n=new p(a,Promise.resolve(r).then(l=>{e.get(t)===n&&this._keepItem(e,t,i,l)}).catch(l=>{!M(l)&&e.get(t)===n&&e.delete(t)}).finally(()=>{a.dispose()}));return e.set(t,n),null}else return a.dispose(),this._keepItem(e,t,i,r)}_keepItem(e,i,t,o){const a=o||null,r=e.get(i);return e.set(i,a),(a||r)&&this._onDidChangeDecorationsDelayed.fire(t),a}};u=C([g(0,F),g(1,w)],u),q($,u,L.Delayed);export{u as DecorationsService};
