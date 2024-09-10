import"./iconSelectBox.css";import*as o from"../../dom.js";import{alert as I}from"../aria/aria.js";import{InputBox as f}from"../inputbox/inputBox.js";import{DomScrollableElement as b}from"../scrollbar/scrollableElement.js";import{Emitter as g}from"../../../common/event.js";import{DisposableStore as a,Disposable as x,MutableDisposable as E}from"../../../common/lifecycle.js";import{ThemeIcon as v}from"../../../common/themables.js";import{localize as m}from"../../../../nls.js";import{ScrollbarVisibility as w}from"../../../common/scrollable.js";import{HighlightedLabel as S}from"../highlightedlabel/highlightedLabel.js";class p extends x{constructor(e){super();this.options=e;this.domNode=o.$(".icon-select-box"),this._register(this.create())}static InstanceCount=0;domId=`icon_select_box_id_${++p.InstanceCount}`;domNode;_onDidSelect=this._register(new g);onDidSelect=this._onDidSelect.event;renderedIcons=[];focusedItemIndex=0;numberOfElementsPerRow=1;inputBox;scrollableElement;iconsContainer;iconIdElement;iconContainerWidth=36;iconContainerHeight=36;create(){const e=new a,n=o.append(this.domNode,o.$(".icon-select-box-container"));n.style.margin="10px 15px";const t=o.append(n,o.$(".icon-select-input-container"));t.style.paddingBottom="10px",this.inputBox=e.add(new f(t,void 0,{placeholder:m("iconSelect.placeholder","Search icons"),inputBoxStyles:this.options.inputBoxStyles}));const i=this.iconsContainer=o.$(".icon-select-icons-container",{id:`${this.domId}_icons`});i.role="listbox",i.tabIndex=0,this.scrollableElement=e.add(new b(i,{useShadows:!1,horizontal:w.Hidden})),o.append(n,this.scrollableElement.getDomNode()),this.options.showIconInfo&&(this.iconIdElement=this._register(new S(o.append(o.append(n,o.$(".icon-select-id-container")),o.$(".icon-select-id-label")))));const l=e.add(new E);return l.value=this.renderIcons(this.options.icons,[],i),this.scrollableElement.scanDomNode(),e.add(this.inputBox.onDidChange(d=>{const h=[],s=[];for(const c of this.options.icons){const r=this.matchesContiguous(d,c.id);r&&(h.push(c),s.push(r))}h.length&&(l.value=this.renderIcons(h,s,i),this.scrollableElement?.scanDomNode())})),this.inputBox.inputElement.role="combobox",this.inputBox.inputElement.ariaHasPopup="menu",this.inputBox.inputElement.ariaAutoComplete="list",this.inputBox.inputElement.ariaExpanded="true",this.inputBox.inputElement.setAttribute("aria-controls",i.id),e}renderIcons(e,n,t){const i=new a;o.clearNode(t);const l=this.renderedIcons[this.focusedItemIndex]?.icon;let d=0;const h=[];if(e.length)for(let s=0;s<e.length;s++){const c=e[s],r=o.append(t,o.$(".icon-container",{id:`${this.domId}_icons_${s}`}));r.style.width=`${this.iconContainerWidth}px`,r.style.height=`${this.iconContainerHeight}px`,r.title=c.id,r.role="button",r.setAttribute("aria-setsize",`${e.length}`),r.setAttribute("aria-posinset",`${s+1}`),o.append(r,o.$(v.asCSSSelector(c))),h.push({icon:c,element:r,highlightMatches:n[s]}),i.add(o.addDisposableListener(r,o.EventType.CLICK,u=>{u.stopPropagation(),this.setSelection(s)})),c===l&&(d=s)}else{const s=m("iconSelect.noResults","No results");o.append(t,o.$(".icon-no-results",void 0,s)),I(s)}return this.renderedIcons.splice(0,this.renderedIcons.length,...h),this.focusIcon(d),i}focusIcon(e){const n=this.renderedIcons[this.focusedItemIndex];n&&n.element.classList.remove("focused"),this.focusedItemIndex=e;const t=this.renderedIcons[e];t&&t.element.classList.add("focused"),this.inputBox&&(t?this.inputBox.inputElement.setAttribute("aria-activedescendant",t.element.id):this.inputBox.inputElement.removeAttribute("aria-activedescendant")),this.iconIdElement&&(t?this.iconIdElement.set(t.icon.id,t.highlightMatches):this.iconIdElement.set("")),this.reveal(e)}reveal(e){if(!this.scrollableElement||e<0||e>=this.renderedIcons.length)return;const n=this.renderedIcons[e].element;if(!n)return;const{height:t}=this.scrollableElement.getScrollDimensions(),{scrollTop:i}=this.scrollableElement.getScrollPosition();n.offsetTop+this.iconContainerHeight>i+t?this.scrollableElement.setScrollPosition({scrollTop:n.offsetTop+this.iconContainerHeight-t}):n.offsetTop<i&&this.scrollableElement.setScrollPosition({scrollTop:n.offsetTop})}matchesContiguous(e,n){const t=n.toLowerCase().indexOf(e.toLowerCase());return t!==-1?[{start:t,end:t+e.length}]:null}layout(e){this.domNode.style.width=`${e.width}px`,this.domNode.style.height=`${e.height}px`;const n=e.width-30;if(this.numberOfElementsPerRow=Math.floor(n/this.iconContainerWidth),this.numberOfElementsPerRow===0)throw new Error("Insufficient width");const t=n%this.iconContainerWidth,i=Math.floor(t/this.numberOfElementsPerRow);for(const{element:d}of this.renderedIcons)d.style.marginRight=`${i}px`;const l=t%this.numberOfElementsPerRow;this.iconsContainer&&(this.iconsContainer.style.paddingLeft=`${Math.floor(l/2)}px`,this.iconsContainer.style.paddingRight=`${Math.ceil(l/2)}px`),this.scrollableElement&&(this.scrollableElement.getDomNode().style.height=`${this.iconIdElement?e.height-80:e.height-40}px`,this.scrollableElement.scanDomNode())}getFocus(){return[this.focusedItemIndex]}setSelection(e){if(e<0||e>=this.renderedIcons.length)throw new Error(`Invalid index ${e}`);this.focusIcon(e),this._onDidSelect.fire(this.renderedIcons[e].icon)}clearInput(){this.inputBox&&(this.inputBox.value="")}focus(){this.inputBox?.focus(),this.focusIcon(0)}focusNext(){this.focusIcon((this.focusedItemIndex+1)%this.renderedIcons.length)}focusPrevious(){this.focusIcon((this.focusedItemIndex-1+this.renderedIcons.length)%this.renderedIcons.length)}focusNextRow(){let e=this.focusedItemIndex+this.numberOfElementsPerRow;e>=this.renderedIcons.length&&(e=(e+1)%this.numberOfElementsPerRow,e=e>=this.renderedIcons.length?0:e),this.focusIcon(e)}focusPreviousRow(){let e=this.focusedItemIndex-this.numberOfElementsPerRow;if(e<0){const n=Math.floor(this.renderedIcons.length/this.numberOfElementsPerRow);e=this.focusedItemIndex+this.numberOfElementsPerRow*n-1,e=e<0?this.renderedIcons.length-1:e>=this.renderedIcons.length?e-this.numberOfElementsPerRow:e}this.focusIcon(e)}getFocusedIcon(){return this.renderedIcons[this.focusedItemIndex].icon}}export{p as IconSelectBox};
