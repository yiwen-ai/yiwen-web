import { SetHeaderProps } from '#/App'
import PublicationViewer from '#/components/PublicationViewer'
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
        css={css`
          display: none;
        `}
      />
      <PublicationViewer responsive={true} {...publicationViewer} />
    </>
  )
}
