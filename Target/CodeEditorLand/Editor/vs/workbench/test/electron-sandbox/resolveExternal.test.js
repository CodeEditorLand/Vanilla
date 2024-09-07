import a from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as c}from"../../../base/test/common/utils.js";import{NativeWindow as d}from"../../electron-sandbox/window.js";import{ITunnelService as h}from"../../../platform/tunnel/common/tunnel.js";import{URI as l}from"../../../base/common/uri.js";import"../../../platform/instantiation/test/common/instantiationServiceMock.js";import"../../../platform/remote/common/remoteAgentConnection.js";import{workbenchInstantiationService as u}from"./workbenchTestServices.js";import{DisposableStore as f}from"../../../base/common/lifecycle.js";class m{assignedPorts={};expectedDispose=!1;reset(e){this.assignedPorts=e}expectDispose(){this.expectedDispose=!0}getExistingTunnel(){return Promise.resolve(void 0)}openTunnel(e,n,t){if(!this.assignedPorts[t])return Promise.reject(new Error("Unexpected tunnel request"));const s={localAddress:`localhost:${this.assignedPorts[t]}`,tunnelRemoteHost:"4.3.2.1",tunnelRemotePort:this.assignedPorts[t],privacy:"",dispose:()=>(a(this.expectedDispose,"Unexpected dispose"),this.expectedDispose=!1,Promise.resolve())};return delete this.assignedPorts[t],Promise.resolve(s)}validate(){try{a(Object.keys(this.assignedPorts).length===0,"Expected tunnel to be used"),a(!this.expectedDispose,"Expected dispose to be called")}finally{this.expectedDispose=!1}}}class v extends d{create(){}registerListeners(){}enableMultiWindowAwareTimeout(){}}suite.skip("NativeWindow:resolveExternal",()=>{const o=new f,e=new m;let n;setup(()=>{const s=u(void 0,o);s.stub(h,e),n=o.add(s.createInstance(v))}),teardown(()=>{o.clear()});async function t(s,p={},i){e.reset(p);const r=await n.resolveExternalUri(l.parse(s),{allowTunneling:!0,openExternal:!0});a.strictEqual(!i,!r,`Expected URI ${i} but got ${r}`),i&&r&&a.strictEqual(r.resolved.toString(),l.parse(i).toString()),e.validate()}test("invalid",async()=>{await t("file:///foo.bar/baz"),await t("http://foo.bar/path")}),test("simple",async()=>{await t("http://localhost:1234/path",{1234:1234},"http://localhost:1234/path")}),test("all interfaces",async()=>{await t("http://0.0.0.0:1234/path",{1234:1234},"http://localhost:1234/path")}),test("changed port",async()=>{await t("http://localhost:1234/path",{1234:1235},"http://localhost:1235/path")}),test("query",async()=>{await t("http://foo.bar/path?a=b&c=http%3a%2f%2flocalhost%3a4455",{4455:4455},"http://foo.bar/path?a=b&c=http%3a%2f%2flocalhost%3a4455")}),test("query with different port",async()=>{e.expectDispose(),await t("http://foo.bar/path?a=b&c=http%3a%2f%2flocalhost%3a4455",{4455:4567})}),test("both url and query",async()=>{await t("http://localhost:1234/path?a=b&c=http%3a%2f%2flocalhost%3a4455",{1234:4321,4455:4455},"http://localhost:4321/path?a=b&c=http%3a%2f%2flocalhost%3a4455")}),test("both url and query, query rejected",async()=>{e.expectDispose(),await t("http://localhost:1234/path?a=b&c=http%3a%2f%2flocalhost%3a4455",{1234:4321,4455:5544},"http://localhost:4321/path?a=b&c=http%3a%2f%2flocalhost%3a4455")}),c()});