import*as a from"../../../../../vs/base/browser/dom.js";import"../../../../../vs/base/browser/ui/hover/hoverDelegate.js";import{getBaseLayerHoverDelegate as d}from"../../../../../vs/base/browser/ui/hover/hoverDelegate2.js";import{getDefaultHoverDelegate as p}from"../../../../../vs/base/browser/ui/hover/hoverDelegateFactory.js";import{renderLabelWithIcons as h}from"../../../../../vs/base/browser/ui/iconLabel/iconLabels.js";import{Disposable as g}from"../../../../../vs/base/common/lifecycle.js";import*as u from"../../../../../vs/base/common/objects.js";class l extends g{constructor(t,s){super();this.options=s;this.supportIcons=s?.supportIcons??!1,this.domNode=a.append(t,a.$("span.monaco-highlighted-label"))}domNode;text="";title="";highlights=[];supportIcons;didEverRender=!1;customHover;get element(){return this.domNode}set(t,s=[],e="",i){t||(t=""),i&&(t=l.escapeNewLines(t,s)),!(this.didEverRender&&this.text===t&&this.title===e&&u.equals(this.highlights,s))&&(this.text=t,this.title=e,this.highlights=s,this.render())}render(){const t=[];let s=0;for(const e of this.highlights){if(e.end===e.start)continue;if(s<e.start){const r=this.text.substring(s,e.start);this.supportIcons?t.push(...h(r)):t.push(r),s=e.start}const i=this.text.substring(s,e.end),n=a.$("span.highlight",void 0,...this.supportIcons?h(i):[i]);e.extraClasses&&n.classList.add(...e.extraClasses),t.push(n),s=e.end}if(s<this.text.length){const e=this.text.substring(s);this.supportIcons?t.push(...h(e)):t.push(e)}if(a.reset(this.domNode,...t),this.options?.hoverDelegate?.showNativeHover)this.domNode.title=this.title;else if(!this.customHover&&this.title!==""){const e=this.options?.hoverDelegate??p("mouse");this.customHover=this._register(d().setupManagedHover(e,this.domNode,this.title))}else this.customHover&&this.customHover.update(this.title);this.didEverRender=!0}static escapeNewLines(t,s){let e=0,i=0;return t.replace(/\r\n|\r|\n/g,(n,r)=>{i=n===`\r
`?-1:0,r+=e;for(const o of s)o.end<=r||(o.start>=r&&(o.start+=i),o.end>=r&&(o.end+=i));return e+=i,"\u23CE"})}}export{l as HighlightedLabel};