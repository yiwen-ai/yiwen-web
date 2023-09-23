import CommonEditor from '#/components/CommonEditor'
import CreateFromLinkDialog from '#/components/CreateFromLinkDialog'
import SaveHeader from '#/components/SaveHeader'
import { GroupViewType } from '#/store/useGroupDetailPage'
import { useNewCreationPage } from '#/store/useNewCreationPage'
import { Button, useToast } from '@yiwen-ai/component'
import { useIntl } from 'react-intl'
import { useSearchParams } from 'react-router-dom'

export default function NewCreationPage() {
  const intl = useIntl()
  const [searchParams] = useSearchParams()
  const { renderToastContainer, pushToast } = useToast()

  const {
    draft,
    updateDraft,
    isLoading,
    isDisabled,
    isSaving,
    onSave,
    createFromLinkDialog: {
      show: showCreateFromLinkDialog,
      close: closeCreateFromLinkDialog,
      ...createFromLinkDialog
    },
  } = useNewCreationPage(pushToast, searchParams.get('gid'))

  return (
    <>
      {renderToastContainer()}
      <SaveHeader
        isLoading={isLoading}
        isDisabled={isDisabled || createFromLinkDialog.isSaving}
        isSaving={isSaving}
        onSave={onSave}
      >
        <Button
          color='primary'
          variant='text'
          disabled={isSaving}
          onClick={showCreateFromLinkDialog}
        >
          {intl.formatMessage({ defaultMessage: '从链接创作' })}
        </Button>
      </SaveHeader>
      <CommonEditor
        type={GroupViewType.Creation}
        draft={draft}
        updateDraft={updateDraft}
        isLoading={isLoading}
        isSaving={isSaving}
      />
      {isLoading ? null : (
        <CreateFromLinkDialog
          onClose={closeCreateFromLinkDialog}
          {...createFromLinkDialog}
        />
      )}
    </>
  )
}
