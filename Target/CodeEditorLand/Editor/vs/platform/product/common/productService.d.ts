import { IProductConfiguration } from "vs/base/common/product";
export declare const IProductService: any;
export interface IProductService extends Readonly<IProductConfiguration> {
    readonly _serviceBrand: undefined;
}
export declare const productSchemaId = "vscode://schemas/vscode-product";
