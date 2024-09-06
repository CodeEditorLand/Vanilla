var G=Object.defineProperty;var M=Object.getOwnPropertyDescriptor;var I=(s,i,e,t)=>{for(var n=t>1?void 0:t?M(i,e):i,r=s.length-1,a;r>=0;r--)(a=s[r])&&(n=(t?a(i,e,n):a(n))||n);return t&&n&&G(i,e,n),n},d=(s,i)=>(e,t)=>i(e,t,s);import*as x from"../../../../../vs/base/common/arrays.js";import{Emitter as U}from"../../../../../vs/base/common/event.js";import"../../../../../vs/base/common/jsonSchema.js";import{Disposable as F}from"../../../../../vs/base/common/lifecycle.js";import{escapeRegExpCharacters as W,isFalsyOrWhitespace as B}from"../../../../../vs/base/common/strings.js";import{isUndefinedOrNull as b}from"../../../../../vs/base/common/types.js";import{URI as L}from"../../../../../vs/base/common/uri.js";import{ILanguageService as O}from"../../../../../vs/editor/common/languages/language.js";import{ConfigurationTarget as c}from"../../../../../vs/platform/configuration/common/configuration.js";import{ConfigurationScope as V,EditPresentationTypes as $,Extensions as K}from"../../../../../vs/platform/configuration/common/configurationRegistry.js";import{IProductService as A}from"../../../../../vs/platform/product/common/productService.js";import{Registry as z}from"../../../../../vs/platform/registry/common/platform.js";import"../../../../../vs/workbench/contrib/preferences/browser/preferencesWidgets.js";import{knownAcronyms as j,knownTermMappings as Q,tocData as X}from"../../../../../vs/workbench/contrib/preferences/browser/settingsLayout.js";import{compareTwoNullableNumbers as N,ENABLE_EXTENSION_TOGGLE_SETTINGS as H,ENABLE_LANGUAGE_FILTER as J,MODIFIED_SETTING_TAG as R,POLICY_SETTING_TAG as _,REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG as Y}from"../../../../../vs/workbench/contrib/preferences/common/preferences.js";import{APPLICATION_SCOPES as Z,FOLDER_SCOPES as q,IWorkbenchConfigurationService as k,LOCAL_MACHINE_SCOPES as ee,REMOTE_MACHINE_SCOPES as te,WORKSPACE_SCOPES as ie}from"../../../../../vs/workbench/services/configuration/common/configuration.js";import{IWorkbenchEnvironmentService as se}from"../../../../../vs/workbench/services/environment/common/environmentService.js";import{SettingMatchType as ne,SettingValueType as g}from"../../../../../vs/workbench/services/preferences/common/preferences.js";import{IUserDataProfileService as D}from"../../../../../vs/workbench/services/userDataProfile/common/userDataProfile.js";const qe="usesOnlineServices";class C extends F{id;parent;_tabbable=!1;_onDidChangeTabbable=new U;onDidChangeTabbable=this._onDidChangeTabbable.event;constructor(i){super(),this.id=i}get tabbable(){return this._tabbable}set tabbable(i){this._tabbable=i,this._onDidChangeTabbable.fire()}}class w extends C{count;label;level;isFirstGroup;_childSettingKeys=new Set;_children=[];get children(){return this._children}set children(i){this._children=i,this._childSettingKeys=new Set,this._children.forEach(e=>{e instanceof v&&this._childSettingKeys.add(e.setting.key)})}constructor(i,e,t,n,r){super(i),this.count=e,this.label=t,this.level=n,this.isFirstGroup=r}containsSetting(i){return this._childSettingKeys.has(i)}}class re extends C{constructor(e,t){super(e);this.extensionIds=t}}class v extends C{constructor(e,t,n,r,a,l,o,p,h){super(oe(t.id+"_"+e.key));this.settingsTarget=n;this.isWorkspaceTrusted=r;this.languageFilter=a;this.languageService=l;this.productService=o;this.userDataProfileService=p;this.configurationService=h;this.setting=e,this.parent=t,this.initSettingDescription(),this.initSettingValueType()}static MAX_DESC_LINES=20;setting;_displayCategory=null;_displayLabel=null;value;scopeValue;defaultValue;defaultValueSource;isConfigured=!1;isUntrusted=!1;hasPolicyValue=!1;tags;overriddenScopeList=[];overriddenDefaultsLanguageList=[];languageOverrideValues=new Map;description;valueType;get displayCategory(){return this._displayCategory||this.initLabels(),this._displayCategory}get displayLabel(){return this._displayLabel||this.initLabels(),this._displayLabel}initLabels(){if(this.setting.title){this._displayLabel=this.setting.title,this._displayCategory=this.setting.categoryLabel??null;return}const e=ue(this.setting.key,this.parent.id,this.setting.isLanguageTagSetting);this._displayLabel=e.label,this._displayCategory=e.category}initSettingDescription(){if(this.setting.description.length>v.MAX_DESC_LINES){const e=this.setting.description.slice(0,v.MAX_DESC_LINES);e.push("[...]"),this.description=e.join(`
`)}else this.description=this.setting.description.join(`
`)}initSettingValueType(){ce(this.setting,this.productService)?this.valueType=g.ExtensionToggle:this.setting.enum&&(!this.setting.type||me(this.setting.type))?this.valueType=g.Enum:this.setting.type==="string"?this.setting.editPresentation===$.Multiline?this.valueType=g.MultilineString:this.valueType=g.String:he(this.setting)?this.valueType=g.Exclude:pe(this.setting)?this.valueType=g.Include:this.setting.type==="integer"?this.valueType=g.Integer:this.setting.type==="number"?this.valueType=g.Number:this.setting.type==="boolean"?this.valueType=g.Boolean:this.setting.type==="array"&&this.setting.arrayItemType&&["string","enum","number","integer"].includes(this.setting.arrayItemType)?this.valueType=g.Array:Array.isArray(this.setting.type)&&this.setting.type.includes(g.Null)&&this.setting.type.length===2?this.setting.type.includes(g.Integer)?this.valueType=g.NullableInteger:this.setting.type.includes(g.Number)?this.valueType=g.NullableNumber:this.valueType=g.Complex:Se(this.setting)?this.setting.allKeysAreBoolean?this.valueType=g.BooleanObject:this.valueType=g.Object:this.setting.isLanguageTagSetting?this.valueType=g.LanguageTag:this.valueType=g.Complex}inspectSelf(){const e=this.getTargetToInspect(this.setting),t=le(this.setting.key,e,this.languageFilter,this.configurationService);this.update(t,this.isWorkspaceTrusted)}getTargetToInspect(e){if(!this.userDataProfileService.currentProfile.isDefault&&!this.userDataProfileService.currentProfile.useDefaultFlags?.settings){if(e.scope===V.APPLICATION)return c.APPLICATION;if(this.configurationService.isSettingAppliedForAllProfiles(e.key)&&this.settingsTarget===c.USER_LOCAL)return c.APPLICATION}return this.settingsTarget}update(e,t){let{isConfigured:n,inspected:r,targetSelector:a,inspectedLanguageOverrides:l,languageSelector:o}=e;switch(a){case"workspaceFolderValue":case"workspaceValue":this.isUntrusted=!!this.setting.restricted&&!t;break}let p=n?r[a]:r.defaultValue;const h=[],S=[];if((o||a!=="workspaceValue")&&typeof r.workspaceValue<"u"&&h.push("workspace:"),(o||a!=="userRemoteValue")&&typeof r.userRemoteValue<"u"&&h.push("remote:"),(o||a!=="userLocalValue")&&typeof r.userLocalValue<"u"&&h.push("user:"),r.overrideIdentifiers)for(const u of r.overrideIdentifiers){const f=l.get(u);f&&(this.languageService.isRegisteredLanguageId(u)&&(o!==u&&typeof f.default?.override<"u"&&S.push(u),(o!==u||a!=="workspaceValue")&&typeof f.workspace?.override<"u"&&h.push(`workspace:${u}`),(o!==u||a!=="userRemoteValue")&&typeof f.userRemote?.override<"u"&&h.push(`remote:${u}`),(o!==u||a!=="userLocalValue")&&typeof f.userLocal?.override<"u"&&h.push(`user:${u}`)),this.languageOverrideValues.set(u,f))}if(this.overriddenScopeList=h,this.overriddenDefaultsLanguageList=S,this.defaultValueSource=this.setting.nonLanguageSpecificDefaultValueSource,r.policyValue)this.hasPolicyValue=!0,n=!1,p=r.policyValue,this.scopeValue=r.policyValue,this.defaultValue=r.defaultValue;else if(o&&this.languageOverrideValues.has(o)){const u=this.languageOverrideValues.get(o);p=(n?u[a]:u.defaultValue)??p,this.scopeValue=n&&u[a],this.defaultValue=u.defaultValue??r.defaultValue;const y=z.as(K.Configuration).getConfigurationDefaultsOverrides().get(`[${o}]`)?.source,m=y instanceof Map?y.get(this.setting.key):void 0;m&&(this.defaultValueSource=m)}else this.scopeValue=n&&r[a],this.defaultValue=r.defaultValue;this.value=p,this.isConfigured=n,(n||this.setting.tags||this.tags||this.setting.restricted||this.hasPolicyValue)&&(this.tags=new Set,n&&this.tags.add(R),this.setting.tags?.forEach(u=>this.tags.add(u)),this.setting.restricted&&this.tags.add(Y),this.hasPolicyValue&&this.tags.add(_))}matchesAllTags(e){return e?.size?(this.tags||this.inspectSelf(),!!this.tags?.size&&Array.from(e).every(t=>this.tags.has(t))):!0}matchesScope(e,t){const n=L.isUri(e)?c.WORKSPACE_FOLDER:e;return this.setting.scope?n===c.APPLICATION?Z.includes(this.setting.scope):n===c.WORKSPACE_FOLDER?q.includes(this.setting.scope):n===c.WORKSPACE?ie.includes(this.setting.scope):n===c.USER_REMOTE?te.includes(this.setting.scope):n===c.USER_LOCAL&&t?ee.includes(this.setting.scope):!0:!0}matchesAnyExtension(e){return!e||!e.size?!0:this.setting.extensionInfo?Array.from(e).some(t=>t.toLowerCase()===this.setting.extensionInfo.id.toLowerCase()):!1}matchesAnyFeature(e){if(!e||!e.size)return!0;const t=X.children.find(n=>n.id==="features");return Array.from(e).some(n=>{if(t&&t.children){const r=t.children.find(a=>"features/"+n===a.id);if(r){const a=r.settings?.map(l=>ae(l));return a&&!this.setting.extensionInfo&&a.some(l=>l.test(this.setting.key.toLowerCase()))}else return!1}else return!1})}matchesAnyId(e){return!e||!e.size?!0:e.has(this.setting.key)}matchesAllLanguages(e){return e?this.languageService.isRegisteredLanguageId(e)?this.setting.scope===V.LANGUAGE_OVERRIDABLE:!1:!0}}function ae(s){return s=W(s).replace(/\\\*/g,".*"),new RegExp(`^${s}$`,"i")}let T=class{constructor(i,e,t,n,r,a){this._viewState=i;this._isWorkspaceTrusted=e;this._configurationService=t;this._languageService=n;this._userDataProfileService=r;this._productService=a}_root;_tocRoot;_treeElementsBySettingName=new Map;get root(){return this._root}update(i=this._tocRoot){this._treeElementsBySettingName.clear();const e=this.createSettingsTreeGroupElement(i);e.children[0]instanceof w&&(e.children[0].isFirstGroup=!0),this._root?(this.disposeChildren(this._root.children),this._root.children=e.children):this._root=e}updateWorkspaceTrust(i){this._isWorkspaceTrusted=i,this.updateRequireTrustedTargetElements()}disposeChildren(i){for(const e of i)this.recursiveDispose(e)}recursiveDispose(i){i instanceof w&&this.disposeChildren(i.children),i.dispose()}getElementsByName(i){return this._treeElementsBySettingName.get(i)??null}updateElementsByName(i){this._treeElementsBySettingName.has(i)&&this.reinspectSettings(this._treeElementsBySettingName.get(i))}updateRequireTrustedTargetElements(){this.reinspectSettings([...this._treeElementsBySettingName.values()].flat().filter(i=>i.isUntrusted))}reinspectSettings(i){for(const e of i)e.inspectSelf()}createSettingsTreeGroupElement(i,e){const t=e?this.getDepth(e)+1:0,n=new w(i.id,void 0,i.label,t,!1);n.parent=e;const r=[];if(i.settings){const a=i.settings.map(l=>this.createSettingsTreeSettingElement(l,n)).filter(l=>l.setting.deprecationMessage?l.isConfigured:!0);r.push(...a)}if(i.children){const a=i.children.map(l=>this.createSettingsTreeGroupElement(l,n));r.push(...a)}return n.children=r,n}getDepth(i){return i.parent?1+this.getDepth(i.parent):0}createSettingsTreeSettingElement(i,e){const t=new v(i,e,this._viewState.settingsTarget,this._isWorkspaceTrusted,this._viewState.languageFilter,this._languageService,this._productService,this._userDataProfileService,this._configurationService),n=this._treeElementsBySettingName.get(i.key)||[];return n.push(t),this._treeElementsBySettingName.set(i.key,n),t}};T=I([d(2,k),d(3,O),d(4,D),d(5,A)],T);function le(s,i,e,t){const n=L.isUri(i)?{resource:i}:void 0,r=t.inspect(s,n),a=i===c.APPLICATION?"applicationValue":i===c.USER_LOCAL?"userLocalValue":i===c.USER_REMOTE?"userRemoteValue":i===c.WORKSPACE?"workspaceValue":"workspaceFolderValue",l=i===c.APPLICATION?"application":i===c.USER_LOCAL?"userLocal":i===c.USER_REMOTE?"userRemote":i===c.WORKSPACE?"workspace":"workspaceFolder";let o=typeof r[a]<"u";const p=r.overrideIdentifiers,h=new Map;if(e&&(o=!1),p){for(const S of p)h.set(S,t.inspect(s,{overrideIdentifier:S}));e&&h.has(e)&&typeof h.get(e)[l]?.override<"u"&&(o=!0)}return{isConfigured:o,inspected:r,targetSelector:a,inspectedLanguageOverrides:h,languageSelector:e}}function oe(s){return s.replace(/[\.\/]/,"_")}function ue(s,i="",e=!1){const t=s.lastIndexOf(".");let n="";t>=0&&(n=s.substring(0,t),s=s.substring(t+1)),i=i.replace(/\//g,"."),n=ge(n,i),n=P(n),e&&(s=s.replace(/[\[\]]/g,""),s="$(bracket) "+s);const r=P(s);return{category:n,label:r}}function P(s){s=s.replace(/\.([a-z0-9])/g,(i,e)=>` \u203A ${e.toUpperCase()}`).replace(/([a-z0-9])([A-Z])/g,"$1 $2").replace(/^[a-z]/g,i=>i.toUpperCase()).replace(/\b\w+\b/g,i=>j.has(i.toLowerCase())?i.toUpperCase():i);for(const[i,e]of Q)s=s.replace(new RegExp(`\\b${i}\\b`,"gi"),e);return s}function ge(s,i){const e=n=>{/insiders$/i.test(s)||(i=i.replace(/-?insiders$/i,""));const r=i.split(".").map(a=>a.replace(/-/g,"").toLowerCase()===s.toLowerCase()?a.replace(/-/g,""):a);for(;r.length;){const a=new RegExp(`^${r.join("\\.")}(\\.|$)`,"i");if(a.test(s))return s.replace(a,"");n?r.pop():r.shift()}return null};let t=e(!0);return t===null&&(t=e(!1)),t===null&&(t=s),t}function ce(s,i){return H&&!!i.extensionRecommendations&&!!s.displayExtensionId}function he(s){return s.key==="files.exclude"||s.key==="search.exclude"||s.key==="workbench.localHistory.exclude"||s.key==="explorer.autoRevealExclude"||s.key==="files.readonlyExclude"||s.key==="files.watcherExclude"}function pe(s){return s.key==="files.readonlyInclude"}function de(s){return s==="workbench.editor.customLabels.patterns"}function fe({type:s},i){return s==="string"||s==="boolean"||s==="integer"||s==="number"?!0:de(i)&&Array.isArray(s)&&s.length===2?s.includes("null")&&(s.includes("string")||s.includes("boolean")||s.includes("integer")||s.includes("number")):!1}function Se({key:s,type:i,objectProperties:e,objectPatternProperties:t,objectAdditionalProperties:n}){if(i!=="object"||b(e)&&b(t)&&b(n)||(n===!0||n===void 0)&&!Object.keys(t??{}).includes(".*"))return!1;const r=[...Object.values(e??{}),...Object.values(t??{})];return n&&typeof n=="object"&&r.push(n),r.map(l=>Array.isArray(l.anyOf)?l.anyOf:[l]).flat().every(l=>fe(l,s))}function me(s){const i=["string","boolean","null","integer","number"];return(Array.isArray(s)?s:[s]).every(t=>i.includes(t))}var ve=(t=>(t[t.Local=0]="Local",t[t.Remote=1]="Remote",t[t.NewExtensions=2]="NewExtensions",t))(ve||{});let E=class extends T{constructor(e,t,n,r,a,l,o,p){super(e,n,r,l,o,p);this.environmentService=a;this.settingsOrderByTocIndex=t,this.update({id:"searchResultModel",label:""})}rawSearchResults=null;cachedUniqueSearchResults=null;newExtensionSearchResults=null;searchResultCount=null;settingsOrderByTocIndex;id="searchResultModel";sortResults(e){if(this.settingsOrderByTocIndex)for(const t of e)t.setting.internalOrder=this.settingsOrderByTocIndex.get(t.setting.key);return this._viewState.query?(e.sort((t,n)=>t.matchType!==n.matchType?n.matchType-t.matchType:t.matchType===ne.RemoteMatch?n.score-t.score:N(t.setting.internalOrder,n.setting.internalOrder)),x.distinct(e,t=>t.setting.key)):e.sort((t,n)=>N(t.setting.internalOrder,n.setting.internalOrder))}getUniqueResults(){if(this.cachedUniqueSearchResults)return this.cachedUniqueSearchResults;if(!this.rawSearchResults)return null;let e=[];const t=new Set,n=this.rawSearchResults[0];n&&(n.filterMatches.forEach(a=>t.add(a.setting.key)),e=n.filterMatches);const r=this.rawSearchResults[1];return r&&(r.filterMatches=r.filterMatches.filter(a=>!t.has(a.setting.key)),e=e.concat(r.filterMatches),this.newExtensionSearchResults=this.rawSearchResults[2]),e=this.sortResults(e),this.cachedUniqueSearchResults={filterMatches:e,exactMatch:n?.exactMatch||r?.exactMatch},this.cachedUniqueSearchResults}getRawResults(){return this.rawSearchResults||[]}setResult(e,t){if(this.cachedUniqueSearchResults=null,this.newExtensionSearchResults=null,this.rawSearchResults=this.rawSearchResults||[],!t){delete this.rawSearchResults[e];return}t.exactMatch&&(this.rawSearchResults=[]),this.rawSearchResults[e]=t,this.updateChildren()}updateChildren(){this.update({id:"searchResultModel",label:"searchResultModel",settings:this.getFlatSettings()});const e=!!this.environmentService.remoteAuthority;if(this.root.children=this.root.children.filter(t=>t instanceof v&&t.matchesAllTags(this._viewState.tagFilters)&&t.matchesScope(this._viewState.settingsTarget,e)&&t.matchesAnyExtension(this._viewState.extensionFilters)&&t.matchesAnyId(this._viewState.idFilters)&&t.matchesAnyFeature(this._viewState.featureFilters)&&t.matchesAllLanguages(this._viewState.languageFilter)),this.searchResultCount=this.root.children.length,this.newExtensionSearchResults?.filterMatches.length){let t=this.newExtensionSearchResults.filterMatches.map(n=>n.setting).filter(n=>n.extensionName&&n.extensionPublisher).map(n=>`${n.extensionPublisher}.${n.extensionName}`);if(t=x.distinct(t),t.length){const n=new re("newExtensions",t);n.parent=this._root,this._root.children.push(n)}}}getUniqueResultsCount(){return this.searchResultCount??0}getFlatSettings(){return this.getUniqueResults()?.filterMatches.map(e=>e.setting)??[]}};E=I([d(3,k),d(4,se),d(5,O),d(6,D),d(7,A)],E);const ye=/(^|\s)@tag:("([^"]*)"|[^"]\S*)/g,Te=/(^|\s)@ext:("([^"]*)"|[^"]\S*)?/g,Ee=/(^|\s)@feature:("([^"]*)"|[^"]\S*)?/g,Ie=/(^|\s)@id:("([^"]*)"|[^"]\S*)?/g,be=/(^|\s)@lang:("([^"]*)"|[^"]\S*)?/g;function et(s){function i(l,o,p){return l.replace(o,(h,S,u,f)=>{const y=f||u;return y&&p.push(...y.split(",").map(m=>m.trim()).filter(m=>!B(m))),""})}const e=[];s=s.replace(ye,(l,o,p,h)=>(e.push(h||p),"")),s=s.replace(`@${R}`,()=>(e.push(R),"")),s=s.replace(`@${_}`,()=>(e.push(_),""));const t=[],n=[],r=[],a=[];return s=i(s,Te,t),s=i(s,Ee,n),s=i(s,Ie,r),J&&(s=i(s,be,a)),s=s.trim(),{tags:e,extensionFilters:t,featureFilters:n,idFilters:r,languageFilter:a.length?a[0]:void 0,query:s}}export{qe as ONLINE_SERVICES_SETTING_TAG,ve as SearchResultIdx,E as SearchResultModel,C as SettingsTreeElement,w as SettingsTreeGroupElement,T as SettingsTreeModel,re as SettingsTreeNewExtensionsElement,v as SettingsTreeSettingElement,le as inspectSetting,de as objectSettingSupportsRemoveDefaultValue,et as parseQuery,ue as settingKeyToDisplayFormat};