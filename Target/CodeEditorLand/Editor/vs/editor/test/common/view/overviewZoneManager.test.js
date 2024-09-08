import s from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as H}from"../../../../base/test/common/utils.js";import{ColorZone as t,OverviewRulerZone as n,OverviewZoneManager as i}from"../../../common/viewModel/overviewZoneManager.js";suite("Editor View - OverviewZoneManager",()=>{H(),test("pixel ratio 1, dom height 600",()=>{const e=new i(o=>20*o);e.setDOMWidth(30),e.setDOMHeight(600),e.setOuterHeight(50*20),e.setLineHeight(20),e.setPixelRatio(1),e.setZones([new n(1,1,0,"1"),new n(10,10,0,"2"),new n(30,31,0,"3"),new n(50,50,0,"4")]),s.deepStrictEqual(e.resolveColorZones(),[new t(12,24,1),new t(120,132,2),new t(360,384,3),new t(588,600,4)])}),test("pixel ratio 1, dom height 300",()=>{const e=new i(o=>20*o);e.setDOMWidth(30),e.setDOMHeight(300),e.setOuterHeight(50*20),e.setLineHeight(20),e.setPixelRatio(1),e.setZones([new n(1,1,0,"1"),new n(10,10,0,"2"),new n(30,31,0,"3"),new n(50,50,0,"4")]),s.deepStrictEqual(e.resolveColorZones(),[new t(6,12,1),new t(60,66,2),new t(180,192,3),new t(294,300,4)])}),test("pixel ratio 2, dom height 300",()=>{const e=new i(o=>20*o);e.setDOMWidth(30),e.setDOMHeight(300),e.setOuterHeight(50*20),e.setLineHeight(20),e.setPixelRatio(2),e.setZones([new n(1,1,0,"1"),new n(10,10,0,"2"),new n(30,31,0,"3"),new n(50,50,0,"4")]),s.deepStrictEqual(e.resolveColorZones(),[new t(12,24,1),new t(120,132,2),new t(360,384,3),new t(588,600,4)])})});
