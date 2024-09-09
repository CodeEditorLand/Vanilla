import e from"assert";import{KeyChord as q,KeyCode as i,KeyMod as n}from"../../../../base/common/keyCodes.js";import{createSimpleKeybinding as D,KeyCodeChord as w}from"../../../../base/common/keybindings.js";import{Disposable as b}from"../../../../base/common/lifecycle.js";import{OS as K}from"../../../../base/common/platform.js";import v from"../../../../base/common/severity.js";import{ensureNoDisposablesAreLeakedInTestSuite as x}from"../../../../base/test/common/utils.js";import"../../../commands/common/commands.js";import{ContextKeyExpr as k}from"../../../contextkey/common/contextkey.js";import{AbstractKeybindingService as P}from"../../common/abstractKeybindingService.js";import"../../common/keybinding.js";import{KeybindingResolver as $}from"../../common/keybindingResolver.js";import{ResolvedKeybindingItem as R}from"../../common/resolvedKeybindingItem.js";import{USLayoutResolvedKeybinding as W}from"../../common/usLayoutResolvedKeybinding.js";import{createUSLayoutResolvedKeybinding as I}from"./keybindingsTestUtils.js";import{NullLogService as N}from"../../../log/common/log.js";import{NoOpNotification as g}from"../../../notification/common/notification.js";import{NullTelemetryService as _}from"../../../telemetry/common/telemetryUtils.js";function h(f){return{getValue:p=>f[p]}}suite("AbstractKeybindingService",()=>{class f extends P{_resolver;constructor(t,c,m,C){super(c,m,_,C,new N),this._resolver=t}_getResolver(){return this._resolver}_documentHasFocus(){return!0}resolveKeybinding(t){return W.resolveKeybinding(t,K)}resolveKeyboardEvent(t){const c=new w(t.ctrlKey,t.shiftKey,t.altKey,t.metaKey,t.keyCode).toKeybinding();return this.resolveKeybinding(c)[0]}resolveUserBinding(t){return[]}testDispatch(t){const c=D(t,K);return this._dispatch({_standardKeyboardEventBrand:!0,ctrlKey:c.ctrlKey,shiftKey:c.shiftKey,altKey:c.altKey,metaKey:c.metaKey,altGraphKey:!1,keyCode:c.keyCode,code:null},null)}_dumpDebugInfo(){return""}_dumpDebugInfoJSON(){return""}registerSchemaContribution(){}enableKeybindingHoldMode(){}}let p=null,y=null,s=null,d=null,o=null,l=null;teardown(()=>{y=null,s=null,d=null,p=null,o=null,l=null}),x(),setup(()=>{s=[],d=[],o=[],l=[],p=r=>{const t={_serviceBrand:void 0,onDidChangeContext:void 0,bufferChangeEvents(){},createKey:void 0,contextMatchesRules:void 0,getContextKeyValue:void 0,createScoped:void 0,createOverlay:void 0,getContext:S=>y,updateParent:()=>{}},c={_serviceBrand:void 0,onWillExecuteCommand:()=>b.None,onDidExecuteCommand:()=>b.None,executeCommand:(S,...E)=>(s.push({commandId:S,args:E}),Promise.resolve(void 0))},m={_serviceBrand:void 0,onDidAddNotification:void 0,onDidRemoveNotification:void 0,onDidChangeFilter:void 0,notify:S=>(d.push({sev:S.severity,message:S.message}),new g),info:S=>(d.push({sev:v.Info,message:S}),new g),warn:S=>(d.push({sev:v.Warning,message:S}),new g),error:S=>(d.push({sev:v.Error,message:S}),new g),prompt(S,E,T,B){throw new Error("not implemented")},status(S,E){return o.push(S),{dispose:()=>{l.push(S)}}},setFilter(){throw new Error("not implemented")},getFilter(){throw new Error("not implemented")},getFilters(){throw new Error("not implemented")},removeFilter(){throw new Error("not implemented")}},C=new $(r,[],()=>{});return new f(C,t,c,m)}});function a(r,t,c){return new R(I(r,K),t,null,c,!0,null,!1)}function u(r){return I(r,K).getLabel()}suite("simple tests: single- and multi-chord keybindings are dispatched",()=>{test("a single-chord keybinding is dispatched correctly; this test makes sure the dispatch in general works before we test empty-string/null command ID",()=>{const r=n.CtrlCmd|i.KeyK,t=p([a(r,"myCommand")]);y=h({});const c=t.testDispatch(r);e.deepStrictEqual(c,!0),e.deepStrictEqual(s,[{commandId:"myCommand",args:[null]}]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[]),e.deepStrictEqual(l,[]),t.dispose()}),test("a multi-chord keybinding is dispatched correctly",()=>{const r=n.CtrlCmd|i.KeyK,t=n.CtrlCmd|i.KeyI,m=p([a([r,t],"myCommand")]);y=h({});let C=m.testDispatch(r);e.deepStrictEqual(C,!0),e.deepStrictEqual(s,[]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[`(${u(r)}) was pressed. Waiting for second key of chord...`]),e.deepStrictEqual(l,[]),C=m.testDispatch(t),e.deepStrictEqual(C,!0),e.deepStrictEqual(s,[{commandId:"myCommand",args:[null]}]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[`(${u(r)}) was pressed. Waiting for second key of chord...`]),e.deepStrictEqual(l,[`(${u(r)}) was pressed. Waiting for second key of chord...`]),m.dispose()})}),suite("keybindings with empty-string/null command ID",()=>{test("a single-chord keybinding with an empty string command ID unbinds the keybinding (shouldPreventDefault = false)",()=>{const r=p([a(n.CtrlCmd|i.KeyK,"myCommand"),a(n.CtrlCmd|i.KeyK,"")]);y=h({});const t=r.testDispatch(n.CtrlCmd|i.KeyK);e.deepStrictEqual(t,!1),e.deepStrictEqual(s,[]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[]),e.deepStrictEqual(l,[]),r.dispose()}),test("a single-chord keybinding with a null command ID unbinds the keybinding (shouldPreventDefault = false)",()=>{const r=p([a(n.CtrlCmd|i.KeyK,"myCommand"),a(n.CtrlCmd|i.KeyK,null)]);y=h({});const t=r.testDispatch(n.CtrlCmd|i.KeyK);e.deepStrictEqual(t,!1),e.deepStrictEqual(s,[]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[]),e.deepStrictEqual(l,[]),r.dispose()}),test("a multi-chord keybinding with an empty-string command ID keeps the keybinding (shouldPreventDefault = true)",()=>{const r=n.CtrlCmd|i.KeyK,t=n.CtrlCmd|i.KeyI,c=[r,t],m=p([a(c,"myCommand"),a(c,"")]);y=h({});let C=m.testDispatch(n.CtrlCmd|i.KeyK);e.deepStrictEqual(C,!0),e.deepStrictEqual(s,[]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[`(${u(r)}) was pressed. Waiting for second key of chord...`]),e.deepStrictEqual(l,[]),C=m.testDispatch(n.CtrlCmd|i.KeyI),e.deepStrictEqual(C,!0),e.deepStrictEqual(s,[]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[`(${u(r)}) was pressed. Waiting for second key of chord...`,`The key combination (${u(r)}, ${u(t)}) is not a command.`]),e.deepStrictEqual(l,[`(${u(r)}) was pressed. Waiting for second key of chord...`]),m.dispose()}),test("a multi-chord keybinding with a null command ID keeps the keybinding (shouldPreventDefault = true)",()=>{const r=n.CtrlCmd|i.KeyK,t=n.CtrlCmd|i.KeyI,c=[r,t],m=p([a(c,"myCommand"),a(c,null)]);y=h({});let C=m.testDispatch(n.CtrlCmd|i.KeyK);e.deepStrictEqual(C,!0),e.deepStrictEqual(s,[]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[`(${u(r)}) was pressed. Waiting for second key of chord...`]),e.deepStrictEqual(l,[]),C=m.testDispatch(n.CtrlCmd|i.KeyI),e.deepStrictEqual(C,!0),e.deepStrictEqual(s,[]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[`(${u(r)}) was pressed. Waiting for second key of chord...`,`The key combination (${u(r)}, ${u(t)}) is not a command.`]),e.deepStrictEqual(l,[`(${u(r)}) was pressed. Waiting for second key of chord...`]),m.dispose()})}),test("issue #16498: chord mode is quit for invalid chords",()=>{const r=p([a(q(n.CtrlCmd|i.KeyK,n.CtrlCmd|i.KeyX),"chordCommand"),a(i.Backspace,"simpleCommand")]);let t=r.testDispatch(n.CtrlCmd|i.KeyK);e.strictEqual(t,!0),e.deepStrictEqual(s,[]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[`(${u(n.CtrlCmd|i.KeyK)}) was pressed. Waiting for second key of chord...`]),e.deepStrictEqual(l,[]),s=[],d=[],o=[],l=[],t=r.testDispatch(i.Backspace),e.strictEqual(t,!0),e.deepStrictEqual(s,[]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[`The key combination (${u(n.CtrlCmd|i.KeyK)}, ${u(i.Backspace)}) is not a command.`]),e.deepStrictEqual(l,[`(${u(n.CtrlCmd|i.KeyK)}) was pressed. Waiting for second key of chord...`]),s=[],d=[],o=[],l=[],t=r.testDispatch(i.Backspace),e.strictEqual(t,!0),e.deepStrictEqual(s,[{commandId:"simpleCommand",args:[null]}]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[]),e.deepStrictEqual(l,[]),s=[],d=[],o=[],l=[],r.dispose()}),test("issue #16833: Keybinding service should not testDispatch on modifier keys",()=>{const r=p([a(i.Ctrl,"nope"),a(i.Meta,"nope"),a(i.Alt,"nope"),a(i.Shift,"nope"),a(n.CtrlCmd,"nope"),a(n.WinCtrl,"nope"),a(n.Alt,"nope"),a(n.Shift,"nope")]);function t(c){const m=r.testDispatch(c);e.strictEqual(m,!1),e.deepStrictEqual(s,[]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[]),e.deepStrictEqual(l,[]),s=[],d=[],o=[],l=[]}t(i.Ctrl),t(i.Meta),t(i.Alt),t(i.Shift),t(n.CtrlCmd),t(n.WinCtrl),t(n.Alt),t(n.Shift),r.dispose()}),test("can trigger command that is sharing keybinding with chord",()=>{const r=p([a(q(n.CtrlCmd|i.KeyK,n.CtrlCmd|i.KeyX),"chordCommand"),a(n.CtrlCmd|i.KeyK,"simpleCommand",k.has("key1"))]);y=h({key1:!0});let t=r.testDispatch(n.CtrlCmd|i.KeyK);e.strictEqual(t,!0),e.deepStrictEqual(s,[{commandId:"simpleCommand",args:[null]}]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[]),e.deepStrictEqual(l,[]),s=[],d=[],o=[],l=[],y=h({}),t=r.testDispatch(n.CtrlCmd|i.KeyK),e.strictEqual(t,!0),e.deepStrictEqual(s,[]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[`(${u(n.CtrlCmd|i.KeyK)}) was pressed. Waiting for second key of chord...`]),e.deepStrictEqual(l,[]),s=[],d=[],o=[],l=[],y=h({}),t=r.testDispatch(n.CtrlCmd|i.KeyX),e.strictEqual(t,!0),e.deepStrictEqual(s,[{commandId:"chordCommand",args:[null]}]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[]),e.deepStrictEqual(l,[`(${u(n.CtrlCmd|i.KeyK)}) was pressed. Waiting for second key of chord...`]),s=[],d=[],o=[],l=[],r.dispose()}),test("cannot trigger chord if command is overwriting",()=>{const r=p([a(q(n.CtrlCmd|i.KeyK,n.CtrlCmd|i.KeyX),"chordCommand",k.has("key1")),a(n.CtrlCmd|i.KeyK,"simpleCommand")]);y=h({});let t=r.testDispatch(n.CtrlCmd|i.KeyK);e.strictEqual(t,!0),e.deepStrictEqual(s,[{commandId:"simpleCommand",args:[null]}]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[]),e.deepStrictEqual(l,[]),s=[],d=[],o=[],l=[],y=h({key1:!0}),t=r.testDispatch(n.CtrlCmd|i.KeyK),e.strictEqual(t,!0),e.deepStrictEqual(s,[{commandId:"simpleCommand",args:[null]}]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[]),e.deepStrictEqual(l,[]),s=[],d=[],o=[],l=[],y=h({key1:!0}),t=r.testDispatch(n.CtrlCmd|i.KeyX),e.strictEqual(t,!1),e.deepStrictEqual(s,[]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[]),e.deepStrictEqual(l,[]),s=[],d=[],o=[],l=[],r.dispose()}),test("can have spying command",()=>{const r=p([a(n.CtrlCmd|i.KeyK,"^simpleCommand")]);y=h({});const t=r.testDispatch(n.CtrlCmd|i.KeyK);e.strictEqual(t,!1),e.deepStrictEqual(s,[{commandId:"simpleCommand",args:[null]}]),e.deepStrictEqual(d,[]),e.deepStrictEqual(o,[]),e.deepStrictEqual(l,[]),s=[],d=[],o=[],l=[],r.dispose()})});
