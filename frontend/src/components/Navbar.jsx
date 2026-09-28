import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">Kalāsetu</Link>
        <ul className="navbar-links">
          <li><Link href="/">Gallery</Link></li>
          <li><Link href="/upload">Upload</Link></li>
          <li><Link href="/spotlight">Spotlights</Link></li>
          <li><Link href="/crafts">Craft Archive</Link></li>
          <li><Link href="/crafts/new">Submit Craft</Link></li>
        </ul>
      </div>
    </nav>
  );
}
