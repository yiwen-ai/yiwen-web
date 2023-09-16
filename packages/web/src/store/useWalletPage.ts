import { type ToastAPI } from '@yiwen-ai/component'
import {
  useChargeList,
  useCreditList,
  useIncomeList,
  useMyWallet,
  useOutgoList,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useState } from 'react'
import { useChargeDialog } from './useChargeDialog'

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
  //#region Wallet
  const { refresh: refreshWallet, ...wallet } = useMyWallet()

  useEffect(() => {
    refreshWallet()
  }, [refreshWallet])
  //#endregion

  //#region Charge
  const { onCharge, ...chargeDialog } = useChargeDialog(pushToast)

  const handleCharge = useCallback(async () => {
    const result = await onCharge()
    if (result) refreshWallet()
  }, [onCharge, refreshWallet])
  //#endregion

  const [currentTab, setCurrentTab] = useState(WalletPageTab.Coin)

  //#region History
  const [currentHistoryType, setCurrentHistoryType] = useState(
    WalletPageHistoryType.Charge
  )

  const { refresh: refreshChargeList, ...chargeList } = useChargeList()
  const { refresh: refreshOutgoList, ...outgoList } = useOutgoList()
  const { refresh: refreshIncomeList, ...incomeList } = useIncomeList()
  const { refresh: refreshCreditList, ...creditList } = useCreditList()

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

  return {
    ...wallet,
    chargeDialog: {
      onCharge: handleCharge,
      ...chargeDialog,
    },
    currentTab,
    setCurrentTab,
    currentHistoryType,
    setCurrentHistoryType,
    chargeList,
    outgoList,
    incomeList,
    creditList,
  } as const
}
