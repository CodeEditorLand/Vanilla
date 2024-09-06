import"../../../../vs/base/common/event.js";import{createDecorator as i}from"../../../../vs/platform/instantiation/common/instantiation.js";var n=(a=>(a.Uninitialized="uninitialized",a.Idle="idle",a.Disabled="disabled",a.CheckingForUpdates="checking for updates",a.AvailableForDownload="available for download",a.Downloading="downloading",a.Downloaded="downloaded",a.Updating="updating",a.Ready="ready",a))(n||{}),p=(d=>(d[d.Setup=0]="Setup",d[d.Archive=1]="Archive",d[d.Snap=2]="Snap",d))(p||{}),r=(t=>(t[t.NotBuilt=0]="NotBuilt",t[t.DisabledByEnvironment=1]="DisabledByEnvironment",t[t.ManuallyDisabled=2]="ManuallyDisabled",t[t.MissingConfiguration=3]="MissingConfiguration",t[t.InvalidConfiguration=4]="InvalidConfiguration",t[t.RunningAsAdmin=5]="RunningAsAdmin",t))(r||{});const g={Uninitialized:{type:"uninitialized"},Disabled:e=>({type:"disabled",reason:e}),Idle:(e,o)=>({type:"idle",updateType:e,error:o}),CheckingForUpdates:e=>({type:"checking for updates",explicit:e}),AvailableForDownload:e=>({type:"available for download",update:e}),Downloading:{type:"downloading"},Downloaded:e=>({type:"downloaded",update:e}),Updating:e=>({type:"updating",update:e}),Ready:e=>({type:"ready",update:e})},U=i("updateService");export{r as DisablementReason,U as IUpdateService,g as State,n as StateType,p as UpdateType};