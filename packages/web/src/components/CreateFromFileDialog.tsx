import { css } from '@emotion/react'
import { Button, Icon, Spinner, textEllipsis } from '@yiwen-ai/component'
import { preventDefault, useDragHover } from '@yiwen-ai/util'
import { useCallback, useId, useRef } from 'react'
import { useIntl } from 'react-intl'
import SmallDialog from './SmallDialog'

interface CreateFromFileDialogProps {
  open: boolean
  onClose: () => void
  file: File | undefined
  onFileChange: (file: File) => void
  isUploading: boolean
  disabled: boolean
  onUpload: () => void
}

export default function CreateFromFileDialog({
  open,
  onClose,
  file,
  onFileChange,
  disabled,
  isUploading,
  onUpload,
}: CreateFromFileDialogProps) {
  const intl = useIntl()
  const id = useId()

  const handleChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const file = ev.currentTarget.files?.[0]
      if (file) onFileChange(file)
    },
    [onFileChange]
  )

  const handleDrop = useCallback(
    (ev: React.DragEvent<HTMLButtonElement>) => {
      preventDefault(ev)
      const file = ev.dataTransfer.files[0]
      if (file) onFileChange(file)
    },
    [onFileChange]
  )

  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isDragging = useDragHover(buttonRef.current)

  const handleSelect = useCallback(() => {
    inputRef.current?.click()
  }, [])

  return (
    <SmallDialog
      open={open}
      onClose={onClose}
      title={intl.formatMessage({ defaultMessage: '从文件创作' })}
    >
      {isUploading && file ? (
        <>
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: 16px;
            `}
          >
            <span>
              {intl.formatMessage({
                defaultMessage: '正在处理，请稍后',
              })}
            </span>
            <Spinner />
          </div>
          <div
            css={(theme) => css`
              margin-top: 12px;
              color: ${theme.color.body.secondary};
            `}
          >
            {file.name}
          </div>
        </>
      ) : (
        <>
          <label
            htmlFor={id}
            css={css`
              margin-top: 12px;
              display: block;
            `}
          >
            <input
              id={id}
              type='file'
              accept='.pdf,.md,.html,.txt'
              onChange={handleChange}
              ref={inputRef}
              css={css`
                display: none;
              `}
            />
            <button
              data-dragging={isDragging ? '' : undefined}
              onClick={handleSelect}
              onDragOver={preventDefault}
              onDrop={handleDrop}
              ref={buttonRef}
              css={(theme) => css`
                width: 100%;
                height: 80px;
                padding: 0 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                border-radius: 8px;
                border: 1px dashed ${theme.color.divider.default};
                background: ${theme.color.body.background};
                transition: background 0.2s ease-in-out;
                cursor: pointer;
                :hover,
                &[data-dragging] {
                  border-color: ${theme.color.body.primaryHover};
                  background: ${theme.color.dialog.background};
                }
              `}
            >
              {file ? (
                <span
                  css={(theme) => css`
                    color: ${disabled
                      ? theme.color.alert.warning.border
                      : 'inherit'};
                    ${textEllipsis}
                  `}
                >
                  {file.name +
                    (disabled
                      ? ' (' + (file.size / 1024).toFixed(2) + 'KB > 512KB)'
                      : '')}
                </span>
              ) : (
                <>
                  <Icon
                    name='upload'
                    size='small'
                    css={(theme) => css`
                      color: ${theme.color.body.secondary};
                    `}
                  />
                  <span
                    css={(theme) => css`
                      color: ${theme.color.body.primary};
                      ${theme.typography.body}
                    `}
                  >
                    {intl.formatMessage({ defaultMessage: '上传文件' })}
                  </span>
                </>
              )}
            </button>
          </label>
          <div
            css={(theme) => css`
              margin-top: 8px;
              color: ${theme.color.body.secondary};
              ${theme.typography.tooltip}
            `}
          >
            {intl.formatMessage({
              defaultMessage:
                '支持 PDF、Markdown、HTML、Text 格式，512 KB 以内',
            })}
          </div>
          <Button
            color='primary'
            disabled={disabled}
            onClick={onUpload}
            css={css`
              margin-top: 24px;
            `}
          >
            {intl.formatMessage({ defaultMessage: '确定' })}
          </Button>
        </>
      )}
    </SmallDialog>
  )
}
