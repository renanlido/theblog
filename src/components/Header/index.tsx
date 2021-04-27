import Link from 'next/link';

import { HTMLProps } from 'react';
import styles from './header.module.scss';
import common from '../../styles/common.module.scss';

export default function Header(props: HTMLProps<HTMLElement>): JSX.Element {
  return (
    <header {...props} className={common.container}>
      <nav className={styles.headerContent}>
        <Link href="/">
          <a>
            <img src="/images/logo.svg" alt="logo" />
          </a>
        </Link>
      </nav>
    </header>
  );
}
