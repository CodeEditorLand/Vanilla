import{isMacintosh as i}from"../../../../vs/base/common/platform.js";import{getdevDeviceId as n,getMachineId as o,getSqmMachineId as a}from"../../../../vs/base/node/id.js";import"../../../../vs/platform/log/common/log.js";import"../../../../vs/platform/state/node/state.js";import{devDeviceIdKey as d,machineIdKey as c,sqmIdKey as I}from"../../../../vs/platform/telemetry/common/telemetry.js";async function b(r,t){let e=r.getItem(c);return(typeof e!="string"||i&&e==="6c9d2bc8f91b89624add29c0abeae7fb42bf539fa1cdb2e3e57cd668fa9bcead")&&(e=await o(t.error.bind(t))),e}async function y(r,t){let e=r.getItem(I);return typeof e!="string"&&(e=await a(t.error.bind(t))),e}async function h(r,t){let e=r.getItem(d);return typeof e!="string"&&(e=await n(t.error.bind(t))),e}export{b as resolveMachineId,y as resolveSqmId,h as resolvedevDeviceId};