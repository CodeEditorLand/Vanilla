/**
 * @param {IResolveNLSConfigurationContext} context
 * @returns {Promise<INLSConfiguration>}
 */
export function resolveNLSConfiguration({ userLocale, osLocale, userDataPath, commit, nlsMetadataPath, }: IResolveNLSConfigurationContext): Promise<INLSConfiguration>;
import type { IResolveNLSConfigurationContext } from './nls';
import type { INLSConfiguration } from '../../nls';
