import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FaCalendar, FaUser } from 'react-icons/fa';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { SpinningCircles } from 'react-loading-icons';
import { useState } from 'react';

import Header from '../components/Header';

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
  const { postsPagination: chargedPosts } = postsPagination;
  const { next_page, results } = chargedPosts;

  const [posts, setPosts] = useState(results);
  const [nextPage, setNextPage] = useState(next_page);

  async function handleChargeMorePosts(
    next_page_link: RequestInfo
  ): Promise<void> {
    const nextPost: Post[] = await fetch(next_page_link)
      .then(response => response.json())
      .then(resp => {
        setNextPage(resp.next_page);

        return resp.results;
      });

    nextPost.map(post =>
      setPosts([
        ...posts,
        {
          uid: post.uid,
          first_publication_date: post.first_publication_date,
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          },
        },
      ])
    );
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>

      <Header id={styles.headerContainer} />

      <main className={commonStyles.container}>
        <div className={styles.homeContent}>
          {results ? (
            posts.map(post => (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <a>
                  <h1>{post.data.title}</h1>
                  <p>{post.data.subtitle}</p>
                  <div className={styles.infoContent}>
                    <div>
                      <FaCalendar />
                      <time>
                        {format(
                          new Date(post.first_publication_date),
                          'dd MMM yyyy',
                          {
                            locale: ptBR,
                          }
                        )}
                      </time>
                    </div>
                    <div>
                      <FaUser />
                      <span>{post.data.author}</span>
                    </div>
                  </div>
                </a>
              </Link>
            ))
          ) : (
            <div className={styles.spinningCicles}>
              <SpinningCircles fill="#F8F8F8" />
            </div>
          )}
          {nextPage === null ? (
            ''
          ) : (
            <button
              type="button"
              onClick={() => handleChargeMorePosts(nextPage)}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      orderings: '[my.posts.date desc]',
    }
  );

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    }),
  };

  return {
    props: { postsPagination },
    revalidate: 60 * 30, // 30 minutes
  };
};
