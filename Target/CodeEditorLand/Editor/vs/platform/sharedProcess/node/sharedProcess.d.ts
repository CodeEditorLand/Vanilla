import { IStringDictionary } from "../../../base/common/collections.js";
import { UriComponents, UriDto } from "../../../base/common/uri.js";
import { NativeParsedArgs } from "../../environment/common/argv.js";
import { ILoggerResource, LogLevel } from "../../log/common/log.js";
import { PolicyDefinition, PolicyValue } from "../../policy/common/policy.js";
import { IUserDataProfile } from "../../userDataProfile/common/userDataProfile.js";
export interface ISharedProcessConfiguration {
    readonly machineId: string;
    readonly sqmId: string;
    readonly devDeviceId: string;
    readonly codeCachePath: string | undefined;
    readonly args: NativeParsedArgs;
    readonly logLevel: LogLevel;
    readonly loggers: UriDto<ILoggerResource>[];
    readonly profiles: {
        readonly home: UriComponents;
        readonly all: readonly UriDto<IUserDataProfile>[];
    };
    readonly policiesData?: IStringDictionary<{
        definition: PolicyDefinition;
        value: PolicyValue;
    }>;
}
