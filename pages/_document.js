import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.png"></link>
        <meta name="theme-color" content="#fff" />
        <meta name="google-site-verification" content="u3IuC047hzSjfcduIVYX_fAaF-J8VzsWe6tTVKNbdFs" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
