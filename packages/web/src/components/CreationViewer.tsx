import { BREAKPOINT } from '#/shared'
import { GroupViewType } from '#/store/useGroupDetailPage'
import { css, useTheme } from '@emotion/react'
import { Button, Icon, IconButton } from '@yiwen-ai/component'
import { type CreationOutput, type Language } from '@yiwen-ai/store'
import { useCallback, type HTMLAttributes } from 'react'
import { useIntl } from 'react-intl'
import { useResizeDetector } from 'react-resize-detector'
import CommonViewer from './CommonViewer'
import ErrorPlaceholder from './ErrorPlaceholder'
import Loading from './Loading'

export interface CreationViewerProps extends HTMLAttributes<HTMLDivElement> {
  responsive: boolean
  isLoading: boolean
  error: unknown
  creation: CreationOutput | undefined
  currentLanguage: Language | undefined
  onEdit?: (item: CreationOutput) => void
  onClose: () => void
}

export default function CreationViewer({
  responsive,
  isLoading,
  error,
  creation,
  currentLanguage,
  onEdit,
  onClose,
  ...props
}: CreationViewerProps) {
  const intl = useIntl()
  const theme = useTheme()
  const { width = 0, ref } = useResizeDetector<HTMLDivElement>()
  const isNarrow = responsive && width <= BREAKPOINT.small
  const hasReleases = (creation?.version as number) >= 2

  const handleEdit = useCallback(
    () => creation && onEdit && onEdit(creation),
    [creation, onEdit]
  )

  return (
    <div
      {...props}
      ref={ref}
      css={css`
        flex: 1;
        display: flex;
        flex-direction: column;
      `}
    >
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorPlaceholder error={error} />
      ) : creation ? (
        <>
          <div
            css={css`
              padding: 36px;
              display: flex;
              align-items: flex-start;
              gap: 24px;
              @media (max-width: ${BREAKPOINT.small}px) {
                padding: 16px;
                gap: 16px;
                box-shadow: ${theme.effect.card};
              }
            `}
          >
            <div
              css={css`
                flex: 1;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: inherit;
                > button:last-of-type {
                  margin-right: auto;
                }
              `}
            >
              <Button
                title={intl.formatMessage({ defaultMessage: '创作语言' })}
                color='primary'
                variant='outlined'
                size={isNarrow ? 'small' : 'large'}
                disabled={true}
              >
                {currentLanguage?.nativeName ?? creation.language}
              </Button>
              <Button
                size='large'
                color='secondary'
                variant='outlined'
                onClick={handleEdit}
              >
                {hasReleases ? (
                  <Icon name='refresh' size='medium' />
                ) : (
                  <Icon name='edit' size='medium' />
                )}
                <span>
                  {hasReleases
                    ? intl.formatMessage({ defaultMessage: '更新版本' })
                    : intl.formatMessage({ defaultMessage: '编辑' })}
                </span>
              </Button>
            </div>
            <div
              css={css`
                height: ${isNarrow ? undefined : '40px'};
                display: flex;
                align-items: center;
              `}
            >
              <IconButton
                aria-label={intl.formatMessage({ defaultMessage: '关闭' })}
                iconName='closecircle2'
                size={isNarrow ? 'small' : 'medium'}
                variant='contained'
                onClick={onClose}
              />
            </div>
          </div>
          <CommonViewer
            type={GroupViewType.Creation}
            item={creation}
            isNarrow={isNarrow}
          />
        </>
      ) : null}
    </div>
  )
}
