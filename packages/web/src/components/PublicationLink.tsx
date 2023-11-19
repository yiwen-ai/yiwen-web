import { GROUP_DETAIL_PATH } from '#/App'
import { GroupViewType } from '#/store/useGroupDetailPage'
import { forwardRef, memo, useCallback, useMemo } from 'react'
import { Link, generatePath, type LinkProps, type To } from 'react-router-dom'
import { Xid } from 'xid-ts'

interface PublicationLinkProps extends Omit<LinkProps, 'to'> {
  gid: Uint8Array | string
  cid: Uint8Array | string
  language: string
  version: number
}

// eslint-disable-next-line react-refresh/only-export-components
export default memo(
  forwardRef(function PublicationLink(
    { gid, cid, language, version, onClick, ...props }: PublicationLinkProps,
    ref: React.ForwardedRef<HTMLAnchorElement>
  ) {
    const to = useMemo<To>(
      () => ({
        pathname: generatePath(GROUP_DETAIL_PATH, {
          gid: Xid.fromValue(gid).toString(),
          type: GroupViewType.Publication,
        }),
        search: new URLSearchParams({
          cid: Xid.fromValue(cid).toString(),
          language,
          version: version.toString(),
        }).toString(),
      }),
      [cid, gid, language, version]
    )

    const handleClick = useCallback(
      (ev: React.MouseEvent<HTMLAnchorElement>) => {
        if (onClick) {
          ev.preventDefault()
          onClick(ev)
        }
      },
      [onClick]
    )

    return <Link to={to} onClick={handleClick} {...props} ref={ref} />
  })
)
