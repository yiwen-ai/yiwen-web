import { mapValues, omitBy } from 'lodash-es'

export type URLSearchParamsInit =
  | URLSearchParams
  | Record<string, string | number | boolean | undefined>

export function toURLSearchParams(params: URLSearchParamsInit) {
  if (params instanceof URLSearchParams) return params
  return new URLSearchParams(
    mapValues(
      omitBy(params, (value) => value === undefined),
      (value) => String(value)
    )
  )
}
