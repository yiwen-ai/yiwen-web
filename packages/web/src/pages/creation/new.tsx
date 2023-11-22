import CollectionSelector from '#/components/CollectionSelector'
import CommonEditor from '#/components/CommonEditor'
import CreateFromFileDialog from '#/components/CreateFromFileDialog'
import CreateFromLinkDialog from '#/components/CreateFromLinkDialog'
import { renderIconMoreAnchor } from '#/components/IconMoreAnchor'
import SaveHeader from '#/components/SaveHeader'
import { MAX_WIDTH, useIsNarrow } from '#/shared'
import { GroupViewType } from '#/store/useGroupDetailPage'
import { useNewCreationPage } from '#/store/useNewCreationPage'
import { css, useTheme } from '@emotion/react'
import {
  Button,
  Icon,
  Menu,
  MenuItem,
  Spinner,
  TextField,
  useToast,
} from '@yiwen-ai/component'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useSearchParams } from 'react-router-dom'
import { Xid } from 'xid-ts'

export default function NewCreationPage() {
  const intl = useIntl()
  const theme = useTheme()
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
  } = useNewCreationPage(
    pushToast,
    searchParams.get('gid'),
    searchParams.get('scrapingOutput')
  )

  const gid = searchParams.get('gid') || ''
  const updateParent = useCallback(
    (parent: string) => {
      updateDraft({ parent: parent ? Xid.fromValue(parent) : undefined })
    },
    [updateDraft]
  )

  const updateUrl = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      updateDraft({ original_url: ev.currentTarget.value.trim() || '' })
    },
    [updateDraft]
  )

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
      <div
        css={css`
          width: 100%;
          box-shadow: ${theme.effect.card};
        `}
      >
        <div
          css={css`
            max-width: ${MAX_WIDTH};
            margin: auto;
            padding: 36px 0;
            display: flex;
            flex-direction: column;
            gap: 24px;
          `}
        >
          <div
            css={css`
              ${theme.typography.bodyBold}
            `}
          >
            {intl.formatMessage({ defaultMessage: '文稿设置' })}
          </div>
          {gid && (
            <Field label={intl.formatMessage({ defaultMessage: '归属合集：' })}>
              <CollectionSelector gid={gid} onSelect={updateParent} />
            </Field>
          )}
          <Field label={intl.formatMessage({ defaultMessage: '文稿来源：' })}>
            <TextField
              size='large'
              placeholder={intl.formatMessage({
                defaultMessage: '原文链接',
              })}
              value={draft.original_url || ''}
              onChange={updateUrl}
              css={css`
                width: 480px;
              `}
            />
          </Field>
        </div>
      </div>

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

function Field({
  label,
  ...props
}: React.PropsWithChildren<{
  label: string
}>) {
  return (
    <div
      css={css`
        display: flex;
        align-items: flex-start;
      `}
    >
      <span
        css={css`
          min-width: 80px;
          text-align: right;
        `}
      >
        {label}
      </span>
      <div
        css={css`
          display: flex;
          flex-wrap: wrap;
          align-items: center;
        `}
      >
        {props.children}
      </div>
    </div>
  )
}
