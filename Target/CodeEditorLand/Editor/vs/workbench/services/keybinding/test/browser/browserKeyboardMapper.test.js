import e from"assert";import"../../browser/keyboardLayouts/en.darwin.js";import"../../browser/keyboardLayouts/de.darwin.js";import{KeyboardLayoutContribution as f}from"../../browser/keyboardLayouts/_.contribution.js";import{BrowserKeyboardMapperFactoryBase as h}from"../../browser/keyboardLayoutService.js";import{KeymapInfo as n}from"../../common/keymapInfo.js";import{TestInstantiationService as d}from"../../../../../platform/instantiation/test/common/instantiationServiceMock.js";import{INotificationService as u}from"../../../../../platform/notification/common/notification.js";import{ICommandService as S}from"../../../../../platform/commands/common/commands.js";import"../../../../../platform/storage/common/storage.js";import{TestNotificationService as c}from"../../../../../platform/notification/test/common/testNotificationService.js";import{TestStorageService as K}from"../../../../test/common/workbenchTestServices.js";import{IConfigurationService as p}from"../../../../../platform/configuration/common/configuration.js";import{TestConfigurationService as w}from"../../../../../platform/configuration/test/common/testConfigurationService.js";import{ensureNoDisposablesAreLeakedInTestSuite as m}from"../../../../../base/test/common/utils.js";class I extends h{constructor(a,t,o,y){super(a);const l=f.INSTANCE.layoutInfos;this._keymapInfos.push(...l.map(s=>new n(s.layout,s.secondaryLayouts,s.mapping,s.isUserKeyboardLayout))),this._mru=this._keymapInfos,this._initialized=!0,this.setLayoutFromBrowserAPI();const r=this.getUSStandardLayout();r&&this.setActiveKeyMapping(r.mapping)}}suite("keyboard layout loader",()=>{const i=m();let a,t;setup(()=>{a=new d;const o=new K,y=a.stub(u,new c),l=a.stub(p,new w),r=a.stub(S,{});i.add(a),i.add(o),t=new I(l,y,o,r),i.add(t)}),teardown(()=>{a.dispose()}),test("load default US keyboard layout",()=>{e.notStrictEqual(t.activeKeyboardLayout,null)}),test("isKeyMappingActive",()=>{t.setUSKeyboardLayout(),e.strictEqual(t.isKeyMappingActive({KeyA:{value:"a",valueIsDeadKey:!1,withShift:"A",withShiftIsDeadKey:!1,withAltGr:"\xE5",withAltGrIsDeadKey:!1,withShiftAltGr:"\xC5",withShiftAltGrIsDeadKey:!1}}),!0),e.strictEqual(t.isKeyMappingActive({KeyA:{value:"a",valueIsDeadKey:!1,withShift:"A",withShiftIsDeadKey:!1,withAltGr:"\xE5",withAltGrIsDeadKey:!1,withShiftAltGr:"\xC5",withShiftAltGrIsDeadKey:!1},KeyZ:{value:"z",valueIsDeadKey:!1,withShift:"Z",withShiftIsDeadKey:!1,withAltGr:"\u03A9",withAltGrIsDeadKey:!1,withShiftAltGr:"\xB8",withShiftAltGrIsDeadKey:!1}}),!0),e.strictEqual(t.isKeyMappingActive({KeyZ:{value:"y",valueIsDeadKey:!1,withShift:"Y",withShiftIsDeadKey:!1,withAltGr:"\xA5",withAltGrIsDeadKey:!1,withShiftAltGr:"\u0178",withShiftAltGrIsDeadKey:!1}}),!1)}),test("Switch keymapping",()=>{t.setActiveKeyMapping({KeyZ:{value:"y",valueIsDeadKey:!1,withShift:"Y",withShiftIsDeadKey:!1,withAltGr:"\xA5",withAltGrIsDeadKey:!1,withShiftAltGr:"\u0178",withShiftAltGrIsDeadKey:!1}}),e.strictEqual(!!t.activeKeyboardLayout.isUSStandard,!1),e.strictEqual(t.isKeyMappingActive({KeyZ:{value:"y",valueIsDeadKey:!1,withShift:"Y",withShiftIsDeadKey:!1,withAltGr:"\xA5",withAltGrIsDeadKey:!1,withShiftAltGr:"\u0178",withShiftAltGrIsDeadKey:!1}}),!0),t.setUSKeyboardLayout(),e.strictEqual(t.activeKeyboardLayout.isUSStandard,!0)}),test("Switch keyboard layout info",()=>{t.setKeyboardLayout("com.apple.keylayout.German"),e.strictEqual(!!t.activeKeyboardLayout.isUSStandard,!1),e.strictEqual(t.isKeyMappingActive({KeyZ:{value:"y",valueIsDeadKey:!1,withShift:"Y",withShiftIsDeadKey:!1,withAltGr:"\xA5",withAltGrIsDeadKey:!1,withShiftAltGr:"\u0178",withShiftAltGrIsDeadKey:!1}}),!0),t.setUSKeyboardLayout(),e.strictEqual(t.activeKeyboardLayout.isUSStandard,!0)})});