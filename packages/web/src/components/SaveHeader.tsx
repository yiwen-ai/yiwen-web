import { SetHeaderProps } from '#/App'
import { BREAKPOINT } from '#/shared'
import { css } from '@emotion/react'
import { Button, Spinner, useToast } from '@yiwen-ai/component'
import { toMessage } from '@yiwen-ai/store'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'

export default function SaveHeader({
  isLoading,
  isDisabled,
  isSaving,
  onSave,
  ...props
}: React.PropsWithChildren<{
  isLoading: boolean
  isDisabled: boolean
  isSaving: boolean
  onSave: () => void
}>) {
  const intl = useIntl()
  const { renderToastContainer, pushToast } = useToast()

  const handleSave = useCallback(async () => {
    try {
      await onSave()
      pushToast({
        type: 'success',
        message: intl.formatMessage({ defaultMessage: '保存成功' }),
      })
    } catch (error) {
      pushToast({
        type: 'warning',
        message: intl.formatMessage({ defaultMessage: '保存失败' }),
        description: toMessage(error),
      })
    }
  }, [intl, onSave, pushToast])

  return isLoading ? null : (
    <>
      {renderToastContainer()}
      <SetHeaderProps>
        <div
          css={css`
            flex: 1;
            margin: 0 36px;
            display: flex;
            justify-content: flex-end;
            gap: 36px;
            @media (max-width: ${BREAKPOINT.small}px) {
              margin: 0 16px;
              gap: 16px;
            }
          `}
        >
          {props.children}
          <Button color='primary' disabled={isDisabled} onClick={handleSave}>
            {isSaving && (
              <Spinner
                size='small'
                css={css`
                  color: inherit;
                `}
              />
            )}
            {intl.formatMessage({ defaultMessage: '保存' })}
          </Button>
        </div>
      </SetHeaderProps>
    </>
  )
}
