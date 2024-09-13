var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  bufferToStream,
  streamToBuffer
} from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
class RequestChannel {
  constructor(service) {
    this.service = service;
  }
  static {
    __name(this, "RequestChannel");
  }
  listen(context, event) {
    throw new Error("Invalid listen");
  }
  call(context, command, args, token = CancellationToken.None) {
    switch (command) {
      case "request":
        return this.service.request(args[0], token).then(async ({ res, stream }) => {
          const buffer = await streamToBuffer(stream);
          return [
            {
              statusCode: res.statusCode,
              headers: res.headers
            },
            buffer
          ];
        });
      case "resolveProxy":
        return this.service.resolveProxy(args[0]);
      case "lookupAuthorization":
        return this.service.lookupAuthorization(args[0]);
      case "lookupKerberosAuthorization":
        return this.service.lookupKerberosAuthorization(args[0]);
      case "loadCertificates":
        return this.service.loadCertificates();
    }
    throw new Error("Invalid call");
  }
}
class RequestChannelClient {
  constructor(channel) {
    this.channel = channel;
  }
  static {
    __name(this, "RequestChannelClient");
  }
  async request(options, token) {
    const [res, buffer] = await this.channel.call(
      "request",
      [options],
      token
    );
    return { res, stream: bufferToStream(buffer) };
  }
  async resolveProxy(url) {
    return this.channel.call("resolveProxy", [url]);
  }
  async lookupAuthorization(authInfo) {
    return this.channel.call("lookupAuthorization", [authInfo]);
  }
  async lookupKerberosAuthorization(url) {
    return this.channel.call(
      "lookupKerberosAuthorization",
      [url]
    );
  }
  async loadCertificates() {
    return this.channel.call("loadCertificates");
  }
}
export {
  RequestChannel,
  RequestChannelClient
};
//# sourceMappingURL=requestIpc.js.map
