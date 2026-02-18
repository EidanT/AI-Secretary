import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaArrowCircleRight } from "react-icons/fa";

import "./css/signup.css";
import Particles from "../component/animations/Particles/Particles";
import TextType from "../component/animations/TextType/TextType";

export default function Signup({ onLogin }: { onLogin: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return;

    const exchangeCode = async () => {
      setLoading(true);
      try {
        const res = await fetch(import.meta.env.VITE_GOOGLE_REDIRECT_URI!, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const data = await res.json();
        const { refresh_token, ...safeUser } = data.user;
       
        localStorage.setItem("user", JSON.stringify(safeUser));
        onLogin();
        navigate("/", { replace: true });

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
        redirect_uri: import.meta.env.VITE_REDIRECT_URI!,
        response_type: "code",
        scope: ["openid",
                "email",
                "profile", 
                "https://www.googleapis.com/auth/calendar",
                "https://www.googleapis.com/auth/gmail.send", 
                "https://www.googleapis.com/auth/gmail.modify",
                "https://www.googleapis.com/auth/gmail.readonly"
                ].join(" "),
        access_type: "offline",
        prompt: "consent",
      }).toString();

    window.location.href = googleURL;
  };

  return (
      <div className="app-wrapper">
        <div className="particles-bg" >
          <Particles
            particleColors={['#ffffff', '#ffffff']}
            particleCount={300}
            particleSpread={10}
            speed={0.06}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>

          <div className="card-container">
            <div className="welcome-container">
              <h1 className="welcome-title" >Welcome!</h1>

              <p className="welcome-text" >
                Welcome to your personal AI Secretary, where you can communicate and 
                manage your Gmail inbox and Google Calendar efficiently.
              </p>

              <div className="animated-text-container" >
                <div className="animated-text">
                  <TextType 
                    text={["Send a gmail to joe@gmail.com informing him that we have a meeting tomorrow at 6:00 PM", 
                      "Create an event for tomorrow at 7:00 PM titled “Dinner with Family.”", 
                      "When did the Dominican Republic gain its independence?"]}
                      typingSpeed={40}
                      pauseDuration={1700}
                      showCursor={true}
                      cursorCharacter="|"
                      />
                </div>
                  <FaArrowCircleRight className="enter-button" color={"white"} size={30} />
              </div>

            </div>

            <div className="signup-container">
              <h1 className="signup-title" >Signup</h1>

              <p className="signup-text" >
                Why sign up? To allow you to manage your Gmail and Google Calendar, 
                we require your authorization to access these services through Google.
              </p>

              <button className="signup-button" onClick={redirectToGoogle}>
                <FaGoogle size={30}></FaGoogle>
                Sign up with Google
              </button>
            </div>

            {loading && <p>Cargando...</p>}
            {error && <p>Error: {error}</p>}
          </div>
        </div>
  );
}