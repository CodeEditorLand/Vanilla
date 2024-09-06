import { IHoverDelegate, IScopedHoverDelegate } from "vs/base/browser/ui/hover/hoverDelegate";
export declare function setHoverDelegateFactory(hoverDelegateProvider: (placement: "mouse" | "element", enableInstantHover: boolean) => IScopedHoverDelegate): void;
export declare function getDefaultHoverDelegate(placement: "mouse" | "element"): IHoverDelegate;
export declare function createInstantHoverDelegate(): IScopedHoverDelegate;
