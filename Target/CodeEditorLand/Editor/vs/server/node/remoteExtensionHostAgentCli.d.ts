import { OptionDescriptions } from "vs/platform/environment/node/argv";
import { ServerParsedArgs } from "vs/server/node/serverEnvironmentService";
export declare function run(args: ServerParsedArgs, REMOTE_DATA_FOLDER: string, optionDescriptions: OptionDescriptions<ServerParsedArgs>): Promise<void>;
