/**
 * @import { IProductConfiguration } from './vs/base/common/product'
 */
/** @type Partial<IProductConfiguration> & { BUILD_INSERT_PRODUCT_CONFIGURATION?: string } */
declare let productObj: Partial<IProductConfiguration> & {
    BUILD_INSERT_PRODUCT_CONFIGURATION?: string;
};
/** @type object & { BUILD_INSERT_PACKAGE_CONFIGURATION?: string } */
declare let pkgObj: object & {
    BUILD_INSERT_PACKAGE_CONFIGURATION?: string;
};
import type { IProductConfiguration } from './vs/base/common/product';
export { productObj as product, pkgObj as pkg };
