import { useCreation, useLanguageList } from '@yiwen-ai/store'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Xid } from 'xid-ts'

interface Params {
  open: boolean
  _gid: string | null | undefined
  _cid: string | null | undefined
}

export function useCreationViewer() {
  const [{ open, _gid, _cid }, setParams] = useState<Params>({
    open: false,
    _gid: undefined,
    _cid: undefined,
  })

  const { creation, error, isLoading, refresh } = useCreation(_gid, _cid)
  const { languageList } = useLanguageList()
  const currentLanguage = useMemo(
    () => languageList?.find(({ code }) => code === creation?.language),
    [creation?.language, languageList]
  )

  const show = useCallback(
    (
      _gid: Uint8Array | string | null | undefined,
      _cid: Uint8Array | string | null | undefined
    ) => {
      setParams({
        open: true,
        _gid: _gid != null ? Xid.fromValue(_gid).toString() : undefined,
        _cid: _cid != null ? Xid.fromValue(_cid).toString() : undefined,
      })
    },
    []
  )

  const close = useCallback(() => {
    setParams({
      open: false,
      _gid: undefined,
      _cid: undefined,
    })
  }, [])

  useEffect(() => {
    open && refresh()
  }, [open, refresh])

  return {
    isLoading,
    error,
    creation,
    currentLanguage,
    open,
    show,
    close,
    refresh,
  } as const
}
