import { SetHeaderProps } from '#/App'
import PublicationViewer from '#/components/PublicationViewer'
import { BREAKPOINT } from '#/shared'
import { useSharePublicationPage } from '#/store/useSharePublicationPage'
import { css } from '@emotion/react'
import { useToast } from '@yiwen-ai/component'
import { useParams, useSearchParams } from 'react-router-dom'

export default function SharePublicationPage() {
  const params = useParams<{ cid: string }>()
  const [searchParams] = useSearchParams()
  const { renderToastContainer, pushToast } = useToast()

  const { publicationViewer } = useSharePublicationPage(
    pushToast,
    searchParams.get('gid'),
    params.cid,
    searchParams.get('language'),
    searchParams.get('version'),
    searchParams.get('by')
  )

  return (
    <>
      {renderToastContainer()}
      <SetHeaderProps
        brand={true}
        css={(theme) => css`
          @media (max-width: ${BREAKPOINT.small}px) {
            height: 60px;
            padding: 0 16px;
            border-bottom: 1px solid ${theme.color.divider.default};
          }
        `}
      />
      <PublicationViewer
        responsive={true}
        {...publicationViewer}
        css={css`
          width: 100%;
          max-width: 1280px;
          margin: auto;
        `}
      />
    </>
  )
}
