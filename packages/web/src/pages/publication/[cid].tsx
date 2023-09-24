import CommonEditor from '#/components/CommonEditor'
import SaveHeader from '#/components/SaveHeader'
import { useEditPublicationPage } from '#/store/useEditPublicationPage'
import { GroupViewType } from '#/store/useGroupDetailPage'
import { css } from '@emotion/react'
import { Button, Spinner, useToast } from '@yiwen-ai/component'
import { useIntl } from 'react-intl'
import { useParams, useSearchParams } from 'react-router-dom'

export default function EditPublicationPage() {
  const intl = useIntl()
  const params = useParams<{ cid: string }>()
  const [searchParams] = useSearchParams()
  const { renderToastContainer, pushToast } = useToast()

  const {
    draft,
    updateDraft,
    isLoading,
    isDisabled,
    isSaving,
    onSave,
    upload,
  } = useEditPublicationPage(
    pushToast,
    searchParams.get('gid'),
    params.cid,
    searchParams.get('language'),
    searchParams.get('version')
  )

  return (
    <>
      {renderToastContainer()}
      <SaveHeader isLoading={isLoading}>
        <Button color='primary' disabled={isDisabled} onClick={onSave}>
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
      </SaveHeader>
      <CommonEditor
        type={GroupViewType.Publication}
        draft={draft}
        updateDraft={updateDraft}
        isLoading={isLoading}
        isSaving={isSaving}
        upload={upload}
      />
    </>
  )
}
