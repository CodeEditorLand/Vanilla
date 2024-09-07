import*as o from"fs";import e from"assert";import{tmpdir as i}from"os";import{realcase as s,realcaseSync as p,realpath as l,realpathSync as c}from"../../node/extpath.js";import{Promises as n}from"../../node/pfs.js";import{ensureNoDisposablesAreLeakedInTestSuite as m}from"../common/utils.js";import{flakySuite as u,getRandomTestPath as f}from"./testUtils.js";u("Extpath",()=>{let r;setup(()=>(r=f(i(),"vsctests","extpath"),o.promises.mkdir(r,{recursive:!0}))),teardown(()=>n.rm(r)),test("realcaseSync",async()=>{if(process.platform==="win32"||process.platform==="darwin"){const t=r.toUpperCase(),a=p(t);a&&(e.notStrictEqual(a,t),e.strictEqual(a.toUpperCase(),t),e.strictEqual(a,r))}else{let t=p(r);e.strictEqual(t,r),t=p(r.toUpperCase()),e.strictEqual(t,r.toUpperCase())}}),test("realcase",async()=>{if(process.platform==="win32"||process.platform==="darwin"){const t=r.toUpperCase(),a=await s(t);a&&(e.notStrictEqual(a,t),e.strictEqual(a.toUpperCase(),t),e.strictEqual(a,r))}else{let t=await s(r);e.strictEqual(t,r),t=await s(r.toUpperCase()),e.strictEqual(t,r.toUpperCase())}}),test("realpath",async()=>{const t=await l(r);e.ok(t)}),test("realpathSync",()=>{const t=c(r);e.ok(t)}),m()});