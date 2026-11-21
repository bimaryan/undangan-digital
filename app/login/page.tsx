import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F3F1EA",
            color: "#6D6A61",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
          }}
        >
          Memuat halaman login...
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
