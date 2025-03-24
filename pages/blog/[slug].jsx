import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { Layout } from 'components/layout';
import { Navigation } from 'components/navigation';
import { Box, Heading, Text } from '@chakra-ui/react';
import Head from 'next/head';
import Script from 'next/script';

export function calculateReadingTime(text, wordsPerMinute = 200) {
  const wordCount = text.trim().split(/\s+/).length; // Count words
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `Χρόνος ανάγνωσης: ${minutes} ${minutes === 1 ? 'λεπτό' : 'λεπτά'}`;
}

export const getStaticPaths = async () => {
  const contentDir = path.join(process.cwd(), 'content');
  const filenames = fs.readdirSync(contentDir);

  const paths = filenames.map((filename) => ({
    params: { slug: filename.replace('.md', '') },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;
  const filePath = path.join(process.cwd(), 'content', `${slug}.md`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  const { data, content } = matter(fileContent)
  const readTime = calculateReadingTime(fileContent)

  return {
    props: {
      title: data.title,
      date: data.date,
      description: data.description,
      content: marked(content),
      readTime,
      slug
    },
  };
};



export default function PostPage({ title, description, date, content, readTime, slug }) {
  return (
    <Layout>
      <Navigation />

      <Head>
        <title>{`${title} - Taxemu`}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <link rel="icon" href="/favicon.ico?v=3" />
      </Head>

      {/* JSON-LD Structured Data */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": title,
            "description": description,
            // "image": imageUrl || '/default.jpg',
            "author": {
              "@type": "Person",
              "name": 'Taxemu',
            },
            "datePublished": date,
            "dateModified": date,
            "url": `https://taxemu.gr/blog/${slug}`,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://taxemu.gr/blog/${slug}`,
            },
            "publisher": {
              "@type": "Organization",
              "name": "Taxemu",
            },
          }),
        }}
      />

      <Box
        px={{ base: "1rem", md: "5rem" }}
        maxWidth="1366px"
        mx="auto"
        width="100%"
      >
        <Box mt={[4, 10]} position='relative' zIndex={1}>
          <Text color='gray.500' fontSize='.8rem' fontStyle='italic' background='#8884d820' display='inline-block' py={.5} px={1} borderRadius={2}>Ημερομηνία:  {date}</Text>
          <Heading as='h1' size='lg'>{title}</Heading>
          <Text color='gray.500'>{description}</Text>
          <Text color='gray.500' fontSize='.8rem' mt={2}>{readTime}</Text>
        </Box>

        <Box mt={[4, 10]} width='100%' position='relative' zIndex={1}>
          <Box py={6}>
            <article>
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </article>
          </Box>
        </Box>
      </Box>
    </Layout>

  );
}
