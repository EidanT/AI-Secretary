import { useEffect, useState, useRef, Activity } from "react";
import { FaSignOutAlt, FaArrowCircleRight } from "react-icons/fa"
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

import './css/home.css'

interface User {
  google_id: string;
  name: string;
  email: string;
  picture: string;
  refresh_token: string
}

type Message = {
    text: string;
    sender: "user" | "agent";
};


const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [show, setShow] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const navigate = useNavigate(); 
  
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  const handleExitButton = () => {
    navigate("/signup");
    localStorage.removeItem("user");
  };
  
  const handleInput = () => {
    const textArea = textAreaRef.current;
    
    if (!textArea) return;
    
    textArea.style.height = "auto";
    textArea.style.height = `${textArea.scrollHeight}px`
    textArea.style.maxHeight = "200px";
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!boxRef.current) return;
      
      if (!boxRef.current.contains(event.target as Node)) {
        setShow(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  
  useEffect(() => {
    if (!user) return;
    
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: {
        userId: user.google_id,
      },
    });
    
    const socket = socketRef.current;
    
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });
    
    socket.on("receive_message", (data: { text: string }) => {
      setMessages(prev => [...prev, { text: data.text, sender: "agent" }]);
    });
    
    return () => {
      socket.disconnect();
    };
  }, [user]);
  
  if (!user) return <p>No hay usuario logueado</p>;
  
  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    if (!socketRef.current) return;
    
    const userMsg: Message = { text, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    
    socketRef.current.emit("send_message", { text });
  };
  
  
  return (
    <div>
      <header>
        <h1>{user.name}</h1>
        <img
          src={user.picture}
          width={40}
          style={{ borderRadius: "50%", cursor: "pointer" }}
          onClick={() => show ? setShow(false) : setShow(true)}
          />
      </header>

      <Activity mode={show ? "visible" : "hidden"}>
        <div className="dropdown" ref={boxRef}>
          <div className="triangle"></div>
          <h1>{user.email}</h1>
          <hr />
          <button className="exit-button" onClick={handleExitButton}>
            <FaSignOutAlt color={"red"} />
            <h1>Exit</h1>
          </button>
        </div>
      </Activity>

      <div className="textArea">
        <textarea ref={textAreaRef} 
                  name="" 
                  id="" 
                  placeholder="What are we doing today boss?"
                  onInput={handleInput}
        />

        <button className="enterButton" onClick={() => sendMessage(textAreaRef.current?.value ?? "")}>
            <FaArrowCircleRight color={"white"} size={38}/>
        </button>
      </div>
    </div>
  )
}