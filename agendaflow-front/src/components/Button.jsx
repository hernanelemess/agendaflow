import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  type = 'button',
  onClick,
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
      ].join(' ')}
      {...props}
    >
      {loading ? <span className={styles.spinner} /> : children}
    </button>
  );
}