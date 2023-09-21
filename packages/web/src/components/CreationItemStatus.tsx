import { css, useTheme } from '@emotion/react'
import { CreationStatus } from '@yiwen-ai/store'
import { useMemo, type HTMLAttributes } from 'react'
import { useIntl } from 'react-intl'

interface CreationItemStatusProps extends HTMLAttributes<HTMLSpanElement> {
  status: CreationStatus
}

export default function CreationItemStatus({
  status,
  ...props
}: CreationItemStatusProps) {
  const intl = useIntl()
  const theme = useTheme()

  const { label, color } = useMemo(() => {
    switch (status) {
      case CreationStatus.Deleted:
        return {
          label: intl.formatMessage({ defaultMessage: '已删除' }),
          color: theme.palette.orange,
        }
      case CreationStatus.Archived:
        return {
          label: intl.formatMessage({ defaultMessage: '已归档' }),
          color: theme.palette.grayLight,
        }
      case CreationStatus.Draft:
        return {
          label: intl.formatMessage({ defaultMessage: '草稿' }),
          color: theme.palette.grayLight,
        }
      case CreationStatus.Review:
        return {
          label: intl.formatMessage({ defaultMessage: '评审中' }),
          color: theme.palette.primaryNormal,
        }
      case CreationStatus.Approved:
        return {
          label: intl.formatMessage({
            defaultMessage: '已投稿，在发布栏翻译',
          }),
          color: theme.palette.green,
        }
    }
  }, [
    intl,
    status,
    theme.palette.grayLight,
    theme.palette.green,
    theme.palette.orange,
    theme.palette.primaryNormal,
  ])

  return (
    <span
      {...props}
      css={css`
        color: ${color};
      `}
    >
      {label}
    </span>
  )
}
