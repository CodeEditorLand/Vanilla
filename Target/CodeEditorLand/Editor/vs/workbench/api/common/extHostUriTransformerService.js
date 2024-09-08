import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
const IURITransformerService = createDecorator(
  "IURITransformerService"
);
class URITransformerService {
  transformIncoming;
  transformOutgoing;
  transformOutgoingURI;
  transformOutgoingScheme;
  constructor(delegate) {
    if (delegate) {
      this.transformIncoming = delegate.transformIncoming.bind(delegate);
      this.transformOutgoing = delegate.transformOutgoing.bind(delegate);
      this.transformOutgoingURI = delegate.transformOutgoingURI.bind(delegate);
      this.transformOutgoingScheme = delegate.transformOutgoingScheme.bind(delegate);
    } else {
      this.transformIncoming = (arg) => arg;
      this.transformOutgoing = (arg) => arg;
      this.transformOutgoingURI = (arg) => arg;
      this.transformOutgoingScheme = (arg) => arg;
    }
  }
}
export {
  IURITransformerService,
  URITransformerService
};
