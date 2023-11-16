import { BREAKPOINT } from '#/shared'
import { css, useTheme } from '@emotion/react'
import { Button, Icon } from '@yiwen-ai/component'
import { type GroupDraft } from '@yiwen-ai/store'
import { useCallback, useState } from 'react'
import { useIntl } from 'react-intl'
import { Form } from 'react-router-dom'
import MediumDialog from './MediumDialog'

export interface EditGroupDialogProps {
  open: boolean
  draft: GroupDraft
  setDraft: React.Dispatch<React.SetStateAction<GroupDraft>>
  isSaving: boolean
  onClose: () => void
  onSave: () => void
}

export default function EditGroupDialog({
  open,
  draft,
  setDraft,
  isSaving,
  onClose,
  onSave,
}: EditGroupDialogProps) {
  const intl = useIntl()
  const theme = useTheme()
  const [disabled, setDisabled] = useState(true)

  const handleSave = useCallback(
    (ev: React.FormEvent<HTMLFormElement>) => {
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

      let _disabled = true
      if (!ev.currentTarget.reportValidity()) {
        setDisabled(_disabled)
        return false
      }

      const name = String(
        (ev.currentTarget['name'] as unknown as HTMLFormElement)['value']
      ).trim()
      if (!name) {
        setDisabled(_disabled)
        return false
      }

      if (name !== draft.name) {
        _disabled = false
        setDraft({ ...draft, name })
      }

      const slogan = String(
        (ev.currentTarget['slogan'] as unknown as HTMLFormElement)['value']
      ).trim()
      if (slogan !== draft.slogan) {
        _disabled = false
        setDraft({ ...draft, slogan })
      }

      setDisabled(_disabled)
      return true
    },
    [draft, setDraft, setDisabled]
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
        logo: URL.createObjectURL(file),
        __logo_name: filename,
      })
      setDisabled(false)
      return true
    },
    [draft, setDraft, setDisabled]
  )

  return (
    <MediumDialog
      title={intl.formatMessage({ defaultMessage: '群组设置' })}
      open={open}
      onClose={onClose}
      css={css`
        height: fit-content;
      `}
    >
      <Form
        onChange={handleChange}
        onSubmit={handleSave}
        css={css`
          h2 {
            ${theme.typography.h2}
            color: ${theme.palette.primaryNormal};
            margin: 24px 0 12px;
          }
          label {
            display: block;
            align-items: center;
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
              height: 160px;
              border-radius: 50%;
              @media (max-width: ${BREAKPOINT.small}px) {
                width: 120px;
                height: 120px;
              }
            `}
          >
            {draft.logo && (
              <img
                src={draft.logo}
                alt='Logo'
                css={css`
                  display: block;
                  width: 160px;
                  height: 160px;
                  border-radius: 50%;
                  object-fit: contain;
                  @media (max-width: ${BREAKPOINT.small}px) {
                    width: 120px;
                    height: 120px;
                  }
                `}
              />
            )}
            <label
              htmlFor='group-dialog-file-input'
              css={css`
                position: absolute;
                top: calc(50% - 30px);
                left: calc(50% - 30px);
                width: 60px;
                height: 60px;
                text-align: center;
                cursor: pointer;
                border: none !important;
              `}
            >
              <Icon
                name='imgupload'
                size={'large'}
                css={css`
                  color: ${draft.logo
                    ? theme.palette.white
                    : theme.palette.grayLight};
                `}
              />
              <input
                type='file'
                id='group-dialog-file-input'
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
              css={css`
                cursor: text;
              `}
            >
              <input
                type='text'
                name='name'
                aria-label='Group name'
                placeholder={intl.formatMessage({
                  defaultMessage: '输入群组名',
                })}
                minLength={2}
                maxLength={16}
                defaultValue={draft.name}
              />
            </label>
            <label
              css={css`
                cursor: text;
              `}
            >
              <textarea
                name='slogan'
                rows={2}
                aria-label='Group slogan'
                placeholder={intl.formatMessage({
                  defaultMessage: '输入群组口号',
                })}
                minLength={0}
                maxLength={256}
                defaultValue={draft.slogan}
              />
            </label>
          </div>
        </div>
        <div
          css={css`
            margin-top: 24px;
          `}
        >
          <Button
            type='submit'
            size='large'
            color={'primary'}
            variant='contained'
            disabled={disabled || isSaving}
          >
            {intl.formatMessage({ defaultMessage: '保存' })}
          </Button>
        </div>
      </Form>
    </MediumDialog>
  )
}
