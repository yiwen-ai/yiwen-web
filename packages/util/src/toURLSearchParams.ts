import { mapValues, omitBy } from 'lodash-es'

export type URLSearchParamsInit =
  | URLSearchParams
  | string
  | Record<string, string | number | boolean | null | undefined>

export function toURLSearchParams(params: URLSearchParamsInit) {
  if (params instanceof URLSearchParams) return params
  if (typeof params === 'string') return new URLSearchParams(params)
  return new URLSearchParams(
    mapValues(
      omitBy(params, (value) => value == null),
      (value) => String(value)
    )
  )
}

export function mergeURLSearchParams(
  target: URLSearchParams,
  params: URLSearchParamsInit
) {
  const result = new URLSearchParams(target)
  toURLSearchParams(params).forEach((value, key) => result.set(key, value))
  return result
}
