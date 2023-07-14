import { mapValues, omitBy } from 'lodash-es'

export type URLSearchParamsInit =
  | URLSearchParams
  | string
  | Record<string, string | number | boolean | undefined>

export function toURLSearchParams(params: URLSearchParamsInit) {
  if (params instanceof URLSearchParams) return params
  if (typeof params === 'string') return new URLSearchParams(params)
  return new URLSearchParams(
    mapValues(
      omitBy(params, (value) => value === undefined),
      (value) => String(value)
    )
  )
}
