import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FaCalendar, FaUser } from 'react-icons/fa';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(postsPagination: HomeProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>

      <main className={commonStyles.container}>
        <div className={styles.homeContent}>
          <Link href="/#">
            <a>
              <h1>Como Utilizar Hooks</h1>
              <p>Pensando em sincronização em vez de ciclos de vida</p>
              <div className={styles.infoContent}>
                <div>
                  <FaCalendar />
                  <time>15 Mar 2021</time>
                </div>
                <div>
                  <FaUser />
                  <span>Renan Oliveira</span>
                </div>
              </div>
            </a>
          </Link>
          <Link href="/#">
            <a>
              <h1>Como Utilizar Hooks</h1>
              <p>Pensando em sincronização em vez de ciclos de vida</p>
              <div className={styles.infoContent}>
                <div>
                  <FaCalendar />
                  <time>15 Mar 2021</time>
                </div>
                <div>
                  <FaUser />
                  <span>Renan Oliveira</span>
                </div>
              </div>
            </a>
          </Link>
          <Link href="/#">
            <a>
              <h1>Como Utilizar Hooks</h1>
              <p>Pensando em sincronização em vez de ciclos de vida</p>
              <div className={styles.infoContent}>
                <div>
                  <FaCalendar />
                  <time>15 Mar 2021</time>
                </div>
                <div>
                  <FaUser />
                  <span>Renan Oliveira</span>
                </div>
              </div>
            </a>
          </Link>
          <Link href="/#">
            <a>
              <h1>Como Utilizar Hooks</h1>
              <p>Pensando em sincronização em vez de ciclos de vida</p>
              <div className={styles.infoContent}>
                <div>
                  <FaCalendar />
                  <time>15 Mar 2021</time>
                </div>
                <div>
                  <FaUser />
                  <span>Renan Oliveira</span>
                </div>
              </div>
            </a>
          </Link>

          <button type="button">Carregar mais posts</button>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // const prismic = getPrismicClient();
  // const postsResponse = await prismic.query(TODO);

  return {
    props: {
      postsPagination: '1',
    },
  };
};
