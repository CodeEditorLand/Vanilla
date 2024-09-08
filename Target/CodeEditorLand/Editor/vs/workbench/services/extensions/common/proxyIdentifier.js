class ProxyIdentifier {
  static count = 0;
  _proxyIdentifierBrand = void 0;
  sid;
  nid;
  constructor(sid) {
    this.sid = sid;
    this.nid = ++ProxyIdentifier.count;
  }
}
const identifiers = [];
function createProxyIdentifier(identifier) {
  const result = new ProxyIdentifier(identifier);
  identifiers[result.nid] = result;
  return result;
}
function getStringIdentifierForProxy(nid) {
  return identifiers[nid].sid;
}
class SerializableObjectWithBuffers {
  constructor(value) {
    this.value = value;
  }
}
export {
  ProxyIdentifier,
  SerializableObjectWithBuffers,
  createProxyIdentifier,
  getStringIdentifierForProxy
};
