"use client";

import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ReduxProvider } from "@/app/store/ReduxProvider";
import Navbar from "@/app/components/Navbar";
import { ToastContainer } from "react-toastify";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <Navbar />
          {children}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            style={{ zIndex: 9999 }}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}
