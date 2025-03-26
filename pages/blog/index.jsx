import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import { Layout } from "components/layout";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { Navigation } from "components/navigation";
import Head from "next/head";

export async function getStaticProps() {
  const contentDir = path.join(process.cwd(), "content");
  const filenames = fs.readdirSync(contentDir);

  const posts = filenames.map((filename) => {
    const filePath = path.join(contentDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContent);

    return {
      title: data.title,
      date: data.date,
      description: data.description,
      slug: data.slug,
    };
  });

  const sortedPosts = posts.sort((a, b) => {
    const dateA = new Date(a.date.split("-").reverse().join("-"));
    const dateB = new Date(b.date.split("-").reverse().join("-"));
    return dateB - dateA;
  });

  return {
    props: { posts: sortedPosts },
  };
}

export default function BlogPage({ posts }) {
  return (
    <Layout>
      <Navigation />

      <Head>
        <title>{`Χρήσιμες πηγές - Taxemu`}</title>
        <meta name="title" content="Χρήσιμες πηγές - Taxemu" />
        <meta name="description" content="Μια συλλογή απο χρήσιμες πηγές" />
        <meta property="og:title" content="Χρήσιμες πηγές - Taxemu" />
        <meta
          property="og:description"
          content="Μια συλλογή απο χρήσιμες πηγές"
        />
        <link rel="icon" href="/favicon.ico?v=3" />
      </Head>

      <Box
        px={{ base: "1rem", md: "5rem" }}
        maxWidth="1366px"
        mx="auto"
        width="100%"
      >
        <Box mt={[4, 10]}>
          <Heading as="h1" size="lg">
            Blog
          </Heading>
          <Text color="gray.500">Μια συλλογή απο χρήσιμες πηγές</Text>
        </Box>

        <Box
          mt={[4, 10]}
          maxW="500px"
          width="100%"
          position="relative"
          zIndex={1}
        >
          <Flex flexDirection="column" gap={[3, 5]} pb={6}>
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Box
                  borderWidth={1}
                  borderColor="#8884d8"
                  p={4}
                  borderRadius={8}
                  transition="all .3s"
                  _hover={{
                    background: "#8884d820",
                    borderColor: "transparent",
                  }}
                >
                  <Flex
                    flexDirection="column"
                    justifyContent="space-between"
                    minH="100px"
                  >
                    <Box>
                      <Heading as="h2" size="md">
                        {post.title}
                      </Heading>
                      <Text color="gray.500" fontSize=".8rem" mt={2}>
                        {post.description}
                      </Text>
                    </Box>
                    <Text
                      color="gray.500"
                      fontSize=".7rem"
                      fontStyle="italic"
                      mt={2}
                    >
                      {post.date}
                    </Text>
                  </Flex>
                </Box>
              </Link>
            ))}
          </Flex>
        </Box>
      </Box>
    </Layout>
  );
}
