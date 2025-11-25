import "bootstrap/dist/css/bootstrap.min.css";

export const metadata = {
  title: "Quiz App",
  description: "Professional Quiz Application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
