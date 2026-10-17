import styles from './LinkArrow.module.css';

interface LinkArrowProps {
  className?: string;
  size?: number;
}

export default function LinkArrow({ className, size = 16 }: LinkArrowProps) {
  return (
    <span className={`${styles.chevron} ${className ?? ''}`} aria-hidden="true">
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path className={`${styles.arm} ${styles.armTop}`} d="M6 4L10 8" />
        <path className={`${styles.arm} ${styles.armBot}`} d="M10 8L6 12" />
      </svg>
    </span>
  );
}
