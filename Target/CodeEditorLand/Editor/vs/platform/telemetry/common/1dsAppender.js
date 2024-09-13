import{importAMDNodeModule as m}from"../../../amdX.js";import{onUnexpectedError as c}from"../../../base/common/errors.js";import{mixin as f}from"../../../base/common/objects.js";import{isWeb as p}from"../../../base/common/platform.js";import{validateTelemetryData as h}from"./telemetryUtils.js";const d="https://mobile.events.data.microsoft.com/OneCollector/1.0",u="https://mobile.events.data.microsoft.com/ping";async function g(a,i,e){const o=p?await m("@microsoft/1ds-core-js","bundle/ms.core.min.js"):await import("@microsoft/1ds-core-js"),r=p?await m("@microsoft/1ds-post-js","bundle/ms.post.min.js"):await import("@microsoft/1ds-post-js"),n=new o.AppInsightsCore,l=new r.PostChannel,s={instrumentationKey:a,endpointUrl:d,loggingLevelTelemetry:0,loggingLevelConsole:0,disableCookiesUsage:!0,disableDbgExt:!0,disableInstrumentationKeyValidation:!0,channels:[[l]]};if(e){s.extensionConfig={};const t={alwaysUseXhrOverride:!0,ignoreMc1Ms0CookieProcessing:!0,httpXHROverride:e};s.extensionConfig[l.identifier]=t}return n.initialize(s,[]),n.addTelemetryInitializer(t=>{t.ext=t.ext??{},t.ext.web=t.ext.web??{},t.ext.web.consentDetails='{"GPC_DataSharingOptIn":false}',i&&(t.ext.utc=t.ext.utc??{},t.ext.utc.flags=8462029)}),n}class A{constructor(i,e,o,r,n){this._isInternalTelemetry=i;this._eventPrefix=e;this._defaultData=o;this._xhrOverride=n;this._defaultData||(this._defaultData={}),typeof r=="function"?this._aiCoreOrKey=r():this._aiCoreOrKey=r,this._asyncAiCore=null}_aiCoreOrKey;_asyncAiCore;endPointUrl=d;endPointHealthUrl=u;_withAIClient(i){if(this._aiCoreOrKey){if(typeof this._aiCoreOrKey!="string"){i(this._aiCoreOrKey);return}this._asyncAiCore||(this._asyncAiCore=g(this._aiCoreOrKey,this._isInternalTelemetry,this._xhrOverride)),this._asyncAiCore.then(e=>{i(e)},e=>{c(e)})}}log(i,e){if(!this._aiCoreOrKey)return;e=f(e,this._defaultData),e=h(e);const o=this._eventPrefix+"/"+i;try{this._withAIClient(r=>{r.pluginVersionString=e?.properties.version??"Unknown",r.track({name:o,baseData:{name:o,properties:e?.properties,measurements:e?.measurements}})})}catch{}}flush(){return this._aiCoreOrKey?new Promise(i=>{this._withAIClient(e=>{e.unload(!0,()=>{this._aiCoreOrKey=void 0,i(void 0)})})}):Promise.resolve(void 0)}}export{A as AbstractOneDataSystemAppender};
