import './globals.css';

export const metadata = {
  title: 'RepWatch — Know Who Represents You',
  description: 'See your representatives, their voting records, and who funds them.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
