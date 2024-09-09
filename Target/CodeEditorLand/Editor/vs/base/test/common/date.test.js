import{strictEqual as e}from"assert";import{fromNow as s,fromNowByDay as n,getDurationString as t}from"../../common/date.js";import{ensureNoDisposablesAreLeakedInTestSuite as a}from"./utils.js";suite("Date",()=>{a(),suite("fromNow",()=>{test("appendAgoLabel",()=>{e(s(Date.now()-35e3),"35 secs"),e(s(Date.now()-35e3,!1),"35 secs"),e(s(Date.now()-35e3,!0),"35 secs ago")}),test("useFullTimeWords",()=>{e(s(Date.now()-35e3),"35 secs"),e(s(Date.now()-35e3,void 0,!1),"35 secs"),e(s(Date.now()-35e3,void 0,!0),"35 seconds")}),test("disallowNow",()=>{e(s(Date.now()-5e3),"now"),e(s(Date.now()-5e3,void 0,void 0,!1),"now"),e(s(Date.now()-5e3,void 0,void 0,!0),"5 secs")})}),suite("fromNowByDay",()=>{test("today",()=>{e(n(new Date),"Today")}),test("yesterday",()=>{const o=new Date;o.setDate(o.getDate()-1),e(n(o),"Yesterday")}),test("daysAgo",()=>{const o=new Date;o.setDate(o.getDate()-5),e(n(o,!0),"5 days ago")})}),suite("getDurationString",()=>{test("basic",()=>{e(t(1),"1ms"),e(t(999),"999ms"),e(t(1e3),"1s"),e(t(1e3*60-1),"59.999s"),e(t(1e3*60),"1 mins"),e(t(1e3*60*60-1),"60 mins"),e(t(1e3*60*60),"1 hrs"),e(t(1e3*60*60*24-1),"24 hrs"),e(t(1e3*60*60*24),"1 days")}),test("useFullTimeWords",()=>{e(t(1,!0),"1 milliseconds"),e(t(999,!0),"999 milliseconds"),e(t(1e3,!0),"1 seconds"),e(t(1e3*60-1,!0),"59.999 seconds"),e(t(1e3*60,!0),"1 minutes"),e(t(1e3*60*60-1,!0),"60 minutes"),e(t(1e3*60*60,!0),"1 hours"),e(t(1e3*60*60*24-1,!0),"24 hours"),e(t(1e3*60*60*24,!0),"1 days")})})});
