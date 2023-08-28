import { SetHeaderProps } from '#/App'
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
}: {
  isLoading: boolean
  isDisabled: boolean
  isSaving: boolean
  onSave: () => void
}) {
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
            margin: 0 40px;
            display: flex;
            justify-content: flex-end;
          `}
        >
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
