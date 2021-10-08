import { useState } from 'react';
import { GetStaticProps } from 'next';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';
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

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.posts);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  async function handleNextPage() {
    const newResults = await fetch(nextPage).then(response => response.json());
    setNextPage(newResults.next_page);
    const NewPosts: Post[] = newResults.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });
    setPosts([...posts, ...NewPosts]);
  }
  return (
    <>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <a key={post.uid} href={`/posts/${post.uid}`}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div>
                <img src="/calendar.svg" alt="Calendar" />
                <time>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
                <img src="/user.svg" alt="user" />
                <p>{post.data.author}</p>
              </div>
            </a>
          ))}
        </div>
        {nextPage ? (
          <button
            onClick={handleNextPage}
            className={styles.morePosts}
            type="button"
          >
            Carregar mais posts
          </button>
        ) : (
          ''
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['post.title', 'post.content', 'post.author'],
      pageSize: 2,
    }
  );
  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });
  return {
    props: {
      postsPagination: {
        posts,
        next_page: postsResponse.next_page,
      },
    },
  };
};
