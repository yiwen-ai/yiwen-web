import { SHARE_PUBLICATION_PATH, SetHeaderProps } from '#/App'
import PublicationViewer from '#/components/PublicationViewer'
import { useSharePublication } from '#/store/useSharePublication'
import { css } from '@emotion/react'
import { useToast } from '@yiwen-ai/component'
import { useCallback } from 'react'
import {
  generatePath,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { Xid } from 'xid-ts'

export default function SharePublication() {
  const params = useParams<{ cid: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { renderToastContainer, pushToast } = useToast()

  const {
    translate,
    copyShareLink: onCopyShareLink,
    ...publicationViewer
  } = useSharePublication(
    pushToast,
    searchParams.get('gid'),
    params.cid,
    searchParams.get('language'),
    searchParams.get('version')
  )

  const handleTranslate = useCallback(
    async (language: string) => {
      try {
        const publication = await translate(language)
        navigate({
          pathname: generatePath(SHARE_PUBLICATION_PATH, {
            cid: Xid.fromValue(publication.cid).toString(),
          }),
          search: new URLSearchParams({
            gid: Xid.fromValue(publication.gid).toString(),
            language: publication.language,
            version: publication.version.toString(),
          }).toString(),
        })
      } catch (error) {
        // ignore
      }
    },
    [navigate, translate]
  )

  return (
    <>
      {renderToastContainer()}
      <SetHeaderProps
        css={css`
          display: none;
        `}
      />
      <PublicationViewer
        responsive={true}
        onTranslate={handleTranslate}
        onCopyShareLink={onCopyShareLink}
        {...publicationViewer}
      />
    </>
  )
}
