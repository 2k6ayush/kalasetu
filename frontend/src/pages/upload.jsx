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
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 className="page-title">Upload Your Art</h1>
          <p className="page-subtitle">Share your work with the world. Our AI will check content policies and generate discovery tags automatically.</p>
        </div>
        <UploadForm />
      </main>
    </>
  );
}
