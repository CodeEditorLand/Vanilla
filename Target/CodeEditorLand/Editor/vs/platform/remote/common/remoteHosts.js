import { Schemas } from "../../../base/common/network.js";
function getRemoteAuthority(uri) {
  return uri.scheme === Schemas.vscodeRemote ? uri.authority : void 0;
}
function getRemoteName(authority) {
  if (!authority) {
    return void 0;
  }
  const pos = authority.indexOf("+");
  if (pos < 0) {
    return authority;
  }
  return authority.substr(0, pos);
}
function parseAuthorityWithPort(authority) {
  const { host, port } = parseAuthority(authority);
  if (typeof port === "undefined") {
    throw new Error(
      `Invalid remote authority: ${authority}. It must either be a remote of form <remoteName>+<arg> or a remote host of form <host>:<port>.`
    );
  }
  return { host, port };
}
function parseAuthorityWithOptionalPort(authority, defaultPort) {
  let { host, port } = parseAuthority(authority);
  if (typeof port === "undefined") {
    port = defaultPort;
  }
  return { host, port };
}
function parseAuthority(authority) {
  const m1 = authority.match(/^(\[[0-9a-z:]+\]):(\d+)$/);
  if (m1) {
    return { host: m1[1], port: Number.parseInt(m1[2], 10) };
  }
  const m2 = authority.match(/^(\[[0-9a-z:]+\])$/);
  if (m2) {
    return { host: m2[1], port: void 0 };
  }
  const m3 = authority.match(/(.*):(\d+)$/);
  if (m3) {
    return { host: m3[1], port: Number.parseInt(m3[2], 10) };
  }
  return { host: authority, port: void 0 };
}
export {
  getRemoteAuthority,
  getRemoteName,
  parseAuthorityWithOptionalPort,
  parseAuthorityWithPort
};
