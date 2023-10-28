import { css } from '@emotion/react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { useMemo } from 'react'
import ErrorPlaceholder from './ErrorPlaceholder'
import { LoadMore } from './LoadMore'
import Loading from './Loading'

// eslint-disable-next-line react-refresh/only-export-components
export const TABLE_ROW_ACTIONS_STYLES = css`
  tr:not(:hover):not(:focus-within) & {
    visibility: hidden;
  }
`

interface TableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean
  error: unknown
  columns: ColumnDef<T>[]
  items: T[]
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
}

export default function Table<T>({
  isLoading,
  error,
  columns,
  items,
  hasMore,
  isLoadingMore,
  onLoadMore,
  ...props
}: TableProps<T>) {
  const table = useReactTable({
    columns,
    data: items,
    getCoreRowModel: useMemo(() => getCoreRowModel(), []),
  })

  return isLoading ? (
    <Loading
      css={css`
        height: 200px;
      `}
    />
  ) : error ? (
    <ErrorPlaceholder error={error} />
  ) : (
    <div
      {...props}
      css={css`
        overflow-x: auto;
      `}
    >
      <table
        css={(theme) => css`
          min-width: 100%;
          border-spacing: 0;

          tfoot {
            display: none;
          }

          th,
          td {
            padding: 12px 16px;
            padding-left: 0;
            border-bottom: 1px solid ${theme.color.divider.default};
          }

          th {
            text-align: left;
            font-weight: unset;
            color: ${theme.color.body.secondary};
          }

          td {
            padding-top: 16px;
            padding-bottom: 16px;
          }
        `}
        style={{
          width: table.getCenterTotalSize(),
        }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} style={{ width: cell.column.getSize() }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
      <LoadMore
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={onLoadMore}
      />
    </div>
  )
}
