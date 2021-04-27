import Link from 'next/link';

import styles from './header.module.scss';
import common from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={common.container}>
      <nav className={styles.headerContent}>
        <Link href="/">
          <a>
            <img src="/images/logo.svg" alt="spacetraveling." />
          </a>
        </Link>
      </nav>
    </header>
  );
}
