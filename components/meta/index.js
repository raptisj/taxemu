import Head from "next/head";
import { META_TITLE, META_DESCRIPTION } from "constants/content";

export const Meta = () => {
  return (
    <Head>
      <title>{META_TITLE}</title>
      <meta name="description" content={META_DESCRIPTION} />
      <meta property="og:title" content={META_TITLE} />
      <meta property="og:description" content={META_DESCRIPTION} />
      <link rel="icon" href="/favicon.ico?v=3" />
    </Head>
  );
};
