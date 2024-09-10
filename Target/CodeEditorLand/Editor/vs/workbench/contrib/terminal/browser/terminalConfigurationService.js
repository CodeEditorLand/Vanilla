var p=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var d=(s,a,e,t)=>{for(var i=t>1?void 0:t?v(a,e):a,r=s.length-1,n;r>=0;r--)(n=s[r])&&(i=(t?n(a,e,i):n(i))||i);return t&&i&&p(a,e,i),i},_=(s,a)=>(e,t)=>a(e,t,s);import{Emitter as C,Event as I}from"../../../../base/common/event.js";import{Disposable as M,toDisposable as E}from"../../../../base/common/lifecycle.js";import{EDITOR_FONT_DEFAULTS as f}from"../../../../editor/common/config/editorOptions.js";import{IConfigurationService as S}from"../../../../platform/configuration/common/configuration.js";import{LinuxDistro as m}from"./terminal.js";import{DEFAULT_BOLD_FONT_WEIGHT as T,DEFAULT_FONT_WEIGHT as y,DEFAULT_LETTER_SPACING as W,DEFAULT_LINE_HEIGHT as b,MAXIMUM_FONT_WEIGHT as x,MINIMUM_FONT_WEIGHT as H,MINIMUM_LETTER_SPACING as w,TERMINAL_CONFIG_SECTION as F}from"../common/terminal.js";import{isMacintosh as D}from"../../../../base/common/platform.js";let u=class extends M{constructor(e){super();this._configurationService=e;this._fontMetrics=this._register(new R(this,this._configurationService)),this._register(I.runAndSubscribe(this._configurationService.onDidChangeConfiguration,t=>{(!t||t.affectsConfiguration(F))&&this._updateConfig()}))}_fontMetrics;_config;get config(){return this._config}_onConfigChanged=new C;get onConfigChanged(){return this._onConfigChanged.event}setPanelContainer(e){return this._fontMetrics.setPanelContainer(e)}configFontIsMonospace(){return this._fontMetrics.configFontIsMonospace()}getFont(e,t,i){return this._fontMetrics.getFont(e,t,i)}_updateConfig(){const e={...this._configurationService.getValue(F)};e.fontWeight=this._normalizeFontWeight(e.fontWeight,y),e.fontWeightBold=this._normalizeFontWeight(e.fontWeightBold,T),this._config=e,this._onConfigChanged.fire()}_normalizeFontWeight(e,t){return e==="normal"||e==="bold"?e:g(e,H,x,t)}};u=d([_(0,S)],u);var L=(e=>(e[e.MinimumFontSize=6]="MinimumFontSize",e[e.MaximumFontSize=100]="MaximumFontSize",e))(L||{});class R extends M{constructor(e,t){super();this._terminalConfigurationService=e;this._configurationService=t;this._register(E(()=>this._charMeasureElement?.remove()))}_panelContainer;_charMeasureElement;_lastFontMeasurement;linuxDistro=m.Unknown;setPanelContainer(e){this._panelContainer=e}configFontIsMonospace(){const t=this._terminalConfigurationService.config.fontFamily||this._configurationService.getValue("editor").fontFamily||f.fontFamily,i=this._getBoundingRectFor("i",t,15),r=this._getBoundingRectFor("w",t,15);return!i||!r||!i.width||!r.width?!0:i.width===r.width}getFont(e,t,i){const r=this._configurationService.getValue("editor");let n=this._terminalConfigurationService.config.fontFamily||r.fontFamily||f.fontFamily||"monospace",o=g(this._terminalConfigurationService.config.fontSize,6,100,f.fontSize);this._terminalConfigurationService.config.fontFamily||(this.linuxDistro===m.Fedora&&(n="'DejaVu Sans Mono'"),this.linuxDistro===m.Ubuntu&&(n="'Ubuntu Mono'",o=g(o+2,6,100,f.fontSize))),n+=", monospace",D&&(n+=", AppleBraille");const h=this._terminalConfigurationService.config.letterSpacing?Math.max(Math.floor(this._terminalConfigurationService.config.letterSpacing),w):W,l=this._terminalConfigurationService.config.lineHeight?Math.max(this._terminalConfigurationService.config.lineHeight,1):b;if(i)return{fontFamily:n,fontSize:o,letterSpacing:h,lineHeight:l};if(t?._renderService?._renderer.value){const c=t._renderService.dimensions.css.cell;if(c?.width&&c?.height)return{fontFamily:n,fontSize:o,letterSpacing:h,lineHeight:l,charHeight:c.height/l,charWidth:c.width-Math.round(h)/e.devicePixelRatio}}return this._measureFont(e,n,o,h,l)}_createCharMeasureElementIfNecessary(){if(!this._panelContainer)throw new Error("Cannot measure element when terminal is not attached");return(!this._charMeasureElement||!this._charMeasureElement.parentElement)&&(this._charMeasureElement=document.createElement("div"),this._panelContainer.appendChild(this._charMeasureElement)),this._charMeasureElement}_getBoundingRectFor(e,t,i){let r;try{r=this._createCharMeasureElementIfNecessary()}catch{return}const n=r.style;n.display="inline-block",n.fontFamily=t,n.fontSize=i+"px",n.lineHeight="normal",r.innerText=e;const o=r.getBoundingClientRect();return n.display="none",o}_measureFont(e,t,i,r,n){const o=this._getBoundingRectFor("X",t,i);if(this._lastFontMeasurement&&(!o||!o.width||!o.height))return this._lastFontMeasurement;if(this._lastFontMeasurement={fontFamily:t,fontSize:i,letterSpacing:r,lineHeight:n,charWidth:0,charHeight:0},o&&o.width&&o.height)if(this._lastFontMeasurement.charHeight=Math.ceil(o.height),this._terminalConfigurationService.config.gpuAcceleration==="off")this._lastFontMeasurement.charWidth=o.width;else{const c=(Math.floor(o.width*e.devicePixelRatio)+Math.round(r))/e.devicePixelRatio;this._lastFontMeasurement.charWidth=c-Math.round(r)/e.devicePixelRatio}return this._lastFontMeasurement}}function g(s,a,e,t){let i=parseInt(s,10);return isNaN(i)?t:(typeof a=="number"&&(i=Math.max(a,i)),typeof e=="number"&&(i=Math.min(e,i)),i)}export{u as TerminalConfigurationService,R as TerminalFontMetrics};
