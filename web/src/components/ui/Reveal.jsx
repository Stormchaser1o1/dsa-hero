import useReveal from '../../hooks/useReveal';

/** Wraps children in a scroll-triggered fade+rise. `delay` staggers siblings. */
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '', ...rest }) {
  const [ref, shown] = useReveal();

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? 'is-shown' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
