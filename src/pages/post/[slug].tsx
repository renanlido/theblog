import { GetStaticProps, GetStaticPaths } from 'next';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import { SpinningCircles } from 'react-loading-icons';
import Link from 'next/link';

import { FaCalendar, FaClock, FaUser } from 'react-icons/fa';
import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import { Utterances } from '../../components/Utterances';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
  nextPost: {
    title: string | null;
    url: string | null;
  };
  prevPost: {
    title: string | null;
    url: string | null;
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
}

export default function Post(props: PostProps): JSX.Element {
  const { post: chargedPost, preview } = props;

  // Count number of words and return time of reading

  const numOfWordInBodyText = chargedPost?.data.content.map(content =>
    content.body.map(body => body.text.split(' ').length)
  );

  const sumNumOfWordInBodyText = numOfWordInBodyText.map(t =>
    t.reduce((total, number) => total + number)
  );

  const estimatedReadingTime = sumNumOfWordInBodyText.reduce(
    (total, number) => {
      const wordsReadPerMinute = 200;
      const sum = total + number;
      const timeOfReading = Math.ceil(sum / wordsReadPerMinute);

      return timeOfReading;
    }
  );

  return (
    <>
      <Head>
        <title> Post | spacetraveling.</title>
        <link rel="shortcut icon" href="/favicon.png" type="image/.png" />
      </Head>

      <Header id={styles.headerContainer} />

      {useRouter().isFallback ? (
        <div className={commonStyles.container}>
          <div className={styles.mainContainer}>
            <div className={styles.spinningCircles}>
              <SpinningCircles fill="#ffffff" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.banner}>
            <img src={chargedPost.data.banner.url} alt="Banner" />
          </div>
          <div className={commonStyles.container}>
            <main className={styles.mainContainer}>
              <header>
                <h1>{chargedPost.data.title}</h1>
                <div className={styles.infoContent}>
                  <div>
                    <FaCalendar />
                    <time>
                      {format(
                        new Date(chargedPost.first_publication_date),
                        'dd MMM yyyy',
                        {
                          locale: ptBR,
                        }
                      )}
                    </time>
                  </div>
                  <div>
                    <FaUser />
                    <span>{chargedPost.data.author}</span>
                  </div>
                  <div>
                    <FaClock />
                    <span>{estimatedReadingTime} min</span>
                  </div>
                </div>
                <time className={styles.lastPublicationContent}>
                  {chargedPost.last_publication_date}
                </time>
              </header>

              {chargedPost.data.content.map(content => {
                return (
                  <article key={content.heading} className={styles.content}>
                    <h2>{content.heading}</h2>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: RichText.asHtml(content.body),
                      }}
                    />
                  </article>
                );
              })}

              {preview && (
                <aside>
                  <Link href="/api/exit-preview">
                    <a>Sair</a>
                  </Link>
                </aside>
              )}
              <footer className={styles.mainFooter}>
                <div>
                  {chargedPost.prevPost.title === null ? (
                    <a> </a>
                  ) : (
                    <Link href={`/post/${chargedPost.prevPost.url}`}>
                      <a className={styles.link_button}>
                        <h3>{`${chargedPost.prevPost.title.substring(
                          0,
                          20
                        )}...`}</h3>
                        <p>Post Anterior</p>
                      </a>
                    </Link>
                  )}

                  {chargedPost.nextPost.title === null ? (
                    ''
                  ) : (
                    <Link href={`/post/${chargedPost.nextPost.url}`}>
                      <a className={styles.link_button}>
                        <h3>{`${chargedPost.nextPost.title.substring(
                          0,
                          20
                        )}...`}</h3>
                        <p className={styles.alignRight}>Próximo Post</p>
                      </a>
                    </Link>
                  )}
                </div>
                <Utterances />
              </footer>
            </main>
          </div>
        </>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(path => ({
    params: { slug: path.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  if (!response) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const prevPost = (
    await prismic.query(Prismic.Predicates.at('document.type', 'posts'), {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date desc]',
    })
  ).results[0];

  const nextPost = (
    await prismic.query(Prismic.Predicates.at('document.type', 'posts'), {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date]',
    })
  ).results[0];

  const last_publication_date = format(
    new Date(response.last_publication_date),
    "'* editado em 'dd MMM yyyy', às 'kk:mm",
    {
      locale: ptBR,
    }
  );

  const post = {
    first_publication_date: response.first_publication_date,
    last_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
    prevPost: {
      title: prevPost?.data.title || null,
      url: prevPost?.uid || null,
    },
    nextPost: {
      title: nextPost?.data.title || null,
      url: nextPost?.uid || null,
    },
  };

  return {
    props: { post, preview },
    revalidate: 60 * 30,
  };
};
