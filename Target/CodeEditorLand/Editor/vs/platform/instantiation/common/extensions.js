import{SyncDescriptor as r}from"./descriptors.js";import"./instantiation.js";const n=[];var c=(e=>(e[e.Eager=0]="Eager",e[e.Delayed=1]="Delayed",e))(c||{});function v(t,i,e){i instanceof r||(i=new r(i,[],!!e)),n.push([t,i])}function a(){return n}export{c as InstantiationType,a as getSingletonServiceDescriptors,v as registerSingleton};