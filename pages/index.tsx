
import PostList from '@/components/PostList';
import SectionContainer from '@/components/SectionContainer';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { getDatabase, getPostList, PostData } from '../lib/notion';

export const databaseId: string = process.env.NOTION_DATABASE_ID as string;

const Home: NextPage = ({ posts }: any) => {
  return (
    <SectionContainer>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PostList posts={posts} />
    </SectionContainer>
  );
};

export const getStaticProps = async () => {
  const database = await getDatabase(databaseId);
  const posts: PostData[] = getPostList(database);
  return {
    props: {
      posts: posts,
    },
    revalidate: 1,
  };
};

export default Home;
