import { css, useTheme } from '@emotion/react'
import { RGBA } from '@yiwen-ai/util'
import { forwardRef, memo, type HTMLAttributes } from 'react'
import { Button } from './Button'
import { Icon, type IconName } from './Icon'

export type AlertType = 'success' | 'warning'

const IconDict: Record<AlertType, IconName> = {
  success: 'tickcircle',
  warning: 'warning',
}

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  type: AlertType
  message: string | JSX.Element
  description?: string | JSX.Element | null | undefined
  onClose?: React.MouseEventHandler<HTMLButtonElement> | undefined
}

export const Alert = memo(
  forwardRef(function Alert(
    { type, message, description, onClose, ...props }: AlertProps,
    ref: React.Ref<HTMLDivElement>
  ) {
    const theme = useTheme()

    return (
      <div
        role='alert'
        {...props}
        ref={ref}
        css={css`
          padding: 24px;
          display: flex;
          gap: 8px;
          border-radius: 10px;
          border: 1px solid ${theme.color.alert[type].border};
          background: ${theme.color.alert[type].background};
          position: relative;
        `}
      >
        <div
          css={css`
            height: ${theme.typography.body.lineHeight};
            display: flex;
            align-items: center;
          `}
        >
          <Icon
            name={IconDict[type]}
            size='medium'
            css={css`
              color: ${theme.color.alert[type].icon};
            `}
          />
        </div>
        <div
          css={css`
            flex: 1;
          `}
        >
          <div
            css={css`
              display: flex;
              justify-content: space-between;
              gap: 8px;
            `}
          >
            {message}
          </div>
          {description && (
            <div
              css={css`
                ${theme.typography.tooltip}
                color: ${theme.color.body.secondary};
                white-space: pre-line;
              `}
            >
              {description}
            </div>
          )}
        </div>
        {onClose && (
          <Button
            shape='circle'
            onClick={onClose}
            css={css`
              position: absolute;
              top: 16px;
              right: 16px;
            `}
          >
            <Icon
              name='delete'
              size='small'
              css={css`
                color: ${RGBA(theme.palette.grayLight, 0.4)};
              `}
            />
          </Button>
        )}
      </div>
    )
  })
)
