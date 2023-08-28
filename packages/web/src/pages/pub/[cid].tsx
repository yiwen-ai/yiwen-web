import { SetHeaderProps } from '#/App'
import PublicationViewer from '#/components/PublicationViewer'
import { useSharePublication } from '#/store/useSharePublication'
import { css } from '@emotion/react'
import { useToast } from '@yiwen-ai/component'
import { useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Xid } from 'xid-ts'

export default function SharePublication() {
  const params = useParams<{ cid: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { renderToastContainer, pushToast } = useToast()

  const {
    publicationViewer: { onTranslate, ...publicationViewer },
  } = useSharePublication(
    pushToast,
    searchParams.get('gid'),
    params.cid,
    searchParams.get('language'),
    searchParams.get('version')
  )

  const handleTranslate = useCallback(
    async (language: string) => {
      const publication = await onTranslate(language)
      if (publication) {
        setSearchParams({
          gid: Xid.fromValue(publication.gid).toString(),
          language: publication.language,
          version: publication.version.toString(),
        })
      }
    },
    [onTranslate, setSearchParams]
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
        {...publicationViewer}
      />
    </>
  )
}
