import e from"assert";import"../../../../../base/common/actions.js";import{URI as c}from"../../../../../base/common/uri.js";import{ensureNoDisposablesAreLeakedInTestSuite as S}from"../../../../../base/test/common/utils.js";import{ConfigurationScope as g,Extensions as u}from"../../../../../platform/configuration/common/configurationRegistry.js";import{TestConfigurationService as f}from"../../../../../platform/configuration/test/common/testConfigurationService.js";import"../../../../../platform/contextview/browser/contextView.js";import{Registry as p}from"../../../../../platform/registry/common/platform.js";import{SimpleSettingRenderer as d}from"../../browser/markdownSettingRenderer.js";import"../../../../services/preferences/common/preferences.js";const m={id:"examples",title:"Examples",type:"object",properties:{"example.booleanSetting":{type:"boolean",default:!1,scope:g.APPLICATION},"example.booleanSetting2":{type:"boolean",default:!0,scope:g.APPLICATION},"example.stringSetting":{type:"string",default:"one",scope:g.APPLICATION},"example.numberSetting":{type:"number",default:3,scope:g.APPLICATION}}};class x extends f{async updateValue(a,l){const[i,t]=a.split(".");return this.setUserConfiguration(i,{[t]:l})}}suite("Markdown Setting Renderer Test",()=>{S();let r,a,l,i;suiteSetup(()=>{r=new x,a={getSetting:t=>{let n="boolean";return t.includes("string")&&(n="string"),{type:n,key:t}}},l={},p.as(u.Configuration).registerConfiguration(m),i=new d(r,l,a,{publicLog2:()=>{}},{writeText:async()=>{}})}),suiteTeardown(()=>{p.as(u.Configuration).deregisterConfigurations([m])}),test("render code setting button with value",()=>{const s=i.getHtmlRenderer()({block:!1,raw:'<a href="code-oss://settings/example.booleanSetting" codesetting="true">',pre:!1,text:"",type:"html"});e.strictEqual(s,`<code tabindex="0"><a href="code-setting://example.booleanSetting/true" class="codesetting" title="View or change setting" aria-role="button"><svg width="14" height="14" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M9.1 4.4L8.6 2H7.4l-.5 2.4-.7.3-2-1.3-.9.8 1.3 2-.2.7-2.4.5v1.2l2.4.5.3.8-1.3 2 .8.8 2-1.3.8.3.4 2.3h1.2l.5-2.4.8-.3 2 1.3.8-.8-1.3-2 .3-.8 2.3-.4V7.4l-2.4-.5-.3-.8 1.3-2-.8-.8-2 1.3-.7-.2zM9.4 1l.5 2.4L12 2.1l2 2-1.4 2.1 2.4.4v2.8l-2.4.5L14 12l-2 2-2.1-1.4-.5 2.4H6.6l-.5-2.4L4 13.9l-2-2 1.4-2.1L1 9.4V6.6l2.4-.5L2.1 4l2-2 2.1 1.4.4-2.4h2.8zm.6 7c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM8 9c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1z"/></svg>
			<span class="separator"></span>
			<span class="setting-name">example.booleanSetting</span>
		</a></code>`)}),test("actions with no value",()=>{const t=c.parse(i.settingToUriString("example.booleanSetting")),n=i.getActions(t);e.strictEqual(n?.length,2),e.strictEqual(n[0].label,'View "Example: Boolean Setting" in Settings')}),test("actions with value + updating and restoring",async()=>{await r.setUserConfiguration("example",{stringSetting:"two"});const t=c.parse(i.settingToUriString("example.stringSetting","three")),n=o=>(e.strictEqual(o?.length,3),e.strictEqual(o[0].label,'Set "Example: String Setting" to "three"'),e.strictEqual(o[1].label,"View in Settings"),e.strictEqual(r.getValue("example.stringSetting"),"two"),!0),s=i.getActions(t);if(n(s)){await s[0].run(),e.strictEqual(r.getValue("example.stringSetting"),"three");const o=i.getActions(t);e.strictEqual(o?.length,3),e.strictEqual(o[0].label,'Restore value of "Example: String Setting"'),e.strictEqual(s[1].label,"View in Settings"),e.strictEqual(s[2].label,"Copy Setting ID"),e.strictEqual(r.getValue("example.stringSetting"),"three"),await o[0].run(),n(i.getActions(t))}})});