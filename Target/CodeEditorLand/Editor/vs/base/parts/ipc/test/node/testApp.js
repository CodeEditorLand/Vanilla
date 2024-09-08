import{Server as e}from"../../node/ipc.cp.js";import{TestChannel as r,TestService as t}from"./testService.js";const n=new e("test"),s=new t;n.registerChannel("test",new r(s));
