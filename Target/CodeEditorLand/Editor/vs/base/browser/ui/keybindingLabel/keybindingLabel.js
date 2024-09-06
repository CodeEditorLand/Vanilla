import*as o from"../../../../../vs/base/browser/dom.js";import{getBaseLayerHoverDelegate as l}from"../../../../../vs/base/browser/ui/hover/hoverDelegate2.js";import{getDefaultHoverDelegate as h}from"../../../../../vs/base/browser/ui/hover/hoverDelegateFactory.js";import{UILabelProvider as b}from"../../../../../vs/base/common/keybindingLabels.js";import"../../../../../vs/base/common/keybindings.js";import{Disposable as y}from"../../../../../vs/base/common/lifecycle.js";import{equals as s}from"../../../../../vs/base/common/objects.js";import"../../../../../vs/base/common/platform.js";import"vs/css!./keybindingLabel";import{localize as p}from"../../../../../vs/nls.js";const r=o.$,H={keybindingLabelBackground:void 0,keybindingLabelForeground:void 0,keybindingLabelBorder:void 0,keybindingLabelBottomBorder:void 0,keybindingLabelShadow:void 0};class a extends y{constructor(e,i,n){super();this.os=i;this.options=n||Object.create(null);const t=this.options.keybindingLabelForeground;this.domNode=o.append(e,r(".monaco-keybinding")),t&&(this.domNode.style.color=t),this.hover=this._register(l().setupManagedHover(h("mouse"),this.domNode,"")),this.didEverRender=!1,e.appendChild(this.domNode)}domNode;options;keyElements=new Set;hover;keybinding;matches;didEverRender;get element(){return this.domNode}set(e,i){this.didEverRender&&this.keybinding===e&&a.areSame(this.matches,i)||(this.keybinding=e,this.matches=i,this.render())}render(){if(this.clear(),this.keybinding){const e=this.keybinding.getChords();e[0]&&this.renderChord(this.domNode,e[0],this.matches?this.matches.firstPart:null);for(let n=1;n<e.length;n++)o.append(this.domNode,r("span.monaco-keybinding-key-chord-separator",void 0," ")),this.renderChord(this.domNode,e[n],this.matches?this.matches.chordPart:null);const i=this.options.disableTitle??!1?void 0:this.keybinding.getAriaLabel()||void 0;this.hover.update(i),this.domNode.setAttribute("aria-label",i||"")}else this.options&&this.options.renderUnboundKeybindings&&this.renderUnbound(this.domNode);this.didEverRender=!0}clear(){o.clearNode(this.domNode),this.keyElements.clear()}renderChord(e,i,n){const t=b.modifierLabels[this.os];i.ctrlKey&&this.renderKey(e,t.ctrlKey,!!n?.ctrlKey,t.separator),i.shiftKey&&this.renderKey(e,t.shiftKey,!!n?.shiftKey,t.separator),i.altKey&&this.renderKey(e,t.altKey,!!n?.altKey,t.separator),i.metaKey&&this.renderKey(e,t.metaKey,!!n?.metaKey,t.separator);const d=i.keyLabel;d&&this.renderKey(e,d,!!n?.keyCode,"")}renderKey(e,i,n,t){o.append(e,this.createKeyElement(i,n?".highlight":"")),t&&o.append(e,r("span.monaco-keybinding-key-separator",void 0,t))}renderUnbound(e){o.append(e,this.createKeyElement(p("unbound","Unbound")))}createKeyElement(e,i=""){const n=r("span.monaco-keybinding-key"+i,void 0,e);return this.keyElements.add(n),this.options.keybindingLabelBackground&&(n.style.backgroundColor=this.options.keybindingLabelBackground),this.options.keybindingLabelBorder&&(n.style.borderColor=this.options.keybindingLabelBorder),this.options.keybindingLabelBottomBorder&&(n.style.borderBottomColor=this.options.keybindingLabelBottomBorder),this.options.keybindingLabelShadow&&(n.style.boxShadow=`inset 0 -1px 0 ${this.options.keybindingLabelShadow}`),n}static areSame(e,i){return e===i||!e&&!i?!0:!!e&&!!i&&s(e.firstPart,i.firstPart)&&s(e.chordPart,i.chordPart)}}export{a as KeybindingLabel,H as unthemedKeybindingLabelOptions};