import n from"assert";import{runWithFakedTimers as a}from"../../../../base/test/common/timeTravelScheduler.js";import{ensureNoDisposablesAreLeakedInTestSuite as m}from"../../../../base/test/common/utils.js";import{AsyncProgress as u}from"../../common/progress.js";suite("Progress",()=>{m(),test("multiple report calls are processed in sequence",async()=>{await a({useFakeTimers:!0,maxTaskCount:100},async()=>{const t=[],r=e=>new Promise(i=>setTimeout(i,e)),o=async e=>{t.push(`start ${e}`),e===1?await r(100):e===2?await r(50):await r(10),t.push(`end ${e}`)},s=new u(o);s.report(1),s.report(2),s.report(3),await r(1e3),n.deepStrictEqual(t,["start 1","end 1","start 2","end 2","start 3","end 3"])})})});
