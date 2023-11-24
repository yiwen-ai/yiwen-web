import { css, useTheme } from '@emotion/react'
import { Button, textEllipsis } from '@yiwen-ai/component'
import { usePublicationList, type PublicationStatus } from '@yiwen-ai/store'
import { useScrollOnBottom } from '@yiwen-ai/util'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { Form } from 'react-router-dom'
import { Xid } from 'xid-ts'
import Loading from './Loading'
import MediumDialog from './MediumDialog'

export interface PublicationSelectorProps {
  open: boolean
  gid: string | undefined
  excludes: string[]
  selected: string[]
  setSelected: React.Dispatch<React.SetStateAction<string[]>>
  isSaving: boolean
  onClose: () => void
  onSave: () => void
}

interface PublicationItem {
  index: number // select index, 0 for not selected
  gid: string
  cid: string
  status: PublicationStatus
  updated_at: number
  title: string
}

export default function PublicationSelector({
  open,
  gid,
  excludes,
  selected,
  setSelected,
  isSaving,
  onClose,
  onSave,
}: PublicationSelectorProps) {
  const intl = useIntl()
  const theme = useTheme()

  const [disabled, setDisabled] = useState(true)

  const {
    isLoading,
    isValidating,
    items: publications,
    hasMore,
    loadMore,
  } = usePublicationList(open ? gid : undefined, undefined)

  const items: PublicationItem[] = useMemo(() => {
    if (!publications) {
      return []
    }
    const processed = new Set<string>()
    const result: PublicationItem[] = []
    for (const item of publications) {
      const cid = Xid.fromValue(item.cid).toString()
      if (processed.has(cid)) {
        continue
      }
      processed.add(cid)
      if (excludes.includes(cid)) {
        continue
      }
      result.push({
        index: selected.indexOf(cid) + 1,
        gid: Xid.fromValue(item.cid).toString(),
        cid,
        status: item.status,
        updated_at: item.updated_at,
        title: item.title,
      })
    }

    setDisabled(selected.length === 0)

    return result
  }, [publications, excludes, selected])

  const handleChange = useCallback(
    (ev: React.FormEvent<HTMLInputElement>) => {
      ev.stopPropagation()
      const i = selected.indexOf(ev.currentTarget.value)
      if (ev.currentTarget.checked) {
        if (i < 0) {
          setSelected([...selected, ev.currentTarget.value])
        }
      } else if (i >= 0) {
        setSelected([
          ...selected.slice(0, i),
          ...selected.slice(i + 1, selected.length),
        ])
      }
    },
    [selected, setSelected]
  )

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const shouldLoadMore = open && hasMore && !isValidating && loadMore
  const handleScroll = useCallback(() => {
    shouldLoadMore && shouldLoadMore()
  }, [shouldLoadMore])
  useScrollOnBottom(scrollContainerRef, handleScroll)

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

  return (
    <MediumDialog
      title={intl.formatMessage({ defaultMessage: '选择文章' })}
      open={open}
      onClose={onClose}
      css={css`
        height: fit-content;
        max-height: 80vh;
      `}
    >
      {isLoading ? (
        <Loading
          css={css`
            height: 200px;
          `}
        />
      ) : (
        <Form
          onSubmit={handleSave}
          css={css`
            label {
              display: flex;
              flex: 1;
              align-items: center;
              width: 100%;
              padding: 8px 12px;
              gap: 8px;
              box-sizing: border-box;
              cursor: pointer;
              :hover {
                box-shadow: ${theme.effect.card};
              }
              b {
                display: inline-block;
                border-radius: 4px;
                border: 1px solid ${theme.color.input.border};
                width: 24px;
                height: 24px;
                line-height: 24px;
                text-align: center;
                color: ${theme.color.body.primary};
              }
              p {
                ${textEllipsis}
                width: calc(100% - 32px);
              }
              input {
                display: none;
              }
            }
          `}
        >
          <div
            ref={scrollContainerRef}
            css={css`
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              gap: 8px;
              border-radius: 8px;
              border: 1px solid ${theme.color.input.border};
              max-height: 600px;
              overflow-y: auto;
              padding: 12px 0;
            `}
          >
            {items.map((item) => (
              <label htmlFor={item.cid} key={item.cid}>
                <b
                  css={
                    item.index > 0 &&
                    css`
                      border-color: ${theme.color.body.primary} !important;
                    `
                  }
                >
                  {item.index || ''}
                </b>
                <p>{item.title}</p>
                <input
                  type='checkbox'
                  id={item.cid}
                  value={item.cid}
                  onChange={handleChange}
                />
              </label>
            ))}
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
