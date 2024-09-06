import { IEnvironmentVariableCollectionDescription, IEnvironmentVariableCollection, IEnvironmentVariableMutator, ISerializableEnvironmentDescriptionMap as ISerializableEnvironmentDescriptionMap, ISerializableEnvironmentVariableCollection, ISerializableEnvironmentVariableCollections } from './environmentVariable.js';
export declare function serializeEnvironmentVariableCollection(collection: ReadonlyMap<string, IEnvironmentVariableMutator>): ISerializableEnvironmentVariableCollection;
export declare function serializeEnvironmentDescriptionMap(descriptionMap: ReadonlyMap<string, IEnvironmentVariableCollectionDescription> | undefined): ISerializableEnvironmentDescriptionMap;
export declare function deserializeEnvironmentVariableCollection(serializedCollection: ISerializableEnvironmentVariableCollection): Map<string, IEnvironmentVariableMutator>;
export declare function deserializeEnvironmentDescriptionMap(serializableEnvironmentDescription: ISerializableEnvironmentDescriptionMap | undefined): Map<string, IEnvironmentVariableCollectionDescription>;
export declare function serializeEnvironmentVariableCollections(collections: ReadonlyMap<string, IEnvironmentVariableCollection>): ISerializableEnvironmentVariableCollections;
export declare function deserializeEnvironmentVariableCollections(serializedCollection: ISerializableEnvironmentVariableCollections): Map<string, IEnvironmentVariableCollection>;
