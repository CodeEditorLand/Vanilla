import{KeyChord as n,KeyCode as t,KeyMod as l,ScanCode as y}from"../../../../../base/common/keyCodes.js";import{KeyCodeChord as K,decodeKeybinding as m,ScanCodeChord as h,Keybinding as b}from"../../../../../base/common/keybindings.js";import{OperatingSystem as g}from"../../../../../base/common/platform.js";import{WindowsKeyboardMapper as p}from"../../common/windowsKeyboardMapper.js";import{assertMapping as d,assertResolveKeyboardEvent as a,assertResolveKeybinding as c,readRawMapping as S}from"./keyboardMapperTestUtils.js";import"../../../../../platform/keyboardLayout/common/keyboardLayout.js";import{ensureNoDisposablesAreLeakedInTestSuite as i}from"../../../../../base/test/common/utils.js";const u=!1;async function o(e,s,C){const f=await S(s);return new p(e,f,C)}function r(e,s,C){const f=m(s,g.Windows);c(e,f,C)}suite("keyboardMapper - WINDOWS de_ch",()=>{i();let e;suiteSetup(async()=>{e=await o(!1,"win_de_ch",!1)}),test("mapping",()=>d(u,e,"win_de_ch.txt")),test("resolveKeybinding Ctrl+A",()=>{r(e,l.CtrlCmd|t.KeyA,[{label:"Ctrl+A",ariaLabel:"Control+A",electronAccelerator:"Ctrl+A",userSettingsLabel:"ctrl+a",isWYSIWYG:!0,isMultiChord:!1,dispatchParts:["ctrl+A"],singleModifierDispatchParts:[null]}])}),test("resolveKeybinding Ctrl+Z",()=>{r(e,l.CtrlCmd|t.KeyZ,[{label:"Ctrl+Z",ariaLabel:"Control+Z",electronAccelerator:"Ctrl+Z",userSettingsLabel:"ctrl+z",isWYSIWYG:!0,isMultiChord:!1,dispatchParts:["ctrl+Z"],singleModifierDispatchParts:[null]}])}),test("resolveKeyboardEvent Ctrl+Z",()=>{a(e,{_standardKeyboardEventBrand:!0,ctrlKey:!0,shiftKey:!1,altKey:!1,metaKey:!1,altGraphKey:!1,keyCode:t.KeyZ,code:null},{label:"Ctrl+Z",ariaLabel:"Control+Z",electronAccelerator:"Ctrl+Z",userSettingsLabel:"ctrl+z",isWYSIWYG:!0,isMultiChord:!1,dispatchParts:["ctrl+Z"],singleModifierDispatchParts:[null]})}),test("resolveKeybinding Ctrl+]",()=>{r(e,l.CtrlCmd|t.BracketRight,[{label:"Ctrl+^",ariaLabel:"Control+^",electronAccelerator:"Ctrl+]",userSettingsLabel:"ctrl+oem_6",isWYSIWYG:!1,isMultiChord:!1,dispatchParts:["ctrl+]"],singleModifierDispatchParts:[null]}])}),test("resolveKeyboardEvent Ctrl+]",()=>{a(e,{_standardKeyboardEventBrand:!0,ctrlKey:!0,shiftKey:!1,altKey:!1,metaKey:!1,altGraphKey:!1,keyCode:t.BracketRight,code:null},{label:"Ctrl+^",ariaLabel:"Control+^",electronAccelerator:"Ctrl+]",userSettingsLabel:"ctrl+oem_6",isWYSIWYG:!1,isMultiChord:!1,dispatchParts:["ctrl+]"],singleModifierDispatchParts:[null]})}),test("resolveKeybinding Shift+]",()=>{r(e,l.Shift|t.BracketRight,[{label:"Shift+^",ariaLabel:"Shift+^",electronAccelerator:"Shift+]",userSettingsLabel:"shift+oem_6",isWYSIWYG:!1,isMultiChord:!1,dispatchParts:["shift+]"],singleModifierDispatchParts:[null]}])}),test("resolveKeybinding Ctrl+/",()=>{r(e,l.CtrlCmd|t.Slash,[{label:"Ctrl+\xA7",ariaLabel:"Control+\xA7",electronAccelerator:"Ctrl+/",userSettingsLabel:"ctrl+oem_2",isWYSIWYG:!1,isMultiChord:!1,dispatchParts:["ctrl+/"],singleModifierDispatchParts:[null]}])}),test("resolveKeybinding Ctrl+Shift+/",()=>{r(e,l.CtrlCmd|l.Shift|t.Slash,[{label:"Ctrl+Shift+\xA7",ariaLabel:"Control+Shift+\xA7",electronAccelerator:"Ctrl+Shift+/",userSettingsLabel:"ctrl+shift+oem_2",isWYSIWYG:!1,isMultiChord:!1,dispatchParts:["ctrl+shift+/"],singleModifierDispatchParts:[null]}])}),test("resolveKeybinding Ctrl+K Ctrl+\\",()=>{r(e,n(l.CtrlCmd|t.KeyK,l.CtrlCmd|t.Backslash),[{label:"Ctrl+K Ctrl+\xE4",ariaLabel:"Control+K Control+\xE4",electronAccelerator:null,userSettingsLabel:"ctrl+k ctrl+oem_5",isWYSIWYG:!1,isMultiChord:!0,dispatchParts:["ctrl+K","ctrl+\\"],singleModifierDispatchParts:[null,null]}])}),test("resolveKeybinding Ctrl+K Ctrl+=",()=>{r(e,n(l.CtrlCmd|t.KeyK,l.CtrlCmd|t.Equal),[])}),test("resolveKeybinding Ctrl+DownArrow",()=>{r(e,l.CtrlCmd|t.DownArrow,[{label:"Ctrl+DownArrow",ariaLabel:"Control+DownArrow",electronAccelerator:"Ctrl+Down",userSettingsLabel:"ctrl+down",isWYSIWYG:!0,isMultiChord:!1,dispatchParts:["ctrl+DownArrow"],singleModifierDispatchParts:[null]}])}),test("resolveKeybinding Ctrl+NUMPAD_0",()=>{r(e,l.CtrlCmd|t.Numpad0,[{label:"Ctrl+NumPad0",ariaLabel:"Control+NumPad0",electronAccelerator:null,userSettingsLabel:"ctrl+numpad0",isWYSIWYG:!0,isMultiChord:!1,dispatchParts:["ctrl+NumPad0"],singleModifierDispatchParts:[null]}])}),test("resolveKeybinding Ctrl+Home",()=>{r(e,l.CtrlCmd|t.Home,[{label:"Ctrl+Home",ariaLabel:"Control+Home",electronAccelerator:"Ctrl+Home",userSettingsLabel:"ctrl+home",isWYSIWYG:!0,isMultiChord:!1,dispatchParts:["ctrl+Home"],singleModifierDispatchParts:[null]}])}),test("resolveKeyboardEvent Ctrl+Home",()=>{a(e,{_standardKeyboardEventBrand:!0,ctrlKey:!0,shiftKey:!1,altKey:!1,metaKey:!1,altGraphKey:!1,keyCode:t.Home,code:null},{label:"Ctrl+Home",ariaLabel:"Control+Home",electronAccelerator:"Ctrl+Home",userSettingsLabel:"ctrl+home",isWYSIWYG:!0,isMultiChord:!1,dispatchParts:["ctrl+Home"],singleModifierDispatchParts:[null]})}),test("resolveUserBinding Ctrl+[Comma] Ctrl+/",()=>{c(e,new b([new h(!0,!1,!1,!1,y.Comma),new K(!0,!1,!1,!1,t.Slash)]),[{label:"Ctrl+, Ctrl+\xA7",ariaLabel:"Control+, Control+\xA7",electronAccelerator:null,userSettingsLabel:"ctrl+oem_comma ctrl+oem_2",isWYSIWYG:!1,isMultiChord:!0,dispatchParts:["ctrl+,","ctrl+/"],singleModifierDispatchParts:[null,null]}])}),test("resolveKeyboardEvent Single Modifier Ctrl+",()=>{a(e,{_standardKeyboardEventBrand:!0,ctrlKey:!0,shiftKey:!1,altKey:!1,metaKey:!1,altGraphKey:!1,keyCode:t.Ctrl,code:null},{label:"Ctrl",ariaLabel:"Control",electronAccelerator:null,userSettingsLabel:"ctrl",isWYSIWYG:!0,isMultiChord:!1,dispatchParts:[null],singleModifierDispatchParts:["ctrl"]})})}),suite("keyboardMapper - WINDOWS en_us",()=>{i();let e;suiteSetup(async()=>{e=await o(!0,"win_en_us",!1)}),test("mapping",()=>d(u,e,"win_en_us.txt")),test("resolveKeybinding Ctrl+K Ctrl+\\",()=>{r(e,n(l.CtrlCmd|t.KeyK,l.CtrlCmd|t.Backslash),[{label:"Ctrl+K Ctrl+\\",ariaLabel:"Control+K Control+\\",electronAccelerator:null,userSettingsLabel:"ctrl+k ctrl+\\",isWYSIWYG:!0,isMultiChord:!0,dispatchParts:["ctrl+K","ctrl+\\"],singleModifierDispatchParts:[null,null]}])}),test("resolveUserBinding Ctrl+[Comma] Ctrl+/",()=>{c(e,new b([new h(!0,!1,!1,!1,y.Comma),new K(!0,!1,!1,!1,t.Slash)]),[{label:"Ctrl+, Ctrl+/",ariaLabel:"Control+, Control+/",electronAccelerator:null,userSettingsLabel:"ctrl+, ctrl+/",isWYSIWYG:!0,isMultiChord:!0,dispatchParts:["ctrl+,","ctrl+/"],singleModifierDispatchParts:[null,null]}])}),test("resolveUserBinding Ctrl+[Comma]",()=>{c(e,new b([new h(!0,!1,!1,!1,y.Comma)]),[{label:"Ctrl+,",ariaLabel:"Control+,",electronAccelerator:"Ctrl+,",userSettingsLabel:"ctrl+,",isWYSIWYG:!0,isMultiChord:!1,dispatchParts:["ctrl+,"],singleModifierDispatchParts:[null]}])}),test("resolveKeyboardEvent Single Modifier Ctrl+",()=>{a(e,{_standardKeyboardEventBrand:!0,ctrlKey:!0,shiftKey:!1,altKey:!1,metaKey:!1,altGraphKey:!1,keyCode:t.Ctrl,code:null},{label:"Ctrl",ariaLabel:"Control",electronAccelerator:null,userSettingsLabel:"ctrl",isWYSIWYG:!0,isMultiChord:!1,dispatchParts:[null],singleModifierDispatchParts:["ctrl"]})}),test("resolveKeyboardEvent Single Modifier Shift+",()=>{a(e,{_standardKeyboardEventBrand:!0,ctrlKey:!1,shiftKey:!0,altKey:!1,metaKey:!1,altGraphKey:!1,keyCode:t.Shift,code:null},{label:"Shift",ariaLabel:"Shift",electronAccelerator:null,userSettingsLabel:"shift",isWYSIWYG:!0,isMultiChord:!1,dispatchParts:[null],singleModifierDispatchParts:["shift"]})}),test("resolveKeyboardEvent Single Modifier Alt+",()=>{a(e,{_standardKeyboardEventBrand:!0,ctrlKey:!1,shiftKey:!1,altKey:!0,metaKey:!1,altGraphKey:!1,keyCode:t.Alt,code:null},{label:"Alt",ariaLabel:"Alt",electronAccelerator:null,userSettingsLabel:"alt",isWYSIWYG:!0,isMultiChord:!1,dispatchParts:[null],singleModifierDispatchParts:["alt"]})}),test("resolveKeyboardEvent Single Modifier Meta+",()=>{a(e,{_standardKeyboardEventBrand:!0,ctrlKey:!1,shiftKey:!1,altKey:!1,metaKey:!0,altGraphKey:!1,keyCode:t.Meta,code:null},{label:"Windows",ariaLabel:"Windows",electronAccelerator:null,userSettingsLabel:"win",isWYSIWYG:!0,isMultiChord:!1,dispatchParts:[null],singleModifierDispatchParts:["meta"]})}),test("resolveKeyboardEvent Only Modifiers Ctrl+Shift+",()=>{a(e,{_standardKeyboardEventBrand:!0,ctrlKey:!0,shiftKey:!0,altKey:!1,metaKey:!1,altGraphKey:!1,keyCode:t.Shift,code:null},{label:"Ctrl+Shift",ariaLabel:"Control+Shift",electronAccelerator:null,userSettingsLabel:"ctrl+shift",isWYSIWYG:!0,isMultiChord:!1,dispatchParts:[null],singleModifierDispatchParts:[null]})}),test("resolveKeyboardEvent mapAltGrToCtrlAlt AltGr+Z",async()=>{const s=await o(!0,"win_en_us",!0);a(s,{_standardKeyboardEventBrand:!0,ctrlKey:!1,shiftKey:!1,altKey:!1,metaKey:!1,altGraphKey:!0,keyCode:t.KeyZ,code:null},{label:"Ctrl+Alt+Z",ariaLabel:"Control+Alt+Z",electronAccelerator:"Ctrl+Alt+Z",userSettingsLabel:"ctrl+alt+z",isWYSIWYG:!0,isMultiChord:!1,dispatchParts:["ctrl+alt+Z"],singleModifierDispatchParts:[null]})})}),suite("keyboardMapper - WINDOWS por_ptb",()=>{i();let e;suiteSetup(async()=>{e=await o(!1,"win_por_ptb",!1)}),test("mapping",()=>d(u,e,"win_por_ptb.txt")),test("resolveKeyboardEvent Ctrl+[IntlRo]",()=>{a(e,{_standardKeyboardEventBrand:!0,ctrlKey:!0,shiftKey:!1,altKey:!1,metaKey:!1,altGraphKey:!1,keyCode:t.ABNT_C1,code:null},{label:"Ctrl+/",ariaLabel:"Control+/",electronAccelerator:"Ctrl+ABNT_C1",userSettingsLabel:"ctrl+abnt_c1",isWYSIWYG:!1,isMultiChord:!1,dispatchParts:["ctrl+ABNT_C1"],singleModifierDispatchParts:[null]})}),test("resolveKeyboardEvent Ctrl+[NumpadComma]",()=>{a(e,{_standardKeyboardEventBrand:!0,ctrlKey:!0,shiftKey:!1,altKey:!1,metaKey:!1,altGraphKey:!1,keyCode:t.ABNT_C2,code:null},{label:"Ctrl+.",ariaLabel:"Control+.",electronAccelerator:"Ctrl+ABNT_C2",userSettingsLabel:"ctrl+abnt_c2",isWYSIWYG:!1,isMultiChord:!1,dispatchParts:["ctrl+ABNT_C2"],singleModifierDispatchParts:[null]})})}),suite("keyboardMapper - WINDOWS ru",()=>{i();let e;suiteSetup(async()=>{e=await o(!1,"win_ru",!1)}),test("mapping",()=>d(u,e,"win_ru.txt")),test("issue ##24361: resolveKeybinding Ctrl+K Ctrl+K",()=>{r(e,n(l.CtrlCmd|t.KeyK,l.CtrlCmd|t.KeyK),[{label:"Ctrl+K Ctrl+K",ariaLabel:"Control+K Control+K",electronAccelerator:null,userSettingsLabel:"ctrl+k ctrl+k",isWYSIWYG:!0,isMultiChord:!0,dispatchParts:["ctrl+K","ctrl+K"],singleModifierDispatchParts:[null,null]}])})}),suite("keyboardMapper - misc",()=>{i(),test("issue #23513: Toggle Sidebar Visibility and Go to Line display same key mapping in Arabic keyboard",()=>{const e=new p(!1,{KeyB:{vkey:"VK_B",value:"\u0644\u0627",withShift:"\u0644\u0622",withAltGr:"",withShiftAltGr:""},KeyG:{vkey:"VK_G",value:"\u0644",withShift:"\u0644\u0623",withAltGr:"",withShiftAltGr:""}},!1);r(e,l.CtrlCmd|t.KeyB,[{label:"Ctrl+B",ariaLabel:"Control+B",electronAccelerator:"Ctrl+B",userSettingsLabel:"ctrl+b",isWYSIWYG:!0,isMultiChord:!1,dispatchParts:["ctrl+B"],singleModifierDispatchParts:[null]}])})});
