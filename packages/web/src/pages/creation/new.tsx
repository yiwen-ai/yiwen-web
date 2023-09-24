import CommonEditor from '#/components/CommonEditor'
import CreateFromFileDialog from '#/components/CreateFromFileDialog'
import CreateFromLinkDialog from '#/components/CreateFromLinkDialog'
import { renderIconMoreAnchor } from '#/components/IconMoreAnchor'
import SaveHeader from '#/components/SaveHeader'
import { useIsNarrow } from '#/shared'
import { GroupViewType } from '#/store/useGroupDetailPage'
import { useNewCreationPage } from '#/store/useNewCreationPage'
import { css } from '@emotion/react'
import {
  Button,
  Icon,
  Menu,
  MenuItem,
  Spinner,
  useToast,
} from '@yiwen-ai/component'
import { useIntl } from 'react-intl'
import { useSearchParams } from 'react-router-dom'

export default function NewCreationPage() {
  const intl = useIntl()
  const [searchParams] = useSearchParams()
  const { renderToastContainer, pushToast } = useToast()
  const isNarrow = useIsNarrow()

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
    createFromFileDialog: {
      show: showCreateFromFileDialog,
      close: closeCreateFromFileDialog,
      ...createFromFileDialog
    },
  } = useNewCreationPage(pushToast, searchParams.get('gid'))

  return (
    <>
      {renderToastContainer()}
      <SaveHeader isLoading={isLoading}>
        {isNarrow ? (
          <Menu anchor={renderIconMoreAnchor}>
            <MenuItem
              before={
                createFromFileDialog.isUploading ? (
                  <Spinner size='small' />
                ) : (
                  <Icon size='small' />
                )
              }
              label={intl.formatMessage({ defaultMessage: '从文件创作' })}
              disabled={isSaving || createFromLinkDialog.isCrawling}
              onClick={showCreateFromFileDialog}
            />
            <MenuItem
              before={
                createFromLinkDialog.isCrawling ? (
                  <Spinner size='small' />
                ) : (
                  <Icon size='small' />
                )
              }
              label={intl.formatMessage({ defaultMessage: '从链接创作' })}
              disabled={isSaving || createFromFileDialog.isUploading}
              onClick={showCreateFromLinkDialog}
            />
          </Menu>
        ) : (
          <>
            <Button
              color='primary'
              variant='text'
              disabled={isSaving || createFromLinkDialog.isCrawling}
              onClick={showCreateFromFileDialog}
            >
              {createFromFileDialog.isUploading && <Spinner size='small' />}
              {intl.formatMessage({ defaultMessage: '从文件创作' })}
            </Button>
            <Button
              color='primary'
              variant='text'
              disabled={isSaving || createFromFileDialog.isUploading}
              onClick={showCreateFromLinkDialog}
            >
              {createFromLinkDialog.isCrawling && <Spinner size='small' />}
              {intl.formatMessage({ defaultMessage: '从链接创作' })}
            </Button>
          </>
        )}
        <Button
          color='primary'
          disabled={
            isDisabled ||
            isSaving ||
            createFromLinkDialog.isCrawling ||
            createFromFileDialog.isUploading
          }
          onClick={onSave}
        >
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
        type={GroupViewType.Creation}
        draft={draft}
        updateDraft={updateDraft}
        isLoading={isLoading}
        isSaving={isSaving}
      />
      {createFromLinkDialog.open && (
        <CreateFromLinkDialog
          onClose={closeCreateFromLinkDialog}
          {...createFromLinkDialog}
        />
      )}
      {createFromFileDialog.open && (
        <CreateFromFileDialog
          onClose={closeCreateFromFileDialog}
          {...createFromFileDialog}
        />
      )}
    </>
  )
}
