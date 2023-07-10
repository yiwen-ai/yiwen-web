import urlJoin from 'url-join'
import {
  toURLSearchParams,
  type URLSearchParamsInit,
} from './toURLSearchParams'

export function joinURL(
  baseURL: string,
  path: string,
  params?: URLSearchParamsInit
) {
  const search = toURLSearchParams(params ?? {}).toString()
  return urlJoin(baseURL, path, search ? `?${search}` : '')
}
