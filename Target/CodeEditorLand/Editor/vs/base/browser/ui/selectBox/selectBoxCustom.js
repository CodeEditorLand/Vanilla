import*as y from"../../../common/arrays.js";import{Emitter as _,Event as a}from"../../../common/event.js";import{KeyCode as l,KeyCodeUtils as S}from"../../../common/keyCodes.js";import{Disposable as C}from"../../../common/lifecycle.js";import{isMacintosh as L}from"../../../common/platform.js";import{ScrollbarVisibility as I}from"../../../common/scrollable.js";import*as n from"../../dom.js";import{DomEmitter as O}from"../../event.js";import"../../formattedTextRenderer.js";import{StandardKeyboardEvent as E}from"../../keyboardEvent.js";import{renderMarkdown as M}from"../../markdownRenderer.js";import{AnchorPosition as D}from"../contextview/contextview.js";import{getBaseLayerHoverDelegate as H}from"../hover/hoverDelegate2.js";import{getDefaultHoverDelegate as T}from"../hover/hoverDelegateFactory.js";import"../list/list.js";import{List as P}from"../list/listWidget.js";import"./selectBox.js";import"./selectBoxCustom.css";import{localize as B}from"../../../../nls.js";const d=n.$,x="selectOption.entry.template";class k{get templateId(){return x}renderTemplate(e){const i=Object.create(null);return i.root=e,i.text=n.append(e,d(".option-text")),i.detail=n.append(e,d(".option-detail")),i.decoratorRight=n.append(e,d(".option-decorator-right")),i}renderElement(e,i,s){const t=s,o=e.text,c=e.detail,r=e.decoratorRight,p=e.isDisabled;t.text.textContent=o,t.detail.textContent=c||"",t.decoratorRight.innerText=r||"",p?t.root.classList.add("option-disabled"):t.root.classList.remove("option-disabled")}disposeTemplate(e){}}class u extends C{static DEFAULT_DROPDOWN_MINIMUM_BOTTOM_MARGIN=32;static DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN=2;static DEFAULT_MINIMUM_VISIBLE_OPTIONS=3;_isVisible;selectBoxOptions;selectElement;container;options=[];selected;_onDidSelect;styles;listRenderer;contextViewProvider;selectDropDownContainer;styleElement;selectList;selectDropDownListContainer;widthControlElement;_currentSelection=0;_dropDownPosition;_hasDetails=!1;selectionDetailsPane;_skipLayout=!1;_cachedMaxDetailsHeight;_hover;_sticky=!1;constructor(e,i,s,t,o){super(),this._isVisible=!1,this.styles=t,this.selectBoxOptions=o||Object.create(null),typeof this.selectBoxOptions.minBottomMargin!="number"?this.selectBoxOptions.minBottomMargin=u.DEFAULT_DROPDOWN_MINIMUM_BOTTOM_MARGIN:this.selectBoxOptions.minBottomMargin<0&&(this.selectBoxOptions.minBottomMargin=0),this.selectElement=document.createElement("select"),this.selectElement.className="monaco-select-box monaco-select-box-dropdown-padding",typeof this.selectBoxOptions.ariaLabel=="string"&&this.selectElement.setAttribute("aria-label",this.selectBoxOptions.ariaLabel),typeof this.selectBoxOptions.ariaDescription=="string"&&this.selectElement.setAttribute("aria-description",this.selectBoxOptions.ariaDescription),this._onDidSelect=new _,this._register(this._onDidSelect),this.registerListeners(),this.constructSelectDropDown(s),this.selected=i||0,e&&this.setOptions(e,i),this.initStyleSheet()}setTitle(e){!this._hover&&e?this._hover=this._register(H().setupManagedHover(T("mouse"),this.selectElement,e)):this._hover&&this._hover.update(e)}getHeight(){return 22}getTemplateId(){return x}constructSelectDropDown(e){this.contextViewProvider=e,this.selectDropDownContainer=n.$(".monaco-select-box-dropdown-container"),this.selectDropDownContainer.classList.add("monaco-select-box-dropdown-padding"),this.selectionDetailsPane=n.append(this.selectDropDownContainer,d(".select-box-details-pane"));const i=n.append(this.selectDropDownContainer,d(".select-box-dropdown-container-width-control")),s=n.append(i,d(".width-control-div"));this.widthControlElement=document.createElement("span"),this.widthControlElement.className="option-text-width-control",n.append(s,this.widthControlElement),this._dropDownPosition=D.BELOW,this.styleElement=n.createStyleSheet(this.selectDropDownContainer),this.selectDropDownContainer.setAttribute("draggable","true"),this._register(n.addDisposableListener(this.selectDropDownContainer,n.EventType.DRAG_START,t=>{n.EventHelper.stop(t,!0)}))}registerListeners(){this._register(n.addStandardDisposableListener(this.selectElement,"change",i=>{this.selected=i.target.selectedIndex,this._onDidSelect.fire({index:i.target.selectedIndex,selected:i.target.value}),this.options[this.selected]&&this.options[this.selected].text&&this.setTitle(this.options[this.selected].text)})),this._register(n.addDisposableListener(this.selectElement,n.EventType.CLICK,i=>{n.EventHelper.stop(i),this._isVisible?this.hideSelectDropDown(!0):this.showSelectDropDown()})),this._register(n.addDisposableListener(this.selectElement,n.EventType.MOUSE_DOWN,i=>{n.EventHelper.stop(i)}));let e;this._register(n.addDisposableListener(this.selectElement,"touchstart",i=>{e=this._isVisible})),this._register(n.addDisposableListener(this.selectElement,"touchend",i=>{n.EventHelper.stop(i),e?this.hideSelectDropDown(!0):this.showSelectDropDown()})),this._register(n.addDisposableListener(this.selectElement,n.EventType.KEY_DOWN,i=>{const s=new E(i);let t=!1;L?(s.keyCode===l.DownArrow||s.keyCode===l.UpArrow||s.keyCode===l.Space||s.keyCode===l.Enter)&&(t=!0):(s.keyCode===l.DownArrow&&s.altKey||s.keyCode===l.UpArrow&&s.altKey||s.keyCode===l.Space||s.keyCode===l.Enter)&&(t=!0),t&&(this.showSelectDropDown(),n.EventHelper.stop(i,!0))}))}get onDidSelect(){return this._onDidSelect.event}setOptions(e,i){y.equals(this.options,e)||(this.options=e,this.selectElement.options.length=0,this._hasDetails=!1,this._cachedMaxDetailsHeight=void 0,this.options.forEach((s,t)=>{this.selectElement.add(this.createOption(s.text,t,s.isDisabled)),typeof s.description=="string"&&(this._hasDetails=!0)})),i!==void 0&&(this.select(i),this._currentSelection=this.selected)}setEnabled(e){this.selectElement.disabled=!e}setOptionsList(){this.selectList?.splice(0,this.selectList.length,this.options)}select(e){e>=0&&e<this.options.length?this.selected=e:e>this.options.length-1?this.select(this.options.length-1):this.selected<0&&(this.selected=0),this.selectElement.selectedIndex=this.selected,this.options[this.selected]&&this.options[this.selected].text&&this.setTitle(this.options[this.selected].text)}setAriaLabel(e){this.selectBoxOptions.ariaLabel=e,this.selectElement.setAttribute("aria-label",this.selectBoxOptions.ariaLabel)}focus(){this.selectElement&&(this.selectElement.tabIndex=0,this.selectElement.focus())}blur(){this.selectElement&&(this.selectElement.tabIndex=-1,this.selectElement.blur())}setFocusable(e){this.selectElement.tabIndex=e?0:-1}render(e){this.container=e,e.classList.add("select-container"),e.appendChild(this.selectElement),this.styleSelectElement()}initStyleSheet(){const e=[];this.styles.listFocusBackground&&e.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { background-color: ${this.styles.listFocusBackground} !important; }`),this.styles.listFocusForeground&&e.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { color: ${this.styles.listFocusForeground} !important; }`),this.styles.decoratorRightForeground&&e.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.focused) .option-decorator-right { color: ${this.styles.decoratorRightForeground}; }`),this.styles.selectBackground&&this.styles.selectBorder&&this.styles.selectBorder!==this.styles.selectBackground?(e.push(`.monaco-select-box-dropdown-container { border: 1px solid ${this.styles.selectBorder} } `),e.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-top { border-top: 1px solid ${this.styles.selectBorder} } `),e.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-bottom { border-bottom: 1px solid ${this.styles.selectBorder} } `)):this.styles.selectListBorder&&(e.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-top { border-top: 1px solid ${this.styles.selectListBorder} } `),e.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-bottom { border-bottom: 1px solid ${this.styles.selectListBorder} } `)),this.styles.listHoverForeground&&e.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { color: ${this.styles.listHoverForeground} !important; }`),this.styles.listHoverBackground&&e.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { background-color: ${this.styles.listHoverBackground} !important; }`),this.styles.listFocusOutline&&e.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { outline: 1.6px dotted ${this.styles.listFocusOutline} !important; outline-offset: -1.6px !important; }`),this.styles.listHoverOutline&&e.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { outline: 1.6px dashed ${this.styles.listHoverOutline} !important; outline-offset: -1.6px !important; }`),e.push(".monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.option-disabled.focused { background-color: transparent !important; color: inherit !important; outline: none !important; }"),e.push(".monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.option-disabled:hover { background-color: transparent !important; color: inherit !important; outline: none !important; }"),this.styleElement.textContent=e.join(`
`)}styleSelectElement(){const e=this.styles.selectBackground??"",i=this.styles.selectForeground??"",s=this.styles.selectBorder??"";this.selectElement.style.backgroundColor=e,this.selectElement.style.color=i,this.selectElement.style.borderColor=s}styleList(){const e=this.styles.selectBackground??"",i=n.asCssValueWithDefault(this.styles.selectListBackground,e);this.selectDropDownListContainer.style.backgroundColor=i,this.selectionDetailsPane.style.backgroundColor=i;const s=this.styles.focusBorder??"";this.selectDropDownContainer.style.outlineColor=s,this.selectDropDownContainer.style.outlineOffset="-1px",this.selectList.style(this.styles)}createOption(e,i,s){const t=document.createElement("option");return t.value=e,t.text=e,t.disabled=!!s,t}showSelectDropDown(){this.selectionDetailsPane.innerText="",!(!this.contextViewProvider||this._isVisible)&&(this.createSelectList(this.selectDropDownContainer),this.setOptionsList(),this.contextViewProvider.showContextView({getAnchor:()=>this.selectElement,render:e=>this.renderSelectDropDown(e,!0),layout:()=>{this.layoutSelectDropDown()},onHide:()=>{this.selectDropDownContainer.classList.remove("visible"),this.selectElement.classList.remove("synthetic-focus")},anchorPosition:this._dropDownPosition},this.selectBoxOptions.optionsAsChildren?this.container:void 0),this._isVisible=!0,this.hideSelectDropDown(!1),this.contextViewProvider.showContextView({getAnchor:()=>this.selectElement,render:e=>this.renderSelectDropDown(e),layout:()=>this.layoutSelectDropDown(),onHide:()=>{this.selectDropDownContainer.classList.remove("visible"),this.selectElement.classList.remove("synthetic-focus")},anchorPosition:this._dropDownPosition},this.selectBoxOptions.optionsAsChildren?this.container:void 0),this._currentSelection=this.selected,this._isVisible=!0,this.selectElement.setAttribute("aria-expanded","true"))}hideSelectDropDown(e){!this.contextViewProvider||!this._isVisible||(this._isVisible=!1,this.selectElement.setAttribute("aria-expanded","false"),e&&this.selectElement.focus(),this.contextViewProvider.hideContextView())}renderSelectDropDown(e,i){return e.appendChild(this.selectDropDownContainer),this.layoutSelectDropDown(i),{dispose:()=>{this.selectDropDownContainer.remove()}}}measureMaxDetailsHeight(){let e=0;return this.options.forEach((i,s)=>{this.updateDetail(s),this.selectionDetailsPane.offsetHeight>e&&(e=this.selectionDetailsPane.offsetHeight)}),e}layoutSelectDropDown(e){if(this._skipLayout)return!1;if(this.selectList){this.selectDropDownContainer.classList.add("visible");const i=n.getWindow(this.selectElement),s=n.getDomNodePagePosition(this.selectElement),t=n.getWindow(this.selectElement).getComputedStyle(this.selectElement),o=parseFloat(t.getPropertyValue("--dropdown-padding-top"))+parseFloat(t.getPropertyValue("--dropdown-padding-bottom")),c=i.innerHeight-s.top-s.height-(this.selectBoxOptions.minBottomMargin||0),r=s.top-u.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN,p=this.selectElement.offsetWidth,b=this.setWidthControlElement(this.widthControlElement),w=Math.max(b,Math.round(p)).toString()+"px";this.selectDropDownContainer.style.width=w,this.selectList.getHTMLElement().style.height="",this.selectList.layout();let m=this.selectList.contentHeight;this._hasDetails&&this._cachedMaxDetailsHeight===void 0&&(this._cachedMaxDetailsHeight=this.measureMaxDetailsHeight());const v=this._hasDetails?this._cachedMaxDetailsHeight:0,f=m+o+v,h=Math.floor((c-o-v)/this.getHeight()),g=Math.floor((r-o-v)/this.getHeight());if(e)return s.top+s.height>i.innerHeight-22||s.top<u.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN||h<1&&g<1?!1:(h<u.DEFAULT_MINIMUM_VISIBLE_OPTIONS&&g>h&&this.options.length>h?(this._dropDownPosition=D.ABOVE,this.selectDropDownListContainer.remove(),this.selectionDetailsPane.remove(),this.selectDropDownContainer.appendChild(this.selectionDetailsPane),this.selectDropDownContainer.appendChild(this.selectDropDownListContainer),this.selectionDetailsPane.classList.remove("border-top"),this.selectionDetailsPane.classList.add("border-bottom")):(this._dropDownPosition=D.BELOW,this.selectDropDownListContainer.remove(),this.selectionDetailsPane.remove(),this.selectDropDownContainer.appendChild(this.selectDropDownListContainer),this.selectDropDownContainer.appendChild(this.selectionDetailsPane),this.selectionDetailsPane.classList.remove("border-bottom"),this.selectionDetailsPane.classList.add("border-top")),!0);if(s.top+s.height>i.innerHeight-22||s.top<u.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN||this._dropDownPosition===D.BELOW&&h<1||this._dropDownPosition===D.ABOVE&&g<1)return this.hideSelectDropDown(!0),!1;if(this._dropDownPosition===D.BELOW){if(this._isVisible&&h+g<1)return this.hideSelectDropDown(!0),!1;f>c&&(m=h*this.getHeight())}else f>r&&(m=g*this.getHeight());return this.selectList.layout(m),this.selectList.domFocus(),this.selectList.length>0&&(this.selectList.setFocus([this.selected||0]),this.selectList.reveal(this.selectList.getFocus()[0]||0)),this._hasDetails?(this.selectList.getHTMLElement().style.height=m+o+"px",this.selectDropDownContainer.style.height=""):this.selectDropDownContainer.style.height=m+o+"px",this.updateDetail(this.selected),this.selectDropDownContainer.style.width=w,this.selectDropDownListContainer.setAttribute("tabindex","0"),this.selectElement.classList.add("synthetic-focus"),this.selectDropDownContainer.classList.add("synthetic-focus"),!0}else return!1}setWidthControlElement(e){let i=0;if(e){let s=0,t=0;this.options.forEach((o,c)=>{const r=o.detail?o.detail.length:0,p=o.decoratorRight?o.decoratorRight.length:0,b=o.text.length+r+p;b>t&&(s=c,t=b)}),e.textContent=this.options[s].text+(this.options[s].decoratorRight?this.options[s].decoratorRight+" ":""),i=n.getTotalWidth(e)}return i}createSelectList(e){if(this.selectList)return;this.selectDropDownListContainer=n.append(e,d(".select-box-dropdown-list-container")),this.listRenderer=new k,this.selectList=this._register(new P("SelectBoxCustom",this.selectDropDownListContainer,this,[this.listRenderer],{useShadows:!1,verticalScrollMode:I.Visible,keyboardSupport:!1,mouseSupport:!1,accessibilityProvider:{getAriaLabel:t=>{let o=t.text;return t.detail&&(o+=`. ${t.detail}`),t.decoratorRight&&(o+=`. ${t.decoratorRight}`),t.description&&(o+=`. ${t.description}`),o},getWidgetAriaLabel:()=>B({key:"selectBox",comment:["Behave like native select dropdown element."]},"Select Box"),getRole:()=>L?"":"option",getWidgetRole:()=>"listbox"}})),this.selectBoxOptions.ariaLabel&&(this.selectList.ariaLabel=this.selectBoxOptions.ariaLabel);const i=this._register(new O(this.selectDropDownListContainer,"keydown")),s=a.chain(i.event,t=>t.filter(()=>this.selectList.length>0).map(o=>new E(o)));this._register(a.chain(s,t=>t.filter(o=>o.keyCode===l.Enter))(this.onEnter,this)),this._register(a.chain(s,t=>t.filter(o=>o.keyCode===l.Tab))(this.onEnter,this)),this._register(a.chain(s,t=>t.filter(o=>o.keyCode===l.Escape))(this.onEscape,this)),this._register(a.chain(s,t=>t.filter(o=>o.keyCode===l.UpArrow))(this.onUpArrow,this)),this._register(a.chain(s,t=>t.filter(o=>o.keyCode===l.DownArrow))(this.onDownArrow,this)),this._register(a.chain(s,t=>t.filter(o=>o.keyCode===l.PageDown))(this.onPageDown,this)),this._register(a.chain(s,t=>t.filter(o=>o.keyCode===l.PageUp))(this.onPageUp,this)),this._register(a.chain(s,t=>t.filter(o=>o.keyCode===l.Home))(this.onHome,this)),this._register(a.chain(s,t=>t.filter(o=>o.keyCode===l.End))(this.onEnd,this)),this._register(a.chain(s,t=>t.filter(o=>o.keyCode>=l.Digit0&&o.keyCode<=l.KeyZ||o.keyCode>=l.Semicolon&&o.keyCode<=l.NumpadDivide))(this.onCharacter,this)),this._register(n.addDisposableListener(this.selectList.getHTMLElement(),n.EventType.POINTER_UP,t=>this.onPointerUp(t))),this._register(this.selectList.onMouseOver(t=>typeof t.index<"u"&&this.selectList.setFocus([t.index]))),this._register(this.selectList.onDidChangeFocus(t=>this.onListFocus(t))),this._register(n.addDisposableListener(this.selectDropDownContainer,n.EventType.FOCUS_OUT,t=>{!this._isVisible||n.isAncestor(t.relatedTarget,this.selectDropDownContainer)||this.onListBlur()})),this.selectList.getHTMLElement().setAttribute("aria-label",this.selectBoxOptions.ariaLabel||""),this.selectList.getHTMLElement().setAttribute("aria-expanded","true"),this.styleList()}onPointerUp(e){if(!this.selectList.length)return;n.EventHelper.stop(e);const i=e.target;if(!i||i.classList.contains("slider"))return;const s=i.closest(".monaco-list-row");if(!s)return;const t=Number(s.getAttribute("data-index")),o=s.classList.contains("option-disabled");t>=0&&t<this.options.length&&!o&&(this.selected=t,this.select(this.selected),this.selectList.setFocus([this.selected]),this.selectList.reveal(this.selectList.getFocus()[0]),this.selected!==this._currentSelection&&(this._currentSelection=this.selected,this._onDidSelect.fire({index:this.selectElement.selectedIndex,selected:this.options[this.selected].text}),this.options[this.selected]&&this.options[this.selected].text&&this.setTitle(this.options[this.selected].text)),this.hideSelectDropDown(!0))}onListBlur(){this._sticky||(this.selected!==this._currentSelection&&this.select(this._currentSelection),this.hideSelectDropDown(!1))}renderDescriptionMarkdown(e,i){const s=o=>{for(let c=0;c<o.childNodes.length;c++){const r=o.childNodes.item(c);(r.tagName&&r.tagName.toLowerCase())==="img"?r.remove():s(r)}},t=M({value:e,supportThemeIcons:!0},{actionHandler:i});return t.element.classList.add("select-box-description-markdown"),s(t.element),t.element}onListFocus(e){!this._isVisible||!this._hasDetails||this.updateDetail(e.indexes[0])}updateDetail(e){this.selectionDetailsPane.innerText="";const i=this.options[e],s=i?.description??"",t=i?.descriptionIsMarkdown??!1;if(s){if(t){const o=i.descriptionMarkdownActionHandler;this.selectionDetailsPane.appendChild(this.renderDescriptionMarkdown(s,o))}else this.selectionDetailsPane.innerText=s;this.selectionDetailsPane.style.display="block"}else this.selectionDetailsPane.style.display="none";this._skipLayout=!0,this.contextViewProvider.layout(),this._skipLayout=!1}onEscape(e){n.EventHelper.stop(e),this.select(this._currentSelection),this.hideSelectDropDown(!0)}onEnter(e){n.EventHelper.stop(e),this.selected!==this._currentSelection&&(this._currentSelection=this.selected,this._onDidSelect.fire({index:this.selectElement.selectedIndex,selected:this.options[this.selected].text}),this.options[this.selected]&&this.options[this.selected].text&&this.setTitle(this.options[this.selected].text)),this.hideSelectDropDown(!0)}onDownArrow(e){if(this.selected<this.options.length-1){n.EventHelper.stop(e,!0);const i=this.options[this.selected+1].isDisabled;if(i&&this.options.length>this.selected+2)this.selected+=2;else{if(i)return;this.selected++}this.select(this.selected),this.selectList.setFocus([this.selected]),this.selectList.reveal(this.selectList.getFocus()[0])}}onUpArrow(e){this.selected>0&&(n.EventHelper.stop(e,!0),this.options[this.selected-1].isDisabled&&this.selected>1?this.selected-=2:this.selected--,this.select(this.selected),this.selectList.setFocus([this.selected]),this.selectList.reveal(this.selectList.getFocus()[0]))}onPageUp(e){n.EventHelper.stop(e),this.selectList.focusPreviousPage(),setTimeout(()=>{this.selected=this.selectList.getFocus()[0],this.options[this.selected].isDisabled&&this.selected<this.options.length-1&&(this.selected++,this.selectList.setFocus([this.selected])),this.selectList.reveal(this.selected),this.select(this.selected)},1)}onPageDown(e){n.EventHelper.stop(e),this.selectList.focusNextPage(),setTimeout(()=>{this.selected=this.selectList.getFocus()[0],this.options[this.selected].isDisabled&&this.selected>0&&(this.selected--,this.selectList.setFocus([this.selected])),this.selectList.reveal(this.selected),this.select(this.selected)},1)}onHome(e){n.EventHelper.stop(e),!(this.options.length<2)&&(this.selected=0,this.options[this.selected].isDisabled&&this.selected>1&&this.selected++,this.selectList.setFocus([this.selected]),this.selectList.reveal(this.selected),this.select(this.selected))}onEnd(e){n.EventHelper.stop(e),!(this.options.length<2)&&(this.selected=this.options.length-1,this.options[this.selected].isDisabled&&this.selected>1&&this.selected--,this.selectList.setFocus([this.selected]),this.selectList.reveal(this.selected),this.select(this.selected))}onCharacter(e){const i=S.toString(e.keyCode);let s=-1;for(let t=0;t<this.options.length-1;t++)if(s=(t+this.selected+1)%this.options.length,this.options[s].text.charAt(0).toUpperCase()===i&&!this.options[s].isDisabled){this.select(s),this.selectList.setFocus([s]),this.selectList.reveal(this.selectList.getFocus()[0]),n.EventHelper.stop(e);break}}dispose(){this.hideSelectDropDown(!1),super.dispose()}}export{u as SelectBoxList};
