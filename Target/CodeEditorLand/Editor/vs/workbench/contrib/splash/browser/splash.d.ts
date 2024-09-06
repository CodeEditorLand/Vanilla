import { IPartsSplash } from "vs/platform/theme/common/themeService";
export declare const ISplashStorageService: any;
export interface ISplashStorageService {
    readonly _serviceBrand: undefined;
    saveWindowSplash(splash: IPartsSplash): Promise<void>;
}
