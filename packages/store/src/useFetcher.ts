import {
  joinURL,
  toURLSearchParams,
  type URLSearchParamsInit,
} from '@yiwen-ai/util'
import { createContext, useContext, useMemo } from 'react'
import { decode, encode } from './CBOR'
import { useLogger, type Logger } from './logger'
import { useAccessToken } from './useAccessToken'

export interface FetcherConfig {
  PUBLIC_PATH: string
  API_URL: string
  AUTH_URL: string
}

const FetcherConfigContext = createContext({} as Partial<FetcherConfig>)

export const FetcherConfigProvider = FetcherConfigContext.Provider

export function useFetcherConfig() {
  return useContext(FetcherConfigContext)
}

interface RequestOptions extends RequestInit {
  baseURL: string
  logger: Logger
}

const CBOR_MIME_TYPE = 'application/cbor'

export function createRequest(defaultOptions: RequestOptions) {
  const defaultHeaders = new Headers(defaultOptions.headers)
  if (!defaultHeaders.has('Accept')) {
    defaultHeaders.set('Accept', CBOR_MIME_TYPE)
  }
  const request = async <T>(url: string, options?: RequestInit) => {
    const headers = new Headers(defaultHeaders)
    new Headers(options?.headers).forEach((value, key) =>
      headers.set(key, value)
    )
    url = joinURL(defaultOptions.baseURL, url)
    const resp = await fetch(url, { ...defaultOptions, ...options, headers })
    const body =
      resp.headers.get('Content-Type') === CBOR_MIME_TYPE
        ? decode(new Uint8Array(await resp.arrayBuffer()))
        : resp.headers.get('Content-Type')?.startsWith('application/json')
        ? await resp.json()
        : await resp.text()
    if (resp.status >= 200 && resp.status < 300) {
      return body as T
    } else {
      const error = body
      defaultOptions.logger.error('fetch error', {
        url,
        status: resp.status,
        error,
      })
      throw error
    }
  }
  request.defaultOptions = Object.freeze(defaultOptions)
  request.get = <T>(url: string, query?: URLSearchParamsInit) => {
    return request<T>(url, {
      method: 'GET',
      body: query ? toURLSearchParams(query) : null,
    })
  }
  request.post = <T>(url: string, body?: object) => {
    return request<T>(url, {
      method: 'POST',
      body: body ? encode(body) : null,
      headers: { 'Content-Type': CBOR_MIME_TYPE },
    })
  }
  request.put = <T>(url: string, body?: object) => {
    return request<T>(url, {
      method: 'PUT',
      body: body ? encode(body) : null,
      headers: { 'Content-Type': CBOR_MIME_TYPE },
    })
  }
  request.patch = <T>(url: string, body?: object) => {
    return request<T>(url, {
      method: 'PATCH',
      body: body ? encode(body) : null,
      headers: { 'Content-Type': CBOR_MIME_TYPE },
    })
  }
  request.delete = <T>(url: string, query?: URLSearchParamsInit) => {
    return request<T>(url, {
      method: 'DELETE',
      body: query ? toURLSearchParams(query) : null,
    })
  }
  return request
}

export function useRequest(options: RequestOptions) {
  const headers = Array.from(new Headers(options.headers).entries())
  const stringifiedOptions = JSON.stringify({ ...options, headers })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => createRequest(options), [stringifiedOptions])
}

export function useFetcher(baseURL?: string) {
  const { API_URL } = useFetcherConfig()
  const { accessToken } = useAccessToken()
  const logger = useLogger()
  return useMemo(() => {
    if (!API_URL) {
      logger.debug('fetcher config is not ready', { config: { API_URL } })
      return undefined
    }
    if (!accessToken) {
      logger.debug('missing access token', undefined)
      return undefined
    }
    return createRequest({
      baseURL: baseURL ?? API_URL,
      credentials: 'include',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      logger,
    })
  }, [API_URL, accessToken, baseURL, logger])
}

export function useAuthFetcher() {
  const { AUTH_URL } = useFetcherConfig()
  const logger = useLogger()
  return useMemo(() => {
    if (!AUTH_URL) {
      logger.debug('fetcher config is not ready', { config: { AUTH_URL } })
      return undefined
    }
    return createRequest({
      baseURL: AUTH_URL,
      credentials: 'include',
      logger,
    })
  }, [AUTH_URL, logger])
}
