import r from"assert";import{Extensions as l}from"../../../../../platform/theme/common/colorRegistry.js";import{Registry as n}from"../../../../../platform/registry/common/platform.js";import{ansiColorIdentifiers as c,registerColors as a}from"../../common/terminalColorRegistry.js";import"../../../../../platform/theme/common/themeService.js";import{Color as i}from"../../../../../base/common/color.js";import{ColorScheme as s}from"../../../../../platform/theme/common/theme.js";import{ensureNoDisposablesAreLeakedInTestSuite as m}from"../../../../../base/test/common/utils.js";a();const d=n.as(l.ColorContribution);function f(o){const e={selector:"",label:"",type:o,getColor:t=>d.resolveDefaultColor(t,e),defines:()=>!0,getTokenStyleMetadata:()=>{},tokenColorMap:[],semanticHighlighting:!1};return e}suite("Workbench - TerminalColorRegistry",()=>{m(),test("hc colors",function(){const o=f(s.HIGH_CONTRAST_DARK),e=c.map(t=>i.Format.CSS.formatHexA(o.getColor(t),!0));r.deepStrictEqual(e,["#000000","#cd0000","#00cd00","#cdcd00","#0000ee","#cd00cd","#00cdcd","#e5e5e5","#7f7f7f","#ff0000","#00ff00","#ffff00","#5c5cff","#ff00ff","#00ffff","#ffffff"],"The high contrast terminal colors should be used when the hc theme is active")}),test("light colors",function(){const o=f(s.LIGHT),e=c.map(t=>i.Format.CSS.formatHexA(o.getColor(t),!0));r.deepStrictEqual(e,["#000000","#cd3131","#107c10","#949800","#0451a5","#bc05bc","#0598bc","#555555","#666666","#cd3131","#14ce14","#b5ba00","#0451a5","#bc05bc","#0598bc","#a5a5a5"],"The light terminal colors should be used when the light theme is active")}),test("dark colors",function(){const o=f(s.DARK),e=c.map(t=>i.Format.CSS.formatHexA(o.getColor(t),!0));r.deepStrictEqual(e,["#000000","#cd3131","#0dbc79","#e5e510","#2472c8","#bc3fbc","#11a8cd","#e5e5e5","#666666","#f14c4c","#23d18b","#f5f543","#3b8eea","#d670d6","#29b8db","#e5e5e5"],"The dark terminal colors should be used when a dark theme is active")})});
