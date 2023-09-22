import { type SelectOptionProps, type ToastAPI } from '@yiwen-ai/component'
import { useCurrencyList, useMyWallet } from '@yiwen-ai/store'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { useChargeDialog } from './useChargeDialog'
import { useChargeTable } from './useChargeTable'
import { useCreditTable } from './useCreditTable'
import { useIncomeTable } from './useIncomeTable'
import { useOutgoTable } from './useOutgoTable'

export enum WalletPageTab {
  Coin = 'coin',
  Membership = 'membership',
  History = 'history',
}

export enum WalletPageHistoryType {
  Charge = 'charge',
  Outgo = 'outgo',
  Income = 'income',
  Credit = 'credit',
}

export function useWalletPage(pushToast: ToastAPI['pushToast']) {
  const intl = useIntl()

  //#region Wallet
  const { refresh: refreshWallet, ...wallet } = useMyWallet()

  useEffect(() => {
    refreshWallet()
  }, [refreshWallet])
  //#endregion

  const [currentTab, setCurrentTab] = useState(WalletPageTab.Coin)

  //#region History
  const [currentHistoryType, setCurrentHistoryType] = useState(
    WalletPageHistoryType.Charge
  )

  const historyTypeOptions = useMemo(() => {
    const options: SelectOptionProps<WalletPageHistoryType>[] = [
      {
        key: WalletPageHistoryType.Charge,
        label: intl.formatMessage({ defaultMessage: '充值记录' }),
        value: WalletPageHistoryType.Charge,
      },
      {
        key: WalletPageHistoryType.Outgo,
        label: intl.formatMessage({ defaultMessage: '转出记录' }),
        value: WalletPageHistoryType.Outgo,
      },
      {
        key: WalletPageHistoryType.Income,
        label: intl.formatMessage({ defaultMessage: '转入记录' }),
        value: WalletPageHistoryType.Income,
      },
      {
        key: WalletPageHistoryType.Credit,
        label: intl.formatMessage({ defaultMessage: '信用分记录' }),
        value: WalletPageHistoryType.Credit,
      },
    ]
    return options.map<SelectOptionProps<WalletPageHistoryType>>((option) => ({
      ...option,
      selected: option.value === currentHistoryType,
    }))
  }, [currentHistoryType, intl])

  const { currencyList, refresh: refreshCurrencyList } = useCurrencyList()
  const { refreshChargeList, ...chargeList } = useChargeTable(currencyList)
  const { refreshOutgoList, ...outgoList } = useOutgoTable(currencyList)
  const { refreshIncomeList, ...incomeList } = useIncomeTable(currencyList)
  const { refreshCreditList, ...creditList } = useCreditTable(currencyList)

  useEffect(() => {
    if (currentTab === WalletPageTab.History) refreshCurrencyList()
  }, [currentTab, refreshCurrencyList])

  useEffect(() => {
    if (currentTab === WalletPageTab.History) {
      switch (currentHistoryType) {
        case WalletPageHistoryType.Charge:
          refreshChargeList()
          break
        case WalletPageHistoryType.Outgo:
          refreshOutgoList()
          break
        case WalletPageHistoryType.Income:
          refreshIncomeList()
          break
        case WalletPageHistoryType.Credit:
          refreshCreditList()
          break
      }
    }
  }, [
    currentHistoryType,
    currentTab,
    refreshChargeList,
    refreshCreditList,
    refreshIncomeList,
    refreshOutgoList,
  ])
  //#endregion

  //#region Charge
  const { onCharge, ...chargeDialog } = useChargeDialog(pushToast)

  const handleCharge = useCallback(async () => {
    const result = await onCharge()
    if (result) {
      refreshWallet()
      if (
        currentTab === WalletPageTab.History &&
        currentHistoryType === WalletPageHistoryType.Charge
      ) {
        refreshChargeList()
      }
    }
  }, [
    currentHistoryType,
    currentTab,
    onCharge,
    refreshChargeList,
    refreshWallet,
  ])
  //#endregion

  return {
    ...wallet,
    chargeDialog: {
      onCharge: handleCharge,
      ...chargeDialog,
    },
    currentTab,
    setCurrentTab,
    historyTypeOptions,
    currentHistoryType,
    setCurrentHistoryType,
    chargeList,
    outgoList,
    incomeList,
    creditList,
  } as const
}
