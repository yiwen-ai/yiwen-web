import { BREAKPOINT } from '#/shared'
import { css, useTheme } from '@emotion/react'
import { Button, Icon, TagsField, TextareaAutosize } from '@yiwen-ai/component'
import { type PublicationDraft } from '@yiwen-ai/store'
import { useCallback, useState } from 'react'
import { useIntl } from 'react-intl'
import { Form } from 'react-router-dom'
import ErrorPlaceholder from './ErrorPlaceholder'
import Loading from './Loading'
import MediumDialog from './MediumDialog'

export interface PublicationSettingDialogProps {
  open: boolean
  draft: PublicationDraft
  setDraft: React.Dispatch<React.SetStateAction<PublicationDraft>>
  error: unknown
  isLoading: boolean
  isSaving: boolean
  dir: string
  onClose: () => void
  onSave: () => void
}

export default function PublicationSettingDialog({
  open,
  draft,
  setDraft,
  error,
  isLoading,
  isSaving,
  dir,
  onClose,
  onSave,
}: PublicationSettingDialogProps) {
  const intl = useIntl()
  const theme = useTheme()
  const [disabled, setDisabled] = useState(true)

  const handleSave = useCallback(
    (ev: React.MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault()
      ev.stopPropagation()

      setDisabled(true)
      onSave()
      return true
    },
    [setDisabled, onSave]
  )

  const handleChange = useCallback(
    (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault()
      ev.stopPropagation()

      let _disabled = disabled
      if (!ev.currentTarget.reportValidity()) {
        setDisabled(true)
        return false
      }

      const title = String(
        (ev.currentTarget['title'] as unknown as HTMLFormElement)['value']
      ).trim()
      if (!title) {
        setDisabled(_disabled)
        return false
      }

      if (title !== draft.title) {
        _disabled = false
        setDraft({ ...draft, title })
      }

      const summary = String(
        (ev.currentTarget['summary'] as unknown as HTMLFormElement)['value']
      ).trim()
      if (summary && summary !== draft.summary) {
        _disabled = false
        setDraft({ ...draft, summary })
      }

      setDisabled(_disabled)
      return true
    },
    [draft, setDraft, disabled, setDisabled]
  )

  const handleCoverInputChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const file = ev.currentTarget.files?.[0]
      if (!file || !file.name) return false
      ev.preventDefault()
      ev.stopPropagation()

      const arr = file.name.split('.')
      const filename =
        arr.length > 1 ? `${Date.now()}.${arr.pop()?.toLowerCase()}` : file.name
      setDraft({
        ...draft,
        cover: URL.createObjectURL(file),
        __cover_name: filename,
      })
      setDisabled(false)
      return true
    },
    [draft, setDraft, setDisabled]
  )

  const handleKeywordsChange = useCallback(
    (keywords: string[]) => {
      if (JSON.stringify(keywords) === JSON.stringify(draft.keywords)) return
      setDraft({ ...draft, keywords })
      setDisabled(false)
    },
    [draft, setDraft, setDisabled]
  )

  return (
    <MediumDialog
      title={intl.formatMessage({ defaultMessage: '文章设置' })}
      open={open}
      onClose={onClose}
      css={css`
        height: fit-content;
      `}
    >
      {isLoading ? (
        <Loading
          css={css`
            height: 200px;
          `}
        />
      ) : error ? (
        <ErrorPlaceholder error={error} />
      ) : (
        <Form
          onChange={handleChange}
          css={css`
            h2 {
              ${theme.typography.h2}
              color: ${theme.palette.primaryNormal};
              margin: 24px 0 12px;
            }
            label {
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              padding: 8px 12px;
              border: 1px solid ${theme.color.input.border};
              border-radius: 8px;
              box-sizing: border-box;
              :hover {
                border-color: ${theme.color.input.hover.border};
              }
              :focus-within {
                border-color: ${theme.color.input.focus.border};
              }
              :has(:invalid) {
                border-color: ${theme.color.alert.warning.border};
              }
            }
            input,
            textarea {
              ${theme.typography.body}
              flex: 1;
              width: 100%;
              border: none;
              outline: none;
              background: none;
              color: inherit;
              font-size: inherit;
              font-weight: inherit;
              line-height: inherit;
              resize: none;
              cursor: inherit;
              ::placeholder {
                color: ${theme.color.input.placeholder};
              }
            }
          `}
        >
          <h2>
            {intl.formatMessage({
              defaultMessage: '基本信息',
            })}
          </h2>
          <div
            dir={dir}
            css={css`
              ${theme.typography.h2}
              margin-bottom: 12px;
            `}
          >
            <label
              css={css`
                cursor: text;
              `}
            >
              <input
                type='text'
                name='title'
                aria-label='Publication title'
                minLength={1}
                maxLength={256}
                defaultValue={draft.title}
              />
            </label>
          </div>
          <div
            css={css`
              display: flex;
              flex-direction: row;
              justify-content: flex-start;
            `}
          >
            <div
              css={css`
                position: relative;
                width: 160px;
                height: 210px;
                border-radius: 4px;
                border: 1px solid ${theme.color.divider.secondary};
                background-color: ${theme.color.divider.secondary};
                @media (max-width: ${BREAKPOINT.small}px) {
                  width: 120px;
                  height: 160px;
                }
              `}
            >
              {draft.cover && (
                <img
                  src={draft.cover}
                  alt='Cover'
                  css={css`
                    display: block;
                    width: 160px;
                    height: 210px;
                    border-radius: 4px;
                    object-fit: contain;
                    box-shadow: ${theme.effect.card};
                    @media (max-width: ${BREAKPOINT.small}px) {
                      width: 120px;
                      height: 160px;
                    }
                  `}
                />
              )}
              <label
                htmlFor='publication-dialog-file-input'
                css={css`
                  position: absolute;
                  top: calc(50% - 24px);
                  left: calc(50% - 30px);
                  width: 60px;
                  height: 48px;
                  text-align: center;
                  cursor: pointer;
                  border: none !important;
                `}
              >
                <Icon
                  name='imgupload'
                  size={'large'}
                  css={css`
                    color: ${draft.cover
                      ? theme.palette.white
                      : theme.palette.grayLight};
                  `}
                />
                <input
                  type='file'
                  id='publication-dialog-file-input'
                  accept='.png,.jpg,.jpeg,.gif,.webp'
                  onChange={handleCoverInputChange}
                  css={css`
                    display: none;
                  `}
                />
              </label>
            </div>
            <div
              css={css`
                display: flex;
                flex-direction: column;
                margin-left: 16px;
                width: 100%;
                gap: 12px;
                flex: 1;
              `}
            >
              <label
                htmlFor='publication-dialog-summary'
                css={css`
                  cursor: text;
                `}
              >
                <TextareaAutosize
                  id='publication-dialog-summary'
                  name='summary'
                  minRows={2}
                  maxRows={6}
                  aria-label='Publication summary'
                  placeholder={intl.formatMessage({
                    defaultMessage: '输入文章简介',
                  })}
                  minLength={3}
                  maxLength={2048}
                  defaultValue={draft.summary}
                />
              </label>
              <TagsField
                id='publication-dialog-keywords'
                defaultValue={draft.keywords}
                onUpdate={handleKeywordsChange}
                placeholder={'输入文章关键词，按回车键添加'}
                css={css`
                  height: fit-content;
                `}
              />
            </div>
          </div>
          <div
            css={css`
              margin-top: 24px;
            `}
          >
            <Button
              type='button'
              size='large'
              color={'primary'}
              variant='contained'
              disabled={disabled || isSaving}
              onClick={handleSave}
            >
              {intl.formatMessage({ defaultMessage: '保存' })}
            </Button>
          </div>
        </Form>
      )}
    </MediumDialog>
  )
}
