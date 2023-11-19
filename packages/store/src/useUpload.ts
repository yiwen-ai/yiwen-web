import { isBlobURL } from '@yiwen-ai/util'
import { useCallback } from 'react'
import { concatMap, from, map } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { type PostFilePolicy } from './common'
import { RequestMethod } from './useFetcher'

export interface UploadOutput {
  loaded: number
  total: number
  progress: number
  done: boolean
  value: string
}

export function useUploadAPI() {
  const upload = useCallback((policy: PostFilePolicy, file: File) => {
    const body = new FormData()
    body.append('key', policy.dir + file.name)
    body.append('policy', policy.policy)
    body.append('OSSAccessKeyId', policy.access_key)
    body.append('Signature', policy.signature)
    body.append('Cache-Control', 'public, max-age=604800, immutable')
    body.append('Content-Disposition', 'inline')
    body.append('file', file)

    return ajax({
      url: policy.host,
      body,
      method: RequestMethod.POST,
      includeUploadProgress: true,
    }).pipe(
      map(
        (resp): UploadOutput => ({
          loaded: resp.loaded,
          total: resp.total,
          progress: resp.loaded / resp.total,
          done: resp.type === 'upload_load' || resp.type === 'download_load',
          value: policy.base_url + file.name,
        })
      )
    )
  }, [])

  const uploadFromBlobURL = useCallback(
    (policy: PostFilePolicy, blobURL: string, fileName: string) => {
      return from(fetch(blobURL)).pipe(
        concatMap((resp) => resp.blob()),
        concatMap((blob) =>
          upload(policy, new File([blob], fileName, { type: blob.type }))
        )
      )
    },
    [upload]
  )

  return {
    upload,
    uploadFromBlobURL,
  } as const
}

export function shouldUpload(url: string | null | undefined): url is string {
  return isBlobURL(url)
}
