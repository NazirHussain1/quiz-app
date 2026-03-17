"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { ReduxProvider } from "./store/ReduxProvider";
import Navbar from "./components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <Navbar />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
