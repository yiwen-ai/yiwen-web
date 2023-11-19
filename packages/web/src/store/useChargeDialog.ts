import { type ToastAPI } from '@yiwen-ai/component'
import {
  toMessage,
  useCurrencyList,
  useMyWallet,
  useNewCharge,
  type Currency,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'

export function useChargeDialog(pushToast: ToastAPI['pushToast']) {
  const intl = useIntl()

  //#region Dialog
  const [open, setOpen] = useState(false)
  const show = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])
  //#endregion

  const { refresh } = useMyWallet()

  //#region Currency
  const {
    isLoading: isLoadingCurrencyList,
    error: currencyListError,
    currencyList,
  } = useCurrencyList()

  const [currentCurrencyCode, setCurrentCurrencyCode] = useState(
    undefined as string | undefined
  )

  const currentCurrency = useMemo(() => {
    return currencyList?.find(
      (currency) => currency.alpha === currentCurrencyCode
    )
  }, [currencyList, currentCurrencyCode])

  const onCurrencyChange = useCallback(
    (currency: Currency) => setCurrentCurrencyCode(currency.alpha),
    []
  )

  useEffect(() => {
    setCurrentCurrencyCode((prev) => prev || currencyList?.[0]?.alpha)
  }, [currencyList])
  //#endregion

  //#region Amount
  const chargeAmountList = useMemo(() => [50, 500, 5000] as const, [])
  const [chargeAmount, setChargeAmount] = useState<number>(chargeAmountList[0])
  //#endregion

  //#region Charge
  const { isCharging, charge } = useNewCharge()

  const disabled =
    isLoadingCurrencyList || !currentCurrency || !chargeAmount || isCharging

  const controllerRef = useRef<AbortController | undefined>(undefined)
  useEffect(() => () => controllerRef.current?.abort(), [])

  const onCharge = useCallback(async () => {
    const controller = new AbortController()
    controllerRef.current?.abort()
    controllerRef.current = controller
    try {
      if (!currentCurrency || !chargeAmount) {
        throw new Error('currency and amount must be selected before charging')
      }
      const { result, aborted } = await charge(
        {
          quantity: chargeAmount,
          currency: currentCurrency.alpha,
        },
        controller.signal
      )
      if (aborted) {
        pushToast({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '充值取消' }),
        })
      } else if (result) {
        pushToast({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '充值完成' }),
        })
        refresh()
        close()
      }
      return result
    } catch (error) {
      if (!controller.signal.aborted) {
        pushToast({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '充值失败' }),
          description: toMessage(error),
        })
      }
      return undefined
    }
  }, [refresh, charge, chargeAmount, close, currentCurrency, intl, pushToast])
  //#endregion

  return {
    open,
    show,
    close,
    isLoading: isLoadingCurrencyList,
    error: currencyListError,
    currencyList,
    currentCurrency,
    onCurrencyChange,
    chargeAmountList,
    chargeAmount,
    onChargeAmountChange: setChargeAmount,
    isCharging,
    disabled,
    onCharge,
  } as const
}
