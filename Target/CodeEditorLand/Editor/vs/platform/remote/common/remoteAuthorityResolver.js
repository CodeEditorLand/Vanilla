import{ErrorNoTelemetry as a}from"../../../../vs/base/common/errors.js";import"../../../../vs/base/common/event.js";import"../../../../vs/base/common/uri.js";import{createDecorator as s}from"../../../../vs/platform/instantiation/common/instantiation.js";const g=s("remoteAuthorityResolverService");var l=(o=>(o[o.WebSocket=0]="WebSocket",o[o.Managed=1]="Managed",o))(l||{});class m{constructor(e){this.id=e}type=1;toString(){return`Managed(${this.id})`}}class R{constructor(e,o){this.host=e;this.port=o}type=0;toString(){return`WebSocket(${this.host}:${this.port})`}}var c=(i=>(i.Unknown="Unknown",i.NotAvailable="NotAvailable",i.TemporarilyNotAvailable="TemporarilyNotAvailable",i.NoResolverFound="NoResolverFound",i.InvalidAuthority="InvalidAuthority",i))(c||{});class t extends a{static isNotAvailable(e){return e instanceof t&&e._code==="NotAvailable"}static isTemporarilyNotAvailable(e){return e instanceof t&&e._code==="TemporarilyNotAvailable"}static isNoResolverFound(e){return e instanceof t&&e._code==="NoResolverFound"}static isInvalidAuthority(e){return e instanceof t&&e._code==="InvalidAuthority"}static isHandled(e){return e instanceof t&&e.isHandled}_message;_code;_detail;isHandled;constructor(e,o="Unknown",r){super(e),this._message=e,this._code=o,this._detail=r,this.isHandled=o==="NotAvailable"&&r===!0,Object.setPrototypeOf(this,t.prototype)}}function h(n){const e=n.indexOf("+");return e===-1?n:n.substring(0,e)}export{g as IRemoteAuthorityResolverService,m as ManagedRemoteConnection,t as RemoteAuthorityResolverError,c as RemoteAuthorityResolverErrorCode,l as RemoteConnectionType,R as WebSocketRemoteConnection,h as getRemoteAuthorityPrefix};
