import"../../../../vs/platform/log/common/log.js";import"../../../../vs/platform/state/node/state.js";import{devDeviceIdKey as i,machineIdKey as t,sqmIdKey as s}from"../../../../vs/platform/telemetry/common/telemetry.js";import{resolvedevDeviceId as I,resolveMachineId as c,resolveSqmId as v}from"../../../../vs/platform/telemetry/node/telemetryUtils.js";async function f(e,o){const r=await c(e,o);return e.setItem(t,r),r}async function g(e,o){const r=await v(e,o);return e.setItem(s,r),r}async function p(e,o){const r=await I(e,o);return e.setItem(i,r),r}export{f as resolveMachineId,g as resolveSqmId,p as resolvedevDeviceId};