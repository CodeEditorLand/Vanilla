var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function load(name, req, load2, config) {
  config = config || {};
  const cssConfig = config["vs/css"] || {};
  if (cssConfig.disabled) {
    load2({});
    return;
  }
  const cssUrl = req.toUrl(name + ".css");
  loadCSS(name, cssUrl, () => {
    load2({});
  }, (err) => {
    if (typeof load2.error === "function") {
      load2.error("Could not find " + cssUrl + ".");
    }
  });
}
__name(load, "load");
function loadCSS(name, cssUrl, callback, errorback) {
  if (linkTagExists(name, cssUrl)) {
    callback();
    return;
  }
  createLinkTag(name, cssUrl, callback, errorback);
}
__name(loadCSS, "loadCSS");
function linkTagExists(name, cssUrl) {
  const links = window.document.getElementsByTagName("link");
  for (let i = 0, len = links.length; i < len; i++) {
    const nameAttr = links[i].getAttribute("data-name");
    const hrefAttr = links[i].getAttribute("href");
    if (nameAttr === name || hrefAttr === cssUrl) {
      return true;
    }
  }
  return false;
}
__name(linkTagExists, "linkTagExists");
function createLinkTag(name, cssUrl, callback, errorback) {
  const linkNode = document.createElement("link");
  linkNode.setAttribute("rel", "stylesheet");
  linkNode.setAttribute("type", "text/css");
  linkNode.setAttribute("data-name", name);
  attachListeners(name, linkNode, callback, errorback);
  linkNode.setAttribute("href", cssUrl);
  const head = window.document.head || window.document.getElementsByTagName("head")[0];
  head.appendChild(linkNode);
}
__name(createLinkTag, "createLinkTag");
function attachListeners(name, linkNode, callback, errorback) {
  const unbind = /* @__PURE__ */ __name(() => {
    linkNode.removeEventListener("load", loadEventListener);
    linkNode.removeEventListener("error", errorEventListener);
  }, "unbind");
  const loadEventListener = /* @__PURE__ */ __name((e) => {
    unbind();
    callback();
  }, "loadEventListener");
  const errorEventListener = /* @__PURE__ */ __name((e) => {
    unbind();
    errorback(e);
  }, "errorEventListener");
  linkNode.addEventListener("load", loadEventListener);
  linkNode.addEventListener("error", errorEventListener);
}
__name(attachListeners, "attachListeners");
export {
  load
};
//# sourceMappingURL=css.js.map
