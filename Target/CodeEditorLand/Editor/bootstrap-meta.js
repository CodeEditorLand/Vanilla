import { createRequire } from "node:module";
const require2 = createRequire(import.meta.url);
const module = { exports: {} };
let productObj = {
  BUILD_INSERT_PRODUCT_CONFIGURATION: "BUILD_INSERT_PRODUCT_CONFIGURATION"
};
if (productObj["BUILD_INSERT_PRODUCT_CONFIGURATION"]) {
  productObj = require2("../product.json");
}
let pkgObj = {
  BUILD_INSERT_PACKAGE_CONFIGURATION: "BUILD_INSERT_PACKAGE_CONFIGURATION"
};
if (pkgObj["BUILD_INSERT_PACKAGE_CONFIGURATION"]) {
  pkgObj = require2("../package.json");
}
module.exports.product = productObj;
module.exports.pkg = pkgObj;
const product = module.exports.product;
const pkg = module.exports.pkg;
export {
  pkg,
  product
};
//# sourceMappingURL=bootstrap-meta.js.map
