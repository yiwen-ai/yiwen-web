import { css } from '@emotion/react'
import { Button, Select, SelectOption, Spinner } from '@yiwen-ai/component'
import {
  getCollectionTitle,
  useCollectionList,
  type CollectionOutput,
} from '@yiwen-ai/store'
import { useCallback, useState } from 'react'
import { useIntl } from 'react-intl'
import { Xid } from 'xid-ts'
import Placeholder from './Placeholder'

export interface CollectionSelectorProps {
  gid: string
  onSelect: (cid: string) => void
}

export default function CollectionSelector({
  gid,
  onSelect,
}: CollectionSelectorProps) {
  const intl = useIntl()
  // const theme = useTheme()

  const {
    isLoading,
    items,
    // hasMore,
    // loadMore,
  } = useCollectionList(gid, undefined)

  const [title, setTitle] = useState('')

  const handleSelect = useCallback(
    (item: CollectionOutput, ev: React.SyntheticEvent) => {
      ev.preventDefault()
      ev.stopPropagation()

      setTitle(getCollectionTitle(item))
      onSelect(Xid.fromValue(item.id).toString())
      return true
    },
    [setTitle, onSelect]
  )

  return (
    <Select
      anchor={(props) => (
        <Button color='secondary' size={'medium'} {...props}>
          {isLoading ? (
            <Spinner size={'medium'} />
          ) : title ? (
            title
          ) : (
            intl.formatMessage({ defaultMessage: '选择合集' })
          )}
        </Button>
      )}
      css={css`
        width: fit-content;
        max-width: 600px;
      `}
    >
      {items.map((item) => (
        <SelectOption
          key={Xid.fromValue(item.id).toString()}
          label={getCollectionTitle(item)}
          value={item}
          onSelect={handleSelect}
        />
      ))}
      {items.length === 0 && <Placeholder />}
    </Select>
  )
}
