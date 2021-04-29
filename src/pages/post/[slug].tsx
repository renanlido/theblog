import { GetStaticProps, GetStaticPaths } from 'next';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
// import { SpinningCircles } from 'react-loading-icons';

import { FaCalendar, FaClock, FaUser } from 'react-icons/fa';
import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
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
}

interface PostProps {
  post: Post;
}

export default function Post(post: PostProps): JSX.Element {
  const { post: chargedPost } = post;

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
      </Head>

      <Header id={styles.headerContainer} />

      {useRouter().isFallback ? (
        <>Carregando...</>
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

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  if (!response) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const post = {
    first_publication_date: response.first_publication_date,
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
  };

  return {
    props: { post },
    revalidate: 1,
  };
};
