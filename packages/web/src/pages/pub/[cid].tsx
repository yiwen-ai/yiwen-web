import { PUBLICATION_SHARE_PATH, SetHeaderProps } from '#/App'
import ErrorPlaceholder from '#/components/ErrorPlaceholder'
import { PublicationViewer } from '#/components/PublicationViewer'
import { css } from '@emotion/react'
import { RequestError, type PublicationOutput } from '@yiwen-ai/store'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import {
  generatePath,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { Xid } from 'xid-ts'

export default function PublicationShare() {
  const intl = useIntl()
  const params = useParams<{ cid: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const gid = searchParams.get('gid')
  const cid = params.cid
  const language = searchParams.get('language')
  const version = searchParams.get('version')

  const handleSwitch = useCallback(
    (publication: PublicationOutput) => {
      const searchParams2 = new URLSearchParams(searchParams)
      searchParams2.set('gid', Xid.fromValue(publication.gid).toString())
      searchParams2.set('language', publication.language)
      searchParams2.set('version', publication.version.toString())
      navigate({
        pathname: generatePath(PUBLICATION_SHARE_PATH, {
          cid: Xid.fromValue(publication.cid).toString(),
        }),
        search: searchParams2.toString(),
      })
    },
    [navigate, searchParams]
  )

  return (
    <>
      <SetHeaderProps
        css={css`
          display: none;
        `}
      />
      {gid && cid && language && version ? (
        <PublicationViewer
          gid={gid}
          cid={cid}
          language={language}
          version={version}
          onSwitch={handleSwitch}
        />
      ) : (
        <ErrorPlaceholder
          error={
            new RequestError(
              404,
              'Not Found',
              intl.formatMessage({
                defaultMessage:
                  'Missing required parameters: gid, cid, language, version',
              })
            )
          }
        />
      )}
    </>
  )
}
