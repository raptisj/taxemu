import Head from "next/head";
import { META_TITLE, META_DESCRIPTION } from "constants";

export const Meta = () => {
  return (
    <Head>
      <title>{META_TITLE}</title>
      <meta name="description" content={META_DESCRIPTION} />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};
