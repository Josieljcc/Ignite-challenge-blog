import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
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
  posts: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination, posts, next_page }: HomeProps) {
  return (
    <>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <a key={post.uid} href="#">
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div>
                <img src="/images/calendar.svg" alt="Calendar" />
                <p>{post.first_publication_date}</p>
                <img src="/images/user.svg" alt="user" />
                <p>{post.data.author}</p>
              </div>
            </a>
          ))}
        </div>
        <a className={styles.morePosts} href="#">
          Carregar mais posts
        </a>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['post.title', 'post.content'],
      pageSize: 20,
    }
  );
  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: new Date(
        post.first_publication_date
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });
  return {
    props: {
      posts,
    },
  };
};
