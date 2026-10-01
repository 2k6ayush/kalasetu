import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap"
          rel="stylesheet"
        />
        <meta name="description" content="Kalāsetu — a platform for independent artists and fading traditional crafts. Discover art beyond boundaries." />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
