const r="Offline";function n(e){return e instanceof t?!0:e instanceof Error&&e.name===r&&e.message===r}class t extends Error{constructor(){super(r),this.name=this.message}}export{t as OfflineError,n as isOfflineError};
