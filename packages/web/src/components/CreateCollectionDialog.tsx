import { BREAKPOINT } from '#/shared'
import { css, useTheme } from '@emotion/react'
import { Button, Icon } from '@yiwen-ai/component'
import { type CollectionDraft } from '@yiwen-ai/store'
import { useCallback, useState } from 'react'
import { useIntl } from 'react-intl'
import { Form } from 'react-router-dom'
import ErrorPlaceholder from './ErrorPlaceholder'
import Loading from './Loading'
import MediumDialog from './MediumDialog'

export interface CreateCollectionDialogProps {
  open: boolean
  draft: CollectionDraft
  setDraft: React.Dispatch<React.SetStateAction<CollectionDraft>>
  error: unknown
  editMode: boolean
  isLoading: boolean
  isSaving: boolean
  onClose: () => void
  onSave: () => void
}

export default function CreateCollectionDialog({
  open,
  draft,
  setDraft,
  error,
  editMode,
  isLoading,
  isSaving,
  onClose,
  onSave,
}: CreateCollectionDialogProps) {
  const intl = useIntl()
  const theme = useTheme()
  const [disabled, setDisabled] = useState(true)
  const disablePrice = draft.price === -1

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

      const title = String(
        (ev.currentTarget['title'] as unknown as HTMLFormElement)['value']
      ).trim()
      if (!title) {
        setDisabled(_disabled)
        return false
      }

      if (title !== draft.info.title) {
        _disabled = false
        setDraft({ ...draft, info: { ...draft.info, title } })
      }

      const summary = String(
        (ev.currentTarget['summary'] as unknown as HTMLFormElement)['value']
      ).trim()
      if (summary && summary !== draft.info.summary) {
        _disabled = false
        setDraft({ ...draft, info: { ...draft.info, summary } })
      }

      const context = String(
        (ev.currentTarget['context'] as unknown as HTMLFormElement)['value']
      ).trim()
      if (context && context !== draft.context) {
        _disabled = false
        setDraft({ ...draft, context })
      }

      const price = Number(
        (ev.currentTarget['price'] as unknown as HTMLFormElement)['value']
      )
      if (price !== draft.price) {
        _disabled = false
        setDraft({ ...draft, price })
      }

      const creation_price = Number(
        (ev.currentTarget['creation_price'] as unknown as HTMLFormElement)[
          'value'
        ]
      )
      if (creation_price !== draft.creation_price) {
        _disabled = false
        setDraft({ ...draft, creation_price })
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
        cover: URL.createObjectURL(file),
        __cover_name: filename,
      })
      setDisabled(false)
      return true
    },
    [draft, setDraft, setDisabled]
  )

  const priceTips = useCallback(
    (price: number) => {
      if (price === -1) {
        return intl.formatMessage({ defaultMessage: '永久免费' })
      } else if (price === 0) {
        return intl.formatMessage({ defaultMessage: '当前免费' })
      } else {
        return intl.formatMessage({ defaultMessage: '亿文币' })
      }
    },
    [intl]
  )

  return (
    <MediumDialog
      title={
        editMode
          ? intl.formatMessage({ defaultMessage: '合集设置' })
          : intl.formatMessage({ defaultMessage: '创建合集' })
      }
      open={open}
      onClose={onClose}
      css={css`
        height: fit-content;
      `}
    >
      <div
        css={css`
          color: ${theme.palette.grayLight};
        `}
      >
        <span>
          {intl.formatMessage({
            defaultMessage: '合集可用于组合书籍、小说、论文、相同主题文章等。',
          })}
        </span>
      </div>
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
                htmlFor='collection-dialog-file-input'
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
                  id='collection-dialog-file-input'
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
                  name='title'
                  aria-label='Collection title'
                  placeholder={intl.formatMessage({
                    defaultMessage: '输入合集名称',
                  })}
                  minLength={2}
                  maxLength={256}
                  defaultValue={draft.info.title}
                />
              </label>
              <label
                css={css`
                  cursor: text;
                `}
              >
                <textarea
                  name='summary'
                  rows={3}
                  aria-label='Collection summary'
                  placeholder={intl.formatMessage({
                    defaultMessage: '输入合集简介',
                  })}
                  minLength={3}
                  maxLength={2048}
                  defaultValue={draft.info.summary}
                />
              </label>
            </div>
          </div>
          <div
            css={css`
              ${theme.typography.body}
              margin: 24px 0 12px;
            `}
          >
            <p
              css={css`
                color: ${theme.palette.grayLight};
              `}
            >
              {intl.formatMessage({
                defaultMessage: 'GPT 提示上下文（可选）',
              })}
            </p>
            <label
              css={css`
                cursor: text;
              `}
            >
              <textarea
                name='context'
                rows={2}
                aria-label='Context for GPT translating'
                minLength={0}
                maxLength={1024}
                defaultValue={draft.context}
              />
            </label>
          </div>
          <h2
            css={css`
              ${theme.typography.h2}
              color: ${theme.palette.primaryNormal};
            `}
          >
            {intl.formatMessage({
              defaultMessage: '付费设置',
            })}
          </h2>
          <div
            css={css`
              display: flex;
              flex-direction: column;
              width: 100%;
              gap: 12px;
              p {
                color: ${theme.palette.grayLight};
              }
              input {
                width: 80px !important;
                margin-right: 12px;
              }
            `}
          >
            <p>
              {intl.formatMessage({
                defaultMessage: '合集的亿文币价格，-1 为永久免费，0 为当前免费',
              })}
            </p>
            <label
              css={css`
                cursor: ${disablePrice ? 'not-allowed' : 'text'};
              `}
            >
              <input
                type='number'
                min={-1}
                max={10000}
                name='price'
                disabled={disablePrice}
                aria-label='Collection price'
                defaultValue={draft.price}
              />
              <span>{priceTips(draft.price)}</span>
            </label>
            <p>
              {intl.formatMessage({
                defaultMessage:
                  '合集中单篇内容的的亿文币价格，-1 为永久免费，0 为当前免费',
              })}
            </p>
            <label
              css={css`
                cursor: text;
              `}
            >
              <input
                type='number'
                min={-1}
                max={1000}
                name='creation_price'
                aria-label='Creation price in collection'
                defaultValue={draft.creation_price}
              />
              <span>{priceTips(draft.creation_price)}</span>
            </label>
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
      )}
    </MediumDialog>
  )
}
