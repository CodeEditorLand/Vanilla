import e from"assert";import{getMachineId as r,getSqmMachineId as a,getdevDeviceId as i}from"../../node/id.js";import{getMac as n}from"../../node/macAddress.js";import{flakySuite as c}from"./testUtils.js";import{ensureNoDisposablesAreLeakedInTestSuite as d}from"../common/utils.js";c("ID",()=>{d(),test("getMachineId",async function(){const t=[],s=await r(o=>t.push(o));e.ok(s),e.strictEqual(t.length,0)}),test("getSqmId",async function(){const t=[],s=await a(o=>t.push(o));e.ok(typeof s=="string"),e.strictEqual(t.length,0)}),test("getdevDeviceId",async function(){const t=[],s=await i(o=>t.push(o));e.ok(typeof s=="string"),e.strictEqual(t.length,0)}),test("getMac",async()=>{const t=n();e.ok(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(t),`Expected a MAC address, got: ${t}`)})});
