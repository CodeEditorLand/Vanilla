import type { URI } from "../../../../base/common/uri.js";
import type { IUserDataProfile } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import type { IEditorPane } from "../../../common/editor.js";
export interface IUserDataProfilesEditor extends IEditorPane {
    createNewProfile(copyFrom?: URI | IUserDataProfile): Promise<void>;
    selectProfile(profile: IUserDataProfile): void;
}
