import{createDecorator as t}from"../../../../platform/instantiation/common/instantiation.js";const c=t("lifecycleService");var i=(n=>(n[n.Default=1]="Default",n[n.Last=2]="Last",n))(i||{}),d=(e=>(e[e.CLOSE=1]="CLOSE",e[e.QUIT=2]="QUIT",e[e.RELOAD=3]="RELOAD",e[e.LOAD=4]="LOAD",e))(d||{}),a=(o=>(o[o.NewWindow=1]="NewWindow",o[o.ReloadedWindow=3]="ReloadedWindow",o[o.ReopenedWindow=4]="ReopenedWindow",o))(a||{});function s(r){switch(r){case 1:return"NewWindow";case 3:return"ReloadedWindow";case 4:return"ReopenedWindow"}}var l=(e=>(e[e.Starting=1]="Starting",e[e.Ready=2]="Ready",e[e.Restored=3]="Restored",e[e.Eventually=4]="Eventually",e))(l||{});function u(r){switch(r){case 1:return"Starting";case 2:return"Ready";case 3:return"Restored";case 4:return"Eventually"}}export{c as ILifecycleService,l as LifecyclePhase,u as LifecyclePhaseToString,d as ShutdownReason,a as StartupKind,s as StartupKindToString,i as WillShutdownJoinerOrder};
