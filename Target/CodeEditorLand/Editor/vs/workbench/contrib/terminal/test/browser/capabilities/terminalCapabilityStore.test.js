import{deepStrictEqual as d}from"assert";import{DisposableStore as c}from"../../../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as m}from"../../../../../../base/test/common/utils.js";import{TerminalCapability as e}from"../../../../../../platform/terminal/common/capabilities/capabilities.js";import{TerminalCapabilityStore as C,TerminalCapabilityStoreMultiplexer as w}from"../../../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js";suite("TerminalCapabilityStore",()=>{const n=m();let t,a,i;setup(()=>{t=n.add(new C),n.add(t.onDidAddCapabilityType(r=>a.push(r))),n.add(t.onDidRemoveCapabilityType(r=>i.push(r))),a=[],i=[]}),teardown(()=>t.dispose()),test("should fire events when capabilities are added",()=>{o(a,[]),t.add(e.CwdDetection,{}),o(a,[e.CwdDetection])}),test("should fire events when capabilities are removed",async()=>{o(i,[]),t.add(e.CwdDetection,{}),o(i,[]),t.remove(e.CwdDetection),o(i,[e.CwdDetection])}),test("has should return whether a capability is present",()=>{d(t.has(e.CwdDetection),!1),t.add(e.CwdDetection,{}),d(t.has(e.CwdDetection),!0),t.remove(e.CwdDetection),d(t.has(e.CwdDetection),!1)}),test("items should reflect current state",()=>{d(Array.from(t.items),[]),t.add(e.CwdDetection,{}),d(Array.from(t.items),[e.CwdDetection]),t.add(e.NaiveCwdDetection,{}),d(Array.from(t.items),[e.CwdDetection,e.NaiveCwdDetection]),t.remove(e.CwdDetection),d(Array.from(t.items),[e.NaiveCwdDetection])})}),suite("TerminalCapabilityStoreMultiplexer",()=>{let n,t,a,i,r,s;setup(()=>{n=new c,t=n.add(new w),t.onDidAddCapabilityType(l=>r.push(l)),t.onDidRemoveCapabilityType(l=>s.push(l)),a=n.add(new C),i=n.add(new C),r=[],s=[]}),teardown(()=>n.dispose()),m(),test("should fire events when capabilities are enabled",async()=>{o(r,[]),t.add(a),t.add(i),a.add(e.CwdDetection,{}),o(r,[e.CwdDetection]),i.add(e.NaiveCwdDetection,{}),o(r,[e.NaiveCwdDetection])}),test("should fire events when capabilities are disabled",async()=>{o(s,[]),t.add(a),t.add(i),a.add(e.CwdDetection,{}),i.add(e.NaiveCwdDetection,{}),o(s,[]),a.remove(e.CwdDetection),o(s,[e.CwdDetection]),i.remove(e.NaiveCwdDetection),o(s,[e.NaiveCwdDetection])}),test("should fire events when stores are added",async()=>{o(r,[]),a.add(e.CwdDetection,{}),o(r,[]),i.add(e.NaiveCwdDetection,{}),t.add(a),t.add(i),o(r,[e.CwdDetection,e.NaiveCwdDetection])}),test("items should return items from all stores",()=>{d(Array.from(t.items).sort(),[].sort()),t.add(a),t.add(i),a.add(e.CwdDetection,{}),d(Array.from(t.items).sort(),[e.CwdDetection].sort()),a.add(e.CommandDetection,{}),i.add(e.NaiveCwdDetection,{}),d(Array.from(t.items).sort(),[e.CwdDetection,e.CommandDetection,e.NaiveCwdDetection].sort()),i.remove(e.NaiveCwdDetection),d(Array.from(t.items).sort(),[e.CwdDetection,e.CommandDetection].sort())}),test("has should return whether a capability is present",()=>{d(t.has(e.CwdDetection),!1),t.add(a),a.add(e.CwdDetection,{}),d(t.has(e.CwdDetection),!0),a.remove(e.CwdDetection),d(t.has(e.CwdDetection),!1)})});function o(n,t){d(n,t),n.length=0}
