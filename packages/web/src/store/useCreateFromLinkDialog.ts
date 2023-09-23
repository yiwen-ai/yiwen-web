import { type ToastAPI } from '@yiwen-ai/component'
import { toMessage, useCrawlDocument, useMyGroupList } from '@yiwen-ai/store'
import { isURL } from '@yiwen-ai/util'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { Xid } from 'xid-ts'

export function useCreateFromLinkDialog(
  pushToast: ToastAPI['pushToast'],
  _gid: Uint8Array | string | null | undefined
) {
  const intl = useIntl()

  const [gid, setGid] = useState(() =>
    _gid ? Xid.fromValue(_gid).toString() : undefined
  )

  const { refreshDefaultGroup } = useMyGroupList()

  useEffect(() => {
    const controller = new AbortController()
    Promise.resolve(_gid || refreshDefaultGroup().then((group) => group?.id))
      .then((gid) => {
        if (!controller.signal.aborted && gid) {
          setGid(Xid.fromValue(gid).toString())
        }
      })
      .catch(() => {})
    return () => controller.abort()
  }, [_gid, refreshDefaultGroup])

  const [open, setOpen] = useState(false)
  const show = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])

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
