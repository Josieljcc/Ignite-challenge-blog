import { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';

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
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const [results, setResults] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  async function handleLoadPosts() {
    const newResults = await fetch(nextPage).then(response => response.json());
    setNextPage(newResults.nextPage);

    const newPosts: Post[] = newResults.results.map(result => {
      return {
        uid: result.uid,
        first_publication_date: result.first_publication_date,
        data: {
          author: result.data.author,
          title: result.data.title,
          subtitle: result.data.subtitle,
        },
      };
    });
    setResults([...results, ...newPosts]);
  }
  return (
    <>
      <main className={styles.container}>
        <div className={styles.posts}>
          {results.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
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
            </Link>
          ))}
        </div>
        {nextPage ? (
          <button
            onClick={handleLoadPosts}
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

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: [
        'publication.title',
        'publication.subtitle',
        'publication.author',
      ],
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
        next_page: postsResponse.next_page,
        results: posts,
      },
      preview,
      revalidate: 60 * 60 * 24,
    },
  };
};
