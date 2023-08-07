import { css, useTheme } from '@emotion/react'
import { useUserAPI, type IdentityProvider } from '@yiwen-ai/store'
import { memo, useCallback } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Icon, type IconName } from '.'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogClose,
  AlertDialogHead,
} from './AlertDialog'
import { Avatar } from './Avatar'
import { Brand } from './Brand'
import { Button } from './Button'
import { Spinner } from './Spinner'

export const AccountManager = memo(function AccountManager() {
  const intl = useIntl()
  const theme = useTheme()
  const {
    isLoading,
    user,
    authorize,
    isAuthorizing = false,
    provider: currentProvider,
  } = useUserAPI() ?? {}

  return isLoading ? (
    <Spinner />
  ) : user ? (
    // TODO: click to manage account
    <Avatar src={user.picture} name={user.name} />
  ) : (
    <AlertDialog
      anchor={(props) => (
        <Button {...props}>
          {intl.formatMessage({
            defaultMessage: '登录',
          })}
        </Button>
      )}
    >
      <AlertDialogHead>
        <FormattedMessage
          defaultMessage='登录到 {brand}'
          values={{ brand: <Brand /> }}
        />
      </AlertDialogHead>
      <AlertDialogBody
        css={css`
          display: flex;
          flex-direction: column;
          gap: 16px;
        `}
      >
        <ProviderItem
          provider={'github'}
          providerLogo={'github'}
          providerName={intl.formatMessage({ defaultMessage: 'GitHub' })}
          isAuthorizing={isAuthorizing}
          currentProvider={currentProvider}
          onAuthorize={authorize}
        />
        <ProviderItem
          provider={'google'}
          providerLogo={'google'}
          providerName={intl.formatMessage({ defaultMessage: 'Google' })}
          isAuthorizing={isAuthorizing}
          currentProvider={currentProvider}
          onAuthorize={authorize}
        />
        <ProviderItem
          provider={'wechat'}
          providerLogo={'wechat'}
          providerName={intl.formatMessage({ defaultMessage: '微信' })}
          isAuthorizing={isAuthorizing}
          currentProvider={currentProvider}
          onAuthorize={authorize}
        />
        <div
          css={css`
            ${theme.typography.tooltip}
            text-align: center;
          `}
        >
          <FormattedMessage
            defaultMessage='阅读并接受 {terms} 和 {privacy}'
            values={{
              terms: (
                <a
                  href='https://www.yiwen-ai.com/terms'
                  target='_blank'
                  rel='noopener noreferrer'
                  css={css`
                    color: ${theme.color.link.normal};
                    :hover {
                      color: ${theme.color.link.hover};
                    }
                  `}
                >
                  {intl.formatMessage({ defaultMessage: '用户协议' })}
                </a>
              ),
              privacy: (
                <a
                  href='https://www.yiwen-ai.com/privacy'
                  target='_blank'
                  rel='noopener noreferrer'
                  css={css`
                    color: ${theme.color.link.normal};
                    :hover {
                      color: ${theme.color.link.hover};
                    }
                  `}
                >
                  {intl.formatMessage({ defaultMessage: '隐私政策' })}
                </a>
              ),
            }}
          />
        </div>
      </AlertDialogBody>
      <AlertDialogClose />
    </AlertDialog>
  )
})

function ProviderItem({
  provider,
  providerLogo,
  providerName,
  isAuthorizing,
  currentProvider,
  onAuthorize,
}: {
  provider: IdentityProvider
  providerLogo: IconName
  providerName: string
  isAuthorizing: boolean
  currentProvider: IdentityProvider | undefined
  onAuthorize: ((provider: IdentityProvider) => void) | undefined
}) {
  const intl = useIntl()
  const theme = useTheme()
  const onClick = useCallback(
    () => onAuthorize?.(provider),
    [onAuthorize, provider]
  )

  return (
    <button
      onClick={onClick}
      disabled={isAuthorizing}
      css={css`
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        border: 1px solid ${theme.palette.grayLight0};
        background: ${theme.color.body.background};
        color: ${theme.color.body.primary};
        cursor: pointer;
      `}
    >
      <div
        css={css`
          margin-right: 8px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        `}
      >
        {currentProvider === provider ? (
          <Spinner size={16} />
        ) : (
          <Icon name={providerLogo} size={16} />
        )}
      </div>
      {intl.formatMessage(
        { defaultMessage: '使用 {provider} 登录' },
        { provider: providerName }
      )}
    </button>
  )
}
