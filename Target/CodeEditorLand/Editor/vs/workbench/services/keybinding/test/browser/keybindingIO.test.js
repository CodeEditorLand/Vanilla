import d from"assert";import{KeyChord as _,KeyCode as t,KeyMod as e,ScanCode as C}from"../../../../../base/common/keyCodes.js";import{KeyCodeChord as E,decodeKeybinding as M,ScanCodeChord as A,Keybinding as g}from"../../../../../base/common/keybindings.js";import{KeybindingParser as y}from"../../../../../base/common/keybindingParser.js";import{OperatingSystem as f}from"../../../../../base/common/platform.js";import{KeybindingIO as O}from"../../common/keybindingIO.js";import{createUSLayoutResolvedKeybinding as S}from"../../../../../platform/keybinding/test/common/keybindingsTestUtils.js";import{ensureNoDisposablesAreLeakedInTestSuite as K}from"../../../../../base/test/common/utils.js";suite("keybindingIO",()=>{K(),test("serialize/deserialize",()=>{function m(n,c,o,s){const h=S(n,s).getUserSettingsLabel();d.strictEqual(h,c,c+" - "+o)}function l(n,c,o,s){m(n,c,"win",f.Windows),m(n,o,"mac",f.Macintosh),m(n,s,"linux",f.Linux)}function r(n,c,o,s){const u=y.parseKeybinding(n),h=M(c,s);d.deepStrictEqual(u,h,n+" - "+o)}function a(n,c,o,s){r(n,s,"win",f.Windows),r(c,s,"mac",f.Macintosh),r(o,s,"linux",f.Linux)}function i(n,c,o,s){l(n,c,o,s),a(c,o,s,n)}i(t.Digit0,"0","0","0"),i(t.KeyA,"a","a","a"),i(t.UpArrow,"up","up","up"),i(t.RightArrow,"right","right","right"),i(t.DownArrow,"down","down","down"),i(t.LeftArrow,"left","left","left"),i(e.Alt|t.KeyA,"alt+a","alt+a","alt+a"),i(e.CtrlCmd|t.KeyA,"ctrl+a","cmd+a","ctrl+a"),i(e.Shift|t.KeyA,"shift+a","shift+a","shift+a"),i(e.WinCtrl|t.KeyA,"win+a","ctrl+a","meta+a"),i(e.CtrlCmd|e.Alt|t.KeyA,"ctrl+alt+a","alt+cmd+a","ctrl+alt+a"),i(e.CtrlCmd|e.Shift|t.KeyA,"ctrl+shift+a","shift+cmd+a","ctrl+shift+a"),i(e.CtrlCmd|e.WinCtrl|t.KeyA,"ctrl+win+a","ctrl+cmd+a","ctrl+meta+a"),i(e.Shift|e.Alt|t.KeyA,"shift+alt+a","shift+alt+a","shift+alt+a"),i(e.Shift|e.WinCtrl|t.KeyA,"shift+win+a","ctrl+shift+a","shift+meta+a"),i(e.Alt|e.WinCtrl|t.KeyA,"alt+win+a","ctrl+alt+a","alt+meta+a"),i(e.CtrlCmd|e.Shift|e.Alt|t.KeyA,"ctrl+shift+alt+a","shift+alt+cmd+a","ctrl+shift+alt+a"),i(e.CtrlCmd|e.Shift|e.WinCtrl|t.KeyA,"ctrl+shift+win+a","ctrl+shift+cmd+a","ctrl+shift+meta+a"),i(e.Shift|e.Alt|e.WinCtrl|t.KeyA,"shift+alt+win+a","ctrl+shift+alt+a","shift+alt+meta+a"),i(e.CtrlCmd|e.Shift|e.Alt|e.WinCtrl|t.KeyA,"ctrl+shift+alt+win+a","ctrl+shift+alt+cmd+a","ctrl+shift+alt+meta+a"),i(_(e.CtrlCmd|t.KeyA,e.CtrlCmd|t.KeyA),"ctrl+a ctrl+a","cmd+a cmd+a","ctrl+a ctrl+a"),i(_(e.CtrlCmd|t.UpArrow,e.CtrlCmd|t.UpArrow),"ctrl+up ctrl+up","cmd+up cmd+up","ctrl+up ctrl+up"),i(t.Semicolon,";",";",";"),i(t.Equal,"=","=","="),i(t.Comma,",",",",","),i(t.Minus,"-","-","-"),i(t.Period,".",".","."),i(t.Slash,"/","/","/"),i(t.Backquote,"`","`","`"),i(t.ABNT_C1,"abnt_c1","abnt_c1","abnt_c1"),i(t.ABNT_C2,"abnt_c2","abnt_c2","abnt_c2"),i(t.BracketLeft,"[","[","["),i(t.Backslash,"\\","\\","\\"),i(t.BracketRight,"]","]","]"),i(t.Quote,"'","'","'"),i(t.OEM_8,"oem_8","oem_8","oem_8"),i(t.IntlBackslash,"oem_102","oem_102","oem_102"),a("OEM_1","OEM_1","OEM_1",t.Semicolon),a("OEM_PLUS","OEM_PLUS","OEM_PLUS",t.Equal),a("OEM_COMMA","OEM_COMMA","OEM_COMMA",t.Comma),a("OEM_MINUS","OEM_MINUS","OEM_MINUS",t.Minus),a("OEM_PERIOD","OEM_PERIOD","OEM_PERIOD",t.Period),a("OEM_2","OEM_2","OEM_2",t.Slash),a("OEM_3","OEM_3","OEM_3",t.Backquote),a("ABNT_C1","ABNT_C1","ABNT_C1",t.ABNT_C1),a("ABNT_C2","ABNT_C2","ABNT_C2",t.ABNT_C2),a("OEM_4","OEM_4","OEM_4",t.BracketLeft),a("OEM_5","OEM_5","OEM_5",t.Backslash),a("OEM_6","OEM_6","OEM_6",t.BracketRight),a("OEM_7","OEM_7","OEM_7",t.Quote),a("OEM_8","OEM_8","OEM_8",t.OEM_8),a("OEM_102","OEM_102","OEM_102",t.IntlBackslash),a("ctrl-shift-alt-win-a","ctrl-shift-alt-cmd-a","ctrl-shift-alt-meta-a",e.CtrlCmd|e.Shift|e.Alt|e.WinCtrl|t.KeyA),a(" ctrl-shift-alt-win-A "," shift-alt-cmd-Ctrl-A "," ctrl-shift-alt-META-A ",e.CtrlCmd|e.Shift|e.Alt|e.WinCtrl|t.KeyA)}),test("deserialize scan codes",()=>{d.deepStrictEqual(y.parseKeybinding("ctrl+shift+[comma] ctrl+/"),new g([new A(!0,!0,!1,!1,C.Comma),new E(!0,!1,!1,!1,t.Slash)]))}),test("issue #10452 - invalid command",()=>{const l=JSON.parse('[{ "key": "ctrl+k ctrl+f", "command": ["firstcommand", "seccondcommand"] }]')[0],r=O.readUserKeybindingItem(l);d.strictEqual(r.command,null)}),test("issue #10452 - invalid when",()=>{const l=JSON.parse('[{ "key": "ctrl+k ctrl+f", "command": "firstcommand", "when": [] }]')[0],r=O.readUserKeybindingItem(l);d.strictEqual(r.when,void 0)}),test("issue #10452 - invalid key",()=>{const l=JSON.parse('[{ "key": [], "command": "firstcommand" }]')[0],r=O.readUserKeybindingItem(l);d.deepStrictEqual(r.keybinding,null)}),test("issue #10452 - invalid key 2",()=>{const l=JSON.parse('[{ "key": "", "command": "firstcommand" }]')[0],r=O.readUserKeybindingItem(l);d.deepStrictEqual(r.keybinding,null)}),test("test commands args",()=>{const l=JSON.parse('[{ "key": "ctrl+k ctrl+f", "command": "firstcommand", "when": [], "args": { "text": "theText" } }]')[0],r=O.readUserKeybindingItem(l);d.strictEqual(r.commandArgs.text,"theText")})});