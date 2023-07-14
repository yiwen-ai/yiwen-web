import normalizePath from 'normalize-path'
import {
  toURLSearchParams,
  type URLSearchParamsInit,
} from './toURLSearchParams'

export function joinURL(
  baseURL: string,
  path: string,
  params?: URLSearchParamsInit
) {
  const url = new URL(baseURL)
  const search1 = url.search
  url.search = ''
  url.href += path === '' || path.startsWith('?') ? path : '/' + path
  url.pathname = normalizePath(url.pathname, false)
  const search2 = url.search
  url.search = search1
  toURLSearchParams(search2).forEach((value, key) => {
    url.searchParams.set(key, value)
  })
  toURLSearchParams(params ?? {}).forEach((value, key) => {
    url.searchParams.set(key, value)
  })
  return url.href
}
