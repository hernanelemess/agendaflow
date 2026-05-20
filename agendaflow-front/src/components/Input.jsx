import { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(function Input(
  { label, error, icon: Icon, hint, ...props },
  ref
) {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrap}>
        {Icon && <Icon size={16} className={styles.icon} />}
        <input
          ref={ref}
          className={[styles.input, Icon ? styles.withIcon : '', error ? styles.hasError : ''].join(' ')}
          {...props}
        />
      </div>
      {error && <span className={styles.error}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  );
});

export default Input;