import ChargeDialog from '#/components/ChargeDialog'
import ErrorPlaceholder from '#/components/ErrorPlaceholder'
import Loading from '#/components/Loading'
import MembershipLevel from '#/components/MembershipLevel'
import Table from '#/components/Table'
import YiwenCoin from '#/components/YiwenCoin'
import { BREAKPOINT } from '#/shared'
import {
  WalletPageHistoryType,
  WalletPageTab,
  useWalletPage,
} from '#/store/useWalletPage'
import { css } from '@emotion/react'
import {
  Button,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabSection,
  useToast,
} from '@yiwen-ai/component'
import { RGBA } from '@yiwen-ai/util'
import { useIntl } from 'react-intl'

export default function WalletPage() {
  const intl = useIntl()
  const { renderToastContainer, pushToast } = useToast()

  const {
    isLoading,
    error,
    wallet,
    chargeDialog: {
      open: chargeDialogOpen,
      show: showChargeDialog,
      close: closeChargeDialog,
      isCharging,
      ...chargeDialog
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
  } = useWalletPage(pushToast)

  return isLoading ? (
    <Loading />
  ) : error ? (
    <ErrorPlaceholder error={error} />
  ) : wallet ? (
    <>
      {renderToastContainer()}
      <div
        css={css`
          padding: 48px 100px 48px 56px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 48px;
          @media (max-width: ${BREAKPOINT.small}px) {
            padding: 48px;
          }
        `}
      >
        <div
          css={css`
            flex: 1;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
          `}
        >
          <MembershipLevel level={wallet.level} />
          <div
            css={css`
              flex: 1;
              max-width: 500px;
            `}
          >
            <div
              css={css`
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 8px 48px;
              `}
            >
              <div
                css={(theme) => css`
                  color: ${theme.color.body.link};
                  ${theme.typography.bodyBold}
                  white-space: nowrap;
                `}
              >
                {intl.formatMessage(
                  { defaultMessage: '会员等级：LV{level}' },
                  { level: wallet.level }
                )}
              </div>
              <div
                css={(theme) => css`
                  color: ${theme.color.body.link};
                  white-space: nowrap;
                `}
              >
                {wallet.credits + ' / ' + wallet.nextCredits}
              </div>
            </div>
            <div
              aria-hidden={true}
              css={(theme) => css`
                margin-top: 8px;
                height: 12px;
                background: ${RGBA(theme.palette.primaryLight, 0.2)};
                border-radius: 4px;
                position: relative;
                ::after {
                  content: '';
                  position: absolute;
                  inset: 0;
                  right: auto;
                  width: ${(wallet.credits / wallet.nextCredits) * 100}%;
                  background: ${theme.palette.primaryLight};
                  border-radius: inherit;
                }
              `}
            />
            <div
              css={(theme) => css`
                margin-top: 4px;
                color: ${theme.color.body.secondary};
              `}
            >
              {intl.formatMessage(
                { defaultMessage: '距离下一个等级还需 {point} 分' },
                { point: wallet.nextCredits - wallet.credits }
              )}
            </div>
          </div>
        </div>
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: inherit;
          `}
        >
          <div>
            <strong
              css={(theme) => css`
                display: block;
                text-align: center;
                ${theme.typography.h0}
              `}
            >
              {wallet.total}
            </strong>
            <span
              css={(theme) => css`
                display: block;
                text-align: center;
                color: ${theme.color.body.link};
              `}
            >
              {intl.formatMessage({ defaultMessage: '我的亿文币' })}
            </span>
          </div>
          <Button color='primary' onClick={showChargeDialog}>
            {isCharging && <Spinner size='small' />}
            {intl.formatMessage({ 'defaultMessage': '充值' })}
          </Button>
        </div>
      </div>
      <TabSection
        value={currentTab}
        onChange={setCurrentTab}
        css={css`
          margin-top: 12px;
        `}
      >
        <TabList
          css={css`
            padding-left: 100px;
            padding-right: 100px;
            @media (max-width: ${BREAKPOINT.small}px) {
              padding-left: 48px;
              padding-right: 48px;
            }
          `}
        >
          <Tab value={WalletPageTab.Coin}>
            {intl.formatMessage({ defaultMessage: '亿文币' })}
          </Tab>
          <Tab value={WalletPageTab.History}>
            {intl.formatMessage({ defaultMessage: '更新记录' })}
          </Tab>
        </TabList>
        <TabPanel
          value={WalletPageTab.Coin}
          css={css`
            padding: 36px 100px 100px;
            @media (max-width: ${BREAKPOINT.small}px) {
              padding: 36px 48px 48px;
            }
          `}
        >
          <YiwenCoin />
        </TabPanel>
        <TabPanel
          value={WalletPageTab.History}
          css={css`
            padding: 24px 100px 100px;
            @media (max-width: ${BREAKPOINT.small}px) {
              padding: 24px 48px 48px;
            }
          `}
        >
          <div
            css={css`
              display: flex;
              flex-wrap: wrap;
              gap: 24px;
            `}
          >
            {historyTypeOptions.map((option) => (
              <Button
                key={option.key}
                data-selected={option.selected ? '' : undefined}
                color='secondary'
                variant='contained'
                onClick={() => setCurrentHistoryType(option.value)}
                css={(theme) =>
                  css`
                    padding: 0 16px;
                    &[data-selected] {
                      &,
                      :hover {
                        color: ${theme.color.button.primary.text.text};
                        background: ${theme.color.button.secondary.contained
                          .hover.background};
                      }
                    }
                  `
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
          <div
            css={css`
              margin-top: 24px;
            `}
          >
            {(() => {
              switch (currentHistoryType) {
                case WalletPageHistoryType.Charge:
                  return <Table {...chargeList} />
                case WalletPageHistoryType.Outgo:
                  return <Table {...outgoList} />
                case WalletPageHistoryType.Income:
                  return <Table {...incomeList} />
                case WalletPageHistoryType.Credit:
                  return <Table {...creditList} />
              }
            })()}
          </div>
        </TabPanel>
      </TabSection>
      <ChargeDialog
        open={chargeDialogOpen}
        onClose={closeChargeDialog}
        isCharging={isCharging}
        {...chargeDialog}
      />
    </>
  ) : null
}
