import { css } from '@emotion/react'
import { Button, Select, Spinner } from '@yiwen-ai/component'
import {
  getCollectionTitle,
  useCollectionList,
  type CollectionOutput,
} from '@yiwen-ai/store'
import { useCallback, useMemo, useState } from 'react'
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

  const { isLoading, items } = useCollectionList(gid, undefined)

  const [selected, setSelected] = useState<CollectionOutput | null>(null)

  const handleSelect = useCallback(
    (item: CollectionOutput | null) => {
      setSelected(item)
      onSelect(item ? Xid.fromValue(item.id).toString() : '')
    },
    [setSelected, onSelect]
  )

  const options = useMemo(
    () => [
      {
        key: '',
        label: intl.formatMessage({ defaultMessage: '选择合集' }),
        value: null,
        onSelect: () => handleSelect(null),
      },
      ...items.map((item) => ({
        key: Xid.fromValue(item.id).toString(),
        label: getCollectionTitle(item),
        value: item,
        onSelect: () => handleSelect(item),
      })),
    ],
    [items, intl, handleSelect]
  )

  return (
    <Select
      anchor={(props) => (
        <Button color='secondary' size={'medium'} {...props}>
          {isLoading ? (
            <Spinner size={'medium'} />
          ) : selected ? (
            getCollectionTitle(selected)
          ) : (
            intl.formatMessage({ defaultMessage: '选择合集' })
          )}
        </Button>
      )}
      options={options}
      css={css`
        width: fit-content;
        max-width: 600px;
      `}
    >
      {items.length === 0 && <Placeholder />}
    </Select>
  )
}
