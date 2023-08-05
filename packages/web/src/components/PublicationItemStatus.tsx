import { css, useTheme } from '@emotion/react'
import { PublicationStatus } from '@yiwen-ai/store'
import { useMemo, type HTMLAttributes } from 'react'
import { useIntl } from 'react-intl'

interface PublicationItemStatusProps extends HTMLAttributes<HTMLSpanElement> {
  status: PublicationStatus
}

export default function PublicationItemStatus({
  status,
  ...props
}: PublicationItemStatusProps) {
  const intl = useIntl()
  const theme = useTheme()

  const { label, color } = useMemo(() => {
    switch (status) {
      case PublicationStatus.Deleted:
        return {
          label: intl.formatMessage({ defaultMessage: '已删除' }),
          color: theme.palette.orange,
        }
      case PublicationStatus.Archived:
        return {
          label: intl.formatMessage({ defaultMessage: '已归档' }),
          color: theme.palette.grayLight,
        }
      case PublicationStatus.Review:
        return {
          label: intl.formatMessage({ defaultMessage: '已发布待审核' }),
          color: theme.palette.primaryNormal,
        }
      case PublicationStatus.Approved:
        return {
          label: intl.formatMessage({ defaultMessage: '系统审核通过' }),
          color: theme.palette.green,
        }
      case PublicationStatus.Published:
        return {
          label: intl.formatMessage({ defaultMessage: '已发布' }),
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
        ${theme.typography.tooltip}
        color: ${color};
      `}
    >
      {label}
    </span>
  )
}
