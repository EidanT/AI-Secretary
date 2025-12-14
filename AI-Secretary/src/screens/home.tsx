import { useEffect, useState } from "react";

import './css/home.css'

interface User {
  google_id: string;
  name: string;
  email: string;
  picture: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return <p>No hay usuario logueado</p>;

  return (
    <div>
      <h2>Bienvenido {user.name}</h2>
      <p>{user.email}</p>
      <img
        src={user.picture}
        width={80}
        style={{ borderRadius: "50%" }}
      />
    </div>
  )
}