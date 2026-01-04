import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./css/signup.css";

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return;

    const exchangeCode = async () => {
      try {
        await fetch("http://localhost:3000/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        })
        .then(res => res.json())
        .then(data => {
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/");
        })

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    exchangeCode();
  }, []);

  const redirectToGoogle = () => {
    const googleURL =
      "https://accounts.google.com/o/oauth2/v2/auth?" +
      new URLSearchParams({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID!,
        redirect_uri: "http://localhost:5173/signup",
        response_type: "code",
        scope: "openid email profile https://www.googleapis.com/auth/calendar",
        access_type: "offline",
        prompt: "consent",
      }).toString();

    window.location.href = googleURL;
  };

  return (
    <div>
      <h2>Signup / Login</h2>

      <button className="signup-button" onClick={redirectToGoogle}>
        Login con Google
      </button>

      {loading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
