declare namespace React {
  function forwardRef<T, P = object, E = ReactNode>(
    render: (props: P, ref: ForwardedRef<T>) => E
  ): (props: PropsWithoutRef<P> & RefAttributes<T>) => E

  function memo<P = object, E = ReactNode>(
    Component: (props: PropsWithoutRef<P>) => E
  ): (props: PropsWithoutRef<P>) => E

  function memo<T, P = object, E = ReactNode>(
    Component: (props: PropsWithoutRef<P> & RefAttributes<T>) => E
  ): (props: PropsWithRef<P>) => E
}
