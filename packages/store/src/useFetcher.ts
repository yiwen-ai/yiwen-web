import { joinURL, type URLSearchParamsInit } from '@yiwen-ai/util'
import { compact } from 'lodash-es'
import { createContext, useContext, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { decode, encode } from './CBOR'
import { useLogger, type Logger } from './logger'

//#region fetcher config
export interface FetcherConfig {
  PUBLIC_PATH: string
  API_URL: string
  AUTH_URL: string
  SHARE_URL: string
}

const FetcherConfigContext = createContext<FetcherConfig | undefined>(undefined)

export const FetcherConfigProvider = FetcherConfigContext.Provider

export function useFetcherConfig() {
  return useContext(FetcherConfigContext)
}
//#endregion

//#region request
const CBOR_MIME_TYPE = 'application/cbor'
const JSON_MIME_TYPE = 'application/json'

export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export function createRequest(
  logger: Logger,
  baseURL: string,
  defaultOptions: RequestInit
) {
  const request = async <T>(
    path: string,
    params?: URLSearchParamsInit,
    options?: RequestInit
  ) => {
    const url = joinURL(baseURL, path, params)
    const headers = new Headers(defaultOptions.headers)
    new Headers(options?.headers).forEach((value, key) =>
      headers.set(key, value)
    )
    if (!headers.has('Accept')) headers.set('Accept', CBOR_MIME_TYPE)
    const resp = await fetch(url, { ...defaultOptions, ...options, headers })
    const { status } = resp
    const body =
      resp.headers.get('Content-Type') === CBOR_MIME_TYPE
        ? decode(new Uint8Array(await resp.arrayBuffer()))
        : resp.headers.get('Content-Type')?.startsWith(JSON_MIME_TYPE)
        ? await resp.json()
        : await resp.text()
    if (status >= 200 && status < 300) {
      return body as T
    } else {
      const requestId = resp.headers.get('X-Request-Id')
      const error = createRequestError(status, body, requestId) ?? body
      logger.error('fetch error', { url, status, error, requestId })
      throw error
    }
  }
  request.defaultOptions = Object.freeze(defaultOptions)
  request.get = <T>(path: string, params?: URLSearchParamsInit) => {
    return request<T>(path, params, {
      method: RequestMethod.GET,
    })
  }
  request.post = <T>(path: string, body?: object) => {
    return request<T>(path, undefined, {
      method: RequestMethod.POST,
      body: body ? encode(body) : null,
      headers: { 'Content-Type': CBOR_MIME_TYPE },
    })
  }
  request.put = <T>(path: string, body?: object) => {
    return request<T>(path, undefined, {
      method: RequestMethod.PUT,
      body: body ? encode(body) : null,
      headers: { 'Content-Type': CBOR_MIME_TYPE },
    })
  }
  request.patch = <T>(path: string, body?: object) => {
    return request<T>(path, undefined, {
      method: RequestMethod.PATCH,
      body: body ? encode(body) : null,
      headers: { 'Content-Type': CBOR_MIME_TYPE },
    })
  }
  request.delete = <T>(
    path: string,
    params?: URLSearchParamsInit,
    body?: object
  ) => {
    return request<T>(path, params, {
      method: RequestMethod.DELETE,
      body: body ? encode(body) : null,
      headers: { 'Content-Type': CBOR_MIME_TYPE },
    })
  }
  return request
}

export function useRequest(baseURL: string, options: RequestInit) {
  const logger = useLogger()
  const headers = Array.from(new Headers(options.headers).entries())
  const stringifiedOptions = JSON.stringify({ ...options, headers })
  return useMemo(
    () => createRequest(logger, baseURL, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseURL, logger, stringifiedOptions]
  )
}
//#endregion

//#region fetcher
export function useFetcher(baseURL?: string) {
  const config = useFetcherConfig()
  const { accessToken } = useAuth()
  const logger = useLogger()
  return useMemo(() => {
    const API_URL = baseURL ?? config?.API_URL
    if (!API_URL) {
      logger.debug('fetcher config is not ready', { config: { API_URL } })
      throw new ReferenceError('invalid fetcher config')
    }
    return createRequest(logger, API_URL, {
      credentials: 'include',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
  }, [accessToken, baseURL, config?.API_URL, logger])
}
//#endregion

//#region request error
function createRequestError(
  status: number,
  body: unknown,
  requestId: string | null
) {
  if (
    typeof body === 'object' &&
    !!body &&
    'error' in body &&
    typeof body.error === 'string' &&
    'message' in body &&
    typeof body.message === 'string'
  ) {
    return new RequestError(status, body.error, body.message, requestId)
  }
  return null
}

export class RequestError extends Error {
  constructor(
    public status: number,
    name: string,
    message: string,
    public requestId: string | null
  ) {
    super(message)
    this.name = name
  }

  toString() {
    if (this.requestId) return ['Request ID', this.requestId].join(': ')
    return compact([this.status, this.name]).join(' ')
  }
}

export function toMessage(error: unknown) {
  if (error instanceof RequestError) {
    return error.toString()
  }
  if (typeof error === 'string') {
    return error
  }
  if (
    typeof error === 'object' &&
    !!error &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }
  return undefined
}
//#endregion
