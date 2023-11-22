import { type ToastAPI } from '@yiwen-ai/component'
import {
  GPT_MODEL,
  RequestError,
  toMessage,
  useEnsureAuthorized,
  useMyGroupList,
  usePublicationAPI,
  useTranslatedPublicationList,
  type ModelCost,
  type UILanguageItem,
} from '@yiwen-ai/store'
import { first } from 'lodash-es'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { Xid } from 'xid-ts'

export function useModelLabelDict() {
  const intl = useIntl()

  return useMemo<Record<GPT_MODEL, string>>(
    () => ({
      [GPT_MODEL.GPT3_5]: intl.formatMessage({
        defaultMessage: 'GPT-3.5（实惠，适用于一般翻译）',
      }),
      [GPT_MODEL.GPT4]: intl.formatMessage({
        defaultMessage: 'GPT-4（质量高，适用于内容复杂、要求专业的翻译）',
      }),
    }),
    [intl]
  )
}

export function useTranslateConfirmDialog(
  _gid: string | null | undefined,
  _cid: string | null | undefined,
  _language: string | null | undefined,
  _version: number | null | undefined
) {
  const ensureAuthorized = useEnsureAuthorized()

  const { isEstimating, estimate } = useTranslatedPublicationList(
    _gid,
    _cid,
    _language,
    _version
  )

  const [open, setOpen] = useState(false)
  const [language, setLanguage] = useState<UILanguageItem | undefined>()
  const isLoading = language && isEstimating(language.code)
  const [error, setError] = useState<unknown>()
  const [tokenCount, setTokenCount] = useState<number | undefined>()
  const [balance, setBalance] = useState<number | undefined>()
  const [modelList, setModelList] = useState<ModelCost[] | undefined>()
  const [currentModel, setCurrentModel] = useState<ModelCost | undefined>()
  const disabled = isLoading || !modelList || !currentModel

  const show = useMemo(() => {
    return ensureAuthorized(async (language: UILanguageItem) => {
      try {
        setOpen(true)
        setLanguage(language)
        const result = await estimate(language.code)
        setTokenCount(result.tokens)
        setBalance(result.balance)
        const modelList = Object.values(result.models)
        setModelList(modelList)
        setCurrentModel(first(modelList))
      } catch (error) {
        setError(error)
      }
    })
  }, [ensureAuthorized, estimate])

  const close = useCallback(() => {
    setOpen(false)
  }, [])

  const refresh = useCallback(() => {
    open && language && show(language)
  }, [language, open, show])

  return {
    open,
    show,
    close,
    language,
    isLoading,
    error,
    tokenCount,
    balance,
    modelList,
    currentModel,
    onModelChange: setCurrentModel,
    disabled,
    refresh,
  } as const
}

export function useTranslateDialog(
  pushToast: ToastAPI['pushToast'],
  _gid: string | null | undefined,
  _cid: string | null | undefined,
  _language: string | null | undefined,
  _version: number | null | undefined
) {
  const intl = useIntl()
  const ensureAuthorized = useEnsureAuthorized()
  const { readPublication } = usePublicationAPI()

  const { translate: _translate } = useTranslatedPublicationList(
    _gid,
    _cid,
    _language,
    _version
  )

  const { defaultGroup, refreshDefaultGroup } = useMyGroupList()

  const [open, setOpen] = useState(false)
  const [language, setLanguage] = useState<UILanguageItem | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<unknown>()
  const controllerRef = useRef<AbortController>()
  useEffect(() => () => controllerRef.current?.abort(), [])

  const close = useCallback(() => {
    setOpen(false)
    controllerRef.current?.abort()
  }, [])

  const show = useCallback(() => {
    setOpen(true)
  }, [])

  const translate = useMemo(() => {
    return ensureAuthorized(
      async (language: UILanguageItem, model: GPT_MODEL) => {
        const _language = language.code
        const controller = new AbortController()
        controllerRef.current?.abort()
        controllerRef.current = controller
        try {
          setOpen(true)
          setIsLoading(true)
          setLanguage(language)
          const gid = defaultGroup?.id ?? (await refreshDefaultGroup())?.id
          try {
            const result = await _translate(
              gid,
              _language,
              model,
              controller.signal
            )
            setOpen(false)
            return result
          } catch (error) {
            if (
              error instanceof RequestError &&
              error.status === 409 &&
              gid &&
              _cid &&
              _version != null
            ) {
              // translation already exists, read it directly
              const { result } = await readPublication(
                {
                  gid: Xid.fromValue(gid).toString(),
                  cid: _cid,
                  language: _language,
                  version: _version,
                  fields: undefined,
                },
                controller.signal
              )
              setOpen(false)
              return result
            } else {
              throw error
            }
          }
        } catch (error) {
          if (!controller.signal.aborted) {
            pushToast({
              type: 'warning',
              message: intl.formatMessage({ defaultMessage: '翻译失败' }),
              description: toMessage(error),
            })
            setError(error)
          }
          return undefined
        } finally {
          if (!controller.signal.aborted) {
            setIsLoading(false)
          }
        }
      }
    )
  }, [
    _cid,
    _translate,
    _version,
    defaultGroup?.id,
    ensureAuthorized,
    intl,
    pushToast,
    readPublication,
    refreshDefaultGroup,
  ])

  return {
    open,
    show,
    close,
    language,
    isLoading,
    error,
    translate,
  } as const
}
