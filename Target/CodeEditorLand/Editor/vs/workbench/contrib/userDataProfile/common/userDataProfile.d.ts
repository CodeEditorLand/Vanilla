import { URI } from "vs/base/common/uri";
import { IUserDataProfile } from "vs/platform/userDataProfile/common/userDataProfile";
import { IEditorPane } from "vs/workbench/common/editor";
export interface IUserDataProfilesEditor extends IEditorPane {
    createNewProfile(copyFrom?: URI | IUserDataProfile): Promise<void>;
    selectProfile(profile: IUserDataProfile): void;
}
