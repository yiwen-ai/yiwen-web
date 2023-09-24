import { type ToastAPI } from '@yiwen-ai/component'
import {
  toMessage,
  useCrawlDocument,
  useEnsureAuthorized,
  useMyGroupList,
} from '@yiwen-ai/store'
import { isURL } from '@yiwen-ai/util'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { Xid } from 'xid-ts'

export function useCreateFromLinkDialog(
  pushToast: ToastAPI['pushToast'],
  _gid?: Uint8Array | string | null | undefined
) {
  const intl = useIntl()
  const ensureAuthorized = useEnsureAuthorized()

  const [open, setOpen] = useState(false)
  const show = useMemo(
    () => ensureAuthorized(() => setOpen(true)),
    [ensureAuthorized]
  )
  const close = useCallback(() => setOpen(false), [])

  const [gid, setGid] = useState(() =>
    _gid ? Xid.fromValue(_gid).toString() : undefined
  )

  const { defaultGroup, refreshDefaultGroup } = useMyGroupList()
  const defaultGroupId = defaultGroup?.id

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    Promise.resolve(
      _gid || defaultGroupId || refreshDefaultGroup().then((group) => group?.id)
    )
      .then((gid) => {
        if (!controller.signal.aborted && gid) {
          setGid(Xid.fromValue(gid).toString())
        }
      })
      .catch(() => {})
    return () => controller.abort()
  }, [_gid, defaultGroupId, open, refreshDefaultGroup])

  const [link, setLink] = useState('')
  const disabled = useMemo(() => !isURL(link), [link])

  const { isCrawling, crawl } = useCrawlDocument(gid)
  const onCrawl = useCallback(async () => {
    try {
      return await crawl(link)
    } catch (error) {
      pushToast({
        type: 'warning',
        message: intl.formatMessage({ defaultMessage: '抓取失败' }),
        description: toMessage(error),
      })
      return undefined
    }
  }, [intl, link, pushToast, crawl])

  return {
    open,
    show,
    close,
    link,
    onLinkChange: setLink,
    disabled,
    isCrawling,
    onCrawl,
  } as const
}
