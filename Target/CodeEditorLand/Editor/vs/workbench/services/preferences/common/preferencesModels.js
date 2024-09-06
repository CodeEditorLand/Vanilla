var U=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var M=(a,o,e,t)=>{for(var n=t>1?void 0:t?V(o,e):o,s=a.length-1,i;s>=0;s--)(i=a[s])&&(n=(t?i(o,e,n):i(n))||n);return t&&n&&U(o,e,n),n},N=(a,o)=>(e,t)=>o(e,t,a);import{coalesce as F,tail as K}from"../../../../../vs/base/common/arrays.js";import"../../../../../vs/base/common/collections.js";import{Emitter as I}from"../../../../../vs/base/common/event.js";import{visit as z}from"../../../../../vs/base/common/json.js";import{Disposable as B}from"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/base/common/uri.js";import"../../../../../vs/editor/common/core/editOperation.js";import{Range as D}from"../../../../../vs/editor/common/core/range.js";import{Selection as $}from"../../../../../vs/editor/common/core/selection.js";import"../../../../../vs/editor/common/model.js";import"../../../../../vs/editor/common/services/resolverService.js";import*as T from"../../../../../vs/nls.js";import{ConfigurationTarget as v,IConfigurationService as J}from"../../../../../vs/platform/configuration/common/configuration.js";import{ConfigurationScope as H,Extensions as A,OVERRIDE_PROPERTY_REGEX as E}from"../../../../../vs/platform/configuration/common/configurationRegistry.js";import{IKeybindingService as q}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{Registry as W}from"../../../../../vs/platform/registry/common/platform.js";import{EditorModel as X}from"../../../../../vs/workbench/common/editor/editorModel.js";import{FOLDER_SCOPES as Y,WORKSPACE_SCOPES as Q}from"../../../../../vs/workbench/services/configuration/common/configuration.js";import{SettingMatchType as Z}from"../../../../../vs/workbench/services/preferences/common/preferences.js";import{createValidator as ee}from"../../../../../vs/workbench/services/preferences/common/preferencesValidation.js";const h={startLineNumber:-1,startColumn:-1,endLineNumber:-1,endColumn:-1};function O(a){return a.startLineNumber===-1&&a.startColumn===-1&&a.endLineNumber===-1&&a.endColumn===-1}class k extends X{_currentResultGroups=new Map;updateResultGroup(o,e){return e?this._currentResultGroups.set(o,e):this._currentResultGroups.delete(o),this.removeDuplicateResults(),this.update()}removeDuplicateResults(){const o=new Set;[...this._currentResultGroups.keys()].sort((e,t)=>this._currentResultGroups.get(e).order-this._currentResultGroups.get(t).order).forEach(e=>{const t=this._currentResultGroups.get(e);t.result.filterMatches=t.result.filterMatches.filter(n=>!o.has(n.setting.key)),t.result.filterMatches.forEach(n=>o.add(n.setting.key))})}filterSettings(o,e,t){const n=this.filterGroups,s=[];for(const i of n){const u=e(i);for(const r of i.sections)for(const g of r.settings){const f=t(g,i);(u||f)&&s.push({setting:g,matches:f&&f.matches,matchType:f?.matchType??Z.None,score:f?.score??0})}}return s}getPreference(o){for(const e of this.settingsGroups)for(const t of e.sections)for(const n of t.settings)if(o===n.key)return n}collectMetadata(o){const e=Object.create(null);let t=!1;return o.forEach(n=>{n.result.metadata&&(e[n.id]=n.result.metadata,t=!0)}),t?e:null}get filterGroups(){return this.settingsGroups}}class te extends k{constructor(e,t){super();this._configurationTarget=t;this.settingsModel=e.object.textEditorModel,this._register(this.onWillDispose(()=>e.dispose())),this._register(this.settingsModel.onDidChangeContent(()=>{this._settingsGroups=void 0,this._onDidChangeGroups.fire()}))}_settingsGroups;settingsModel;_onDidChangeGroups=this._register(new I);onDidChangeGroups=this._onDidChangeGroups.event;get uri(){return this.settingsModel.uri}get configurationTarget(){return this._configurationTarget}get settingsGroups(){return this._settingsGroups||this.parse(),this._settingsGroups}get content(){return this.settingsModel.getValue()}findValueMatches(e,t){return this.settingsModel.findMatches(e,t.valueRange,!1,!1,null,!1).map(n=>n.range)}isSettingsProperty(e,t){return t.length===0}parse(){this._settingsGroups=j(this.settingsModel,(e,t)=>this.isSettingsProperty(e,t))}update(){const e=[...this._currentResultGroups.values()];if(!e.length)return;const t=[],n=[];e.forEach(r=>{r.result.filterMatches.forEach(g=>{t.push(g.setting),g.matches&&n.push(...g.matches)})});let s;const i=this.settingsGroups[0];i&&(s={id:i.id,range:i.range,sections:[{settings:t}],title:i.title,titleRange:i.titleRange,order:i.order,extensionInfo:i.extensionInfo});const u=this.collectMetadata(e);return{allGroups:this.settingsGroups,filteredGroups:s?[s]:[],matches:n,metadata:u}}}let C=class extends k{constructor(e,t){super();this._defaultSettings=e;this._register(t.onDidChangeConfiguration(n=>{n.source===v.DEFAULT&&(this.dirty=!0,this._onDidChangeGroups.fire())})),this._register(W.as(A.Configuration).onDidSchemaChange(n=>{this.dirty=!0,this._onDidChangeGroups.fire()}))}_onDidChangeGroups=this._register(new I);onDidChangeGroups=this._onDidChangeGroups.event;additionalGroups=[];dirty=!1;get filterGroups(){return this.settingsGroups.slice(1)}get settingsGroups(){const e=this._defaultSettings.getSettingsGroups(this.dirty);return this.dirty=!1,[...e,...this.additionalGroups]}setAdditionalGroups(e){this.additionalGroups=e}findValueMatches(e,t){return[]}update(){throw new Error("Not supported")}};C=M([N(1,J)],C);function j(a,o){const e=[];let t=null,n=null,s=[];const i=[];let u=-1;const r={startLineNumber:0,startColumn:0,endLineNumber:0,endColumn:0};function g(d,c,l){if(Array.isArray(s)?s.push(d):n&&(s[n]=d),i.length===u+1||i.length===u+2&&t!==null){const p=i.length===u+1?e[e.length-1]:t.overrides[t.overrides.length-1];if(p){const m=a.getPositionAt(c),S=a.getPositionAt(c+l);p.value=d,p.valueRange={startLineNumber:m.lineNumber,startColumn:m.column,endLineNumber:S.lineNumber,endColumn:S.column},p.range=Object.assign(p.range,{endLineNumber:S.lineNumber,endColumn:S.column})}}}const f={onObjectBegin:(d,c)=>{if(o(n,i)){u=i.length;const p=a.getPositionAt(d);r.startLineNumber=p.lineNumber,r.startColumn=p.column}const l={};g(l,d,c),s=l,n=null,i.push(s)},onObjectProperty:(d,c,l)=>{if(n=d,i.length===u+1||i.length===u+2&&t!==null){const p=a.getPositionAt(c),m={description:[],descriptionIsMarkdown:!1,key:d,keyRange:{startLineNumber:p.lineNumber,startColumn:p.column+1,endLineNumber:p.lineNumber,endColumn:p.column+l},range:{startLineNumber:p.lineNumber,startColumn:p.column,endLineNumber:0,endColumn:0},value:null,valueRange:h,descriptionRanges:[],overrides:[],overrideOf:t??void 0};i.length===u+1?(e.push(m),E.test(d)&&(t=m)):t.overrides.push(m)}},onObjectEnd:(d,c)=>{if(s=i.pop(),u!==-1&&(i.length===u+1||i.length===u+2&&t!==null)){const l=i.length===u+1?e[e.length-1]:t.overrides[t.overrides.length-1];if(l){const p=a.getPositionAt(d+c);l.valueRange=Object.assign(l.valueRange,{endLineNumber:p.lineNumber,endColumn:p.column}),l.range=Object.assign(l.range,{endLineNumber:p.lineNumber,endColumn:p.column})}i.length===u+1&&(t=null)}if(i.length===u){const l=a.getPositionAt(d);r.endLineNumber=l.lineNumber,r.endColumn=l.column,u=-1}},onArrayBegin:(d,c)=>{const l=[];g(l,d,c),i.push(s),s=l,n=null},onArrayEnd:(d,c)=>{if(s=i.pop(),i.length===u+1||i.length===u+2&&t!==null){const l=i.length===u+1?e[e.length-1]:t.overrides[t.overrides.length-1];if(l){const p=a.getPositionAt(d+c);l.valueRange=Object.assign(l.valueRange,{endLineNumber:p.lineNumber,endColumn:p.column}),l.range=Object.assign(l.range,{endLineNumber:p.lineNumber,endColumn:p.column})}}},onLiteralValue:g,onError:d=>{const c=e[e.length-1];c&&(O(c.range)||O(c.keyRange)||O(c.valueRange))&&e.pop()}};return a.isDisposed()||z(a.getValue(),f),e.length>0?[{sections:[{settings:e}],title:"",titleRange:h,range:r}]:[]}class qe extends te{_configurationGroups=[];get configurationGroups(){return this._configurationGroups}parse(){super.parse(),this._configurationGroups=j(this.settingsModel,(o,e)=>e.length===0)}isSettingsProperty(o,e){return o==="settings"&&e.length===1}}class Xe extends B{constructor(e,t,n){super();this._mostCommonlyUsedSettingsKeys=e;this.target=t;this.configurationService=n;this._register(n.onDidChangeConfiguration(s=>{s.source===v.DEFAULT&&(this.reset(),this._onDidChange.fire())}))}_allSettingsGroups;_content;_contentWithoutMostCommonlyUsed;_settingsByName=new Map;_onDidChange=this._register(new I);onDidChange=this._onDidChange.event;getContent(e=!1){return(!this._content||e)&&this.initialize(),this._content}getContentWithoutMostCommonlyUsed(e=!1){return(!this._contentWithoutMostCommonlyUsed||e)&&this.initialize(),this._contentWithoutMostCommonlyUsed}getSettingsGroups(e=!1){return(!this._allSettingsGroups||e)&&this.initialize(),this._allSettingsGroups}initialize(){this._allSettingsGroups=this.parse(),this._content=this.toContent(this._allSettingsGroups,0),this._contentWithoutMostCommonlyUsed=this.toContent(this._allSettingsGroups,1)}reset(){this._content=void 0,this._contentWithoutMostCommonlyUsed=void 0,this._allSettingsGroups=void 0}parse(){const e=this.getRegisteredGroups();return this.initAllSettingsMap(e),[this.getMostCommonlyUsedSettings(),...e]}getRegisteredGroups(){const e=W.as(A.Configuration).getConfigurations().slice(),t=this.removeEmptySettingsGroups(e.sort(this.compareConfigurationNodes).reduce((n,s,i,u)=>this.parseConfig(s,n,u),[]));return this.sortGroups(t)}sortGroups(e){return e.forEach(t=>{t.sections.forEach(n=>{n.settings.sort((s,i)=>s.key.localeCompare(i.key))})}),e}initAllSettingsMap(e){this._settingsByName=new Map;for(const t of e)for(const n of t.sections)for(const s of n.settings)this._settingsByName.set(s.key,s)}getMostCommonlyUsedSettings(){const e=F(this._mostCommonlyUsedSettingsKeys.map(t=>{const n=this._settingsByName.get(t);return n?{description:n.description,key:n.key,value:n.value,keyRange:h,range:h,valueRange:h,overrides:[],scope:H.RESOURCE,type:n.type,enum:n.enum,enumDescriptions:n.enumDescriptions,descriptionRanges:[]}:null}));return{id:"mostCommonlyUsed",range:h,title:T.localize("commonlyUsed","Commonly Used"),titleRange:h,sections:[{settings:e}]}}parseConfig(e,t,n,s,i){i=i||{};let u=e.title;if(!u){const r=n.find(g=>g.id===e.id&&g.title);r&&(u=r.title)}if(u&&(s?s.sections[s.sections.length-1].title=u:(s=t.find(r=>r.title===u&&r.extensionInfo?.id===e.extensionInfo?.id),s||(s={sections:[{settings:[]}],id:e.id||"",title:u||"",titleRange:h,order:e.order,range:h,extensionInfo:e.extensionInfo},t.push(s)))),e.properties){s||(s={sections:[{settings:[]}],id:e.id||"",title:e.id||"",titleRange:h,order:e.order,range:h,extensionInfo:e.extensionInfo},t.push(s));const r=[];for(const g of[...s.sections[s.sections.length-1].settings,...this.parseSettings(e)])i[g.key]||(r.push(g),i[g.key]=!0);r.length&&(s.sections[s.sections.length-1].settings=r)}return e.allOf?.forEach(r=>this.parseConfig(r,t,n,s,i)),t}removeEmptySettingsGroups(e){const t=[];for(const n of e)n.sections=n.sections.filter(s=>s.settings.length>0),n.sections.length&&t.push(n);return t}parseSettings(e){const t=[],n=e.properties,s=e.extensionInfo,i=e.extensionInfo?.id===e.id?e.title:e.id;for(const u in n){const r=n[u];if(this.matchesScope(r)){const g=r.default;let f=r.markdownDescription||r.description||"";typeof f!="string"&&(f="");const d=f.split(`
`),c=E.test(u)?this.parseOverrideSettings(r.default):[];let l;r.type==="array"&&r.items&&!Array.isArray(r.items)&&r.items.type&&(r.items.enum?l="enum":Array.isArray(r.items.type)||(l=r.items.type));const p=r.type==="object"?r.properties:void 0,m=r.type==="object"?r.patternProperties:void 0,S=r.type==="object"?r.additionalProperties:void 0;let G=r.enum,_=r.markdownEnumDescriptions??r.enumDescriptions,R=!!r.markdownEnumDescriptions;l==="enum"&&!Array.isArray(r.items)&&(G=r.items.enum,_=r.items.markdownEnumDescriptions??r.items.enumDescriptions,R=!!r.items.markdownEnumDescriptions);let P=!1;r.type==="object"&&!r.additionalProperties&&r.properties&&Object.keys(r.properties).length&&(P=Object.keys(r.properties).every(y=>r.properties[y].type==="boolean"));let L=!1;E.test(u)&&(L=!0);let w;if(!L){const y=r;y&&y.defaultValueSource&&(w=y.defaultValueSource)}!G&&(r.enumItemLabels||_||R)&&console.error(`The setting ${u} has enum-related fields, but doesn't have an enum field. This setting may render improperly in the Settings editor.`),t.push({key:u,value:g,description:d,descriptionIsMarkdown:!!r.markdownDescription,range:h,keyRange:h,valueRange:h,descriptionRanges:[],overrides:c,scope:r.scope,type:r.type,arrayItemType:l,objectProperties:p,objectPatternProperties:m,objectAdditionalProperties:S,enum:G,enumDescriptions:_,enumDescriptionsAreMarkdown:R,enumItemLabels:r.enumItemLabels,uniqueItems:r.uniqueItems,tags:r.tags,disallowSyncIgnore:r.disallowSyncIgnore,restricted:r.restricted,extensionInfo:s,deprecationMessage:r.markdownDeprecationMessage||r.deprecationMessage,deprecationMessageIsMarkdown:!!r.markdownDeprecationMessage,validator:ee(r),allKeysAreBoolean:P,editPresentation:r.editPresentation,order:r.order,nonLanguageSpecificDefaultValueSource:w,isLanguageTagSetting:L,categoryLabel:i})}}return t}parseOverrideSettings(e){return Object.keys(e).map(t=>({key:t,value:e[t],description:[],descriptionIsMarkdown:!1,range:h,keyRange:h,valueRange:h,descriptionRanges:[],overrides:[]}))}matchesScope(e){return e.scope?this.target===v.WORKSPACE_FOLDER?Y.indexOf(e.scope)!==-1:this.target===v.WORKSPACE?Q.indexOf(e.scope)!==-1:!0:!0}compareConfigurationNodes(e,t){if(typeof e.order!="number")return 1;if(typeof t.order!="number")return-1;if(e.order===t.order){const n=e.title||"",s=t.title||"";return n.localeCompare(s)}return e.order-t.order}toContent(e,t){const n=new x;for(let s=t;s<e.length;s++)n.pushGroup(e[s],s===t,s===e.length-1);return n.getContent()}}class Ye extends k{constructor(e,t,n){super();this._uri=e;this.defaultSettings=n;this._register(n.onDidChange(()=>this._onDidChangeGroups.fire())),this._model=t.object.textEditorModel,this._register(this.onWillDispose(()=>t.dispose()))}_model;_onDidChangeGroups=this._register(new I);onDidChangeGroups=this._onDidChangeGroups.event;get uri(){return this._uri}get target(){return this.defaultSettings.target}get settingsGroups(){return this.defaultSettings.getSettingsGroups()}get filterGroups(){return this.settingsGroups.slice(1)}update(){if(this._model.isDisposed())return;const e=[...this._currentResultGroups.values()].sort((r,g)=>r.order-g.order),t=e.filter(r=>r.result.filterMatches.length),n=K(this.settingsGroups).range.endLineNumber+2,{settingsGroups:s,matches:i}=this.writeResultGroups(t,n),u=this.collectMetadata(e);return e.length?{allGroups:this.settingsGroups,filteredGroups:s,matches:i,metadata:u}:void 0}writeResultGroups(e,t){const n=t-1,s=new x(n),i=[],u=[];e.length&&(s.pushLine(","),e.forEach(l=>{const p=this.getGroup(l);i.push(p),u.push(...this.writeSettingsGroupToBuilder(s,p,l.result.filterMatches))}));const r=s.getContent()+`
`,g=this._model.getLineCount(),f=new $(t,1,t,1),d={text:r,forceMoveMarkers:!0,range:new D(t,1,g,1)};this._model.pushEditOperations([f],[d],()=>[f]);const c=Math.min(t+60,this._model.getLineCount());return this._model.tokenization.forceTokenization(c),{matches:u,settingsGroups:i}}writeSettingsGroupToBuilder(e,t,n){return n=n.map(i=>({setting:i.setting,score:i.score,matches:i.matches&&i.matches.map(u=>new D(u.startLineNumber-i.setting.range.startLineNumber,u.startColumn,u.endLineNumber-i.setting.range.startLineNumber,u.endColumn))})),e.pushGroup(t),n.map(i=>i.matches||[]).flatMap((i,u)=>{const r=t.sections[0].settings[u];return i.map(g=>new D(g.startLineNumber+r.range.startLineNumber,g.startColumn,g.endLineNumber+r.range.startLineNumber,g.endColumn))})}copySetting(e){return{description:e.description,scope:e.scope,type:e.type,enum:e.enum,enumDescriptions:e.enumDescriptions,key:e.key,value:e.value,range:e.range,overrides:[],overrideOf:e.overrideOf,tags:e.tags,deprecationMessage:e.deprecationMessage,keyRange:h,valueRange:h,descriptionIsMarkdown:void 0,descriptionRanges:[]}}findValueMatches(e,t){return[]}getPreference(e){for(const t of this.settingsGroups)for(const n of t.sections)for(const s of n.settings)if(s.key===e)return s}getGroup(e){return{id:e.id,range:h,title:e.label,titleRange:h,sections:[{settings:e.result.filterMatches.map(t=>this.copySetting(t.setting))}]}}}class x{constructor(o=0){this._rangeOffset=o;this._contentByLines=[]}_contentByLines;get lineCountWithOffset(){return this._contentByLines.length+this._rangeOffset}get lastLine(){return this._contentByLines[this._contentByLines.length-1]||""}pushLine(...o){this._contentByLines.push(...o)}pushGroup(o,e,t){this._contentByLines.push(e?"[{":"{");const n=this._pushGroup(o,"  ");if(n){const s=n.range.endLineNumber-this._rangeOffset,i=this._contentByLines[s-2];this._contentByLines[s-2]=i.substring(0,i.length-1)}this._contentByLines.push(t?"}]":"},")}_pushGroup(o,e){let t=null;const n=this.lineCountWithOffset+1;for(const s of o.sections){if(s.title){const i=this.lineCountWithOffset+1;this.addDescription([s.title],e,this._contentByLines),s.titleRange={startLineNumber:i,startColumn:1,endLineNumber:this.lineCountWithOffset,endColumn:this.lastLine.length}}if(s.settings.length)for(const i of s.settings)this.pushSetting(i,e),t=i}return o.range={startLineNumber:n,startColumn:1,endLineNumber:this.lineCountWithOffset,endColumn:this.lastLine.length},t}getContent(){return this._contentByLines.join(`
`)}pushSetting(o,e){const t=this.lineCountWithOffset+1;this.pushSettingDescription(o,e);let n=e;const s=JSON.stringify(o.key);n+=s,o.keyRange={startLineNumber:this.lineCountWithOffset+1,startColumn:n.indexOf(o.key)+1,endLineNumber:this.lineCountWithOffset+1,endColumn:o.key.length},n+=": ";const i=this.lineCountWithOffset+1;this.pushValue(o,n,e),o.valueRange={startLineNumber:i,startColumn:n.length+1,endLineNumber:this.lineCountWithOffset,endColumn:this.lastLine.length+1},this._contentByLines[this._contentByLines.length-1]+=",",this._contentByLines.push(""),o.range={startLineNumber:t,startColumn:1,endLineNumber:this.lineCountWithOffset,endColumn:this.lastLine.length}}pushSettingDescription(o,e){const t=i=>i.replace(/`#(.*)#`/g,(u,r)=>`\`${r}\``);o.descriptionRanges=[];const n=e+"// ",s=o.deprecationMessage?.split(/\n/g)??[];for(let i of[...s,...o.description])i=t(i),this._contentByLines.push(n+i),o.descriptionRanges.push({startLineNumber:this.lineCountWithOffset,startColumn:this.lastLine.indexOf(i)+1,endLineNumber:this.lineCountWithOffset,endColumn:this.lastLine.length});o.enum&&o.enumDescriptions?.some(i=>!!i)&&o.enumDescriptions.forEach((i,u)=>{const r=ie(String(o.enum[u])),g=i?`${r}: ${t(i)}`:r,f=g.split(/\n/g);f[0]=" - "+f[0],this._contentByLines.push(...f.map(d=>`${e}// ${d}`)),o.descriptionRanges.push({startLineNumber:this.lineCountWithOffset,startColumn:this.lastLine.indexOf(g)+1,endLineNumber:this.lineCountWithOffset,endColumn:this.lastLine.length})})}pushValue(o,e,t){const n=JSON.stringify(o.value,null,t);if(n&&typeof o.value=="object")if(o.overrides&&o.overrides.length){this._contentByLines.push(e+" {");for(const u of o.overrides)this.pushSetting(u,t+t),this._contentByLines.pop();const s=o.overrides[o.overrides.length-1],i=this._contentByLines[s.range.endLineNumber-2];this._contentByLines[s.range.endLineNumber-2]=i.substring(0,i.length-1),this._contentByLines.push(t+"}")}else{const s=n.split(`
`);this._contentByLines.push(e+s[0]);for(let i=1;i<s.length;i++)this._contentByLines.push(t+s[i])}else this._contentByLines.push(e+n)}addDescription(o,e,t){for(const n of o)t.push(e+"// "+n)}}class ne extends x{constructor(e="	"){super(0);this.indent=e}pushGroup(e){this._pushGroup(e,this.indent)}}class Qe extends B{constructor(e){super();this.defaultSettings=e;this._register(e.onDidChange(()=>{this._content=null,this._onDidContentChanged.fire()}))}_content=null;_onDidContentChanged=this._register(new I);onDidContentChanged=this._onDidContentChanged.event;get content(){if(this._content===null){const e=new ne;e.pushLine("{");for(const t of this.defaultSettings.getRegisteredGroups())e.pushGroup(t);e.pushLine("}"),this._content=e.getContent()}return this._content}}function ie(a){return a&&a.replace(/\n/g,"\\n").replace(/\r/g,"\\r")}function se(a){return"// "+T.localize("defaultKeybindingsHeader","Override key bindings by placing them into your key bindings file.")+`
`+a.getDefaultKeybindingsContent()}let b=class{constructor(o,e){this._uri=o;this.keybindingService=e}_content;get uri(){return this._uri}get content(){return this._content||(this._content=se(this.keybindingService)),this._content}getPreference(){return null}dispose(){}};b=M([N(1,q)],b);export{b as DefaultKeybindingsEditorModel,Qe as DefaultRawSettingsEditorModel,Xe as DefaultSettings,Ye as DefaultSettingsEditorModel,C as Settings2EditorModel,te as SettingsEditorModel,qe as WorkspaceConfigurationEditorModel,se as defaultKeybindingsContents,h as nullRange};
