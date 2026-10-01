import Head from 'next/head';
import Navbar from '@/components/Navbar';
import UploadForm from '@/components/UploadForm';

export default function Upload() {
  return (
    <>
      <Head>
        <title>Upload — Kalāsetu</title>
        <meta name="description" content="Upload your artwork to Kalāsetu. AI moderation and automatic tagging." />
      </Head>
      <Navbar />
      <main className="container page">
        <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '32px' }}>
          <p className="editorial-caption" style={{ marginBottom: '8px' }}>The Kalāsetu Archive</p>
          <h1 className="editorial-title" style={{ fontSize: '3rem', marginBottom: '16px' }}>Upload Your Art</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>Share your work with the world. Our AI will check content policies and generate discovery tags automatically.</p>
        </div>
        <UploadForm />
      </main>
    </>
  );
}
