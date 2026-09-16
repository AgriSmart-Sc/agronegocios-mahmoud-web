import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sesionActual = data.session;
      setSession(sesionActual);

      if (sesionActual?.user) {
        cargarPerfil(sesionActual.user.id);
      } else {
        setCargando(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nuevaSession) => {
      setSession(nuevaSession);

      if (nuevaSession?.user) {
        cargarPerfil(nuevaSession.user.id);
      } else {
        setPerfil(null);
        setCargando(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function cargarPerfil(userId) {
    setCargando(true);
    setError("");

    const { data, error } = await supabase
      .from("perfiles")
      .select("nombre, rol, activo")
      .eq("id", userId)
      .single();

    if (error) {
      setError("No se pudo cargar el perfil: " + error.message);
      setPerfil(null);
    } else {
      setPerfil(data);
    }

    setCargando(false);
  }

  async function iniciarSesion(e) {
    e.preventDefault();
    setError("");
    setCargando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Correo o contraseña incorrectos.");
      setCargando(false);
    }
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
  }

  function nombreRol(rol) {
    if (rol === "admin_editor") return "Administrador";
    if (rol === "admin_lector") return "Administrador espectador";
    if (rol === "cliente") return "Cliente";
    return rol;
  }

  if (cargando) {
    return (
      <div className="app-main">
        <h2>Cargando...</h2>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>AgronegociosMahmoud</h1>
          <p>Fumigación con drones y agroinsumos</p>
        </header>

        <main className="app-main">
          <h2>Iniciar sesión</h2>

          <form onSubmit={iniciarSesion}>
            <p>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </p>

            <p>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </p>

            <button type="submit">Ingresar</button>
          </form>

          {error && <p>{error}</p>}
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>AgronegociosMahmoud</h1>
        <p>Fumigación con drones y agroinsumos</p>
      </header>

      <main className="app-main">
        {perfil ? (
          <>
            <h2>Bienvenido, {perfil.nombre}</h2>
            <p>
              Tipo de usuario: <strong>{nombreRol(perfil.rol)}</strong>
            </p>

            <p>
              Estado:{" "}
              <strong>{perfil.activo ? "Activo" : "Inactivo"}</strong>
            </p>
          </>
        ) : (
          <p>No se encontró el perfil del usuario.</p>
        )}

        {error && <p>{error}</p>}

        <button onClick={cerrarSesion}>Cerrar sesión</button>
      </main>
    </div>
  );
}
