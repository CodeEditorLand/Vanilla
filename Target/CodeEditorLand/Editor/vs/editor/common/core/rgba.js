class n{_rgba8Brand=void 0;static Empty=new n(0,0,0,0);r;g;b;a;constructor(r,u,b,e){this.r=n._clamp(r),this.g=n._clamp(u),this.b=n._clamp(b),this.a=n._clamp(e)}equals(r){return this.r===r.r&&this.g===r.g&&this.b===r.b&&this.a===r.a}static _clamp(r){return r<0?0:r>255?255:r|0}}export{n as RGBA8};
