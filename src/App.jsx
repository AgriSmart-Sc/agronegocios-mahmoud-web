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
    async function iniciar() {
      const { data } = await supabase.auth.getSession();
      const sesionActual = data.session;

      setSession(sesionActual);

      if (sesionActual?.user) {
        await cargarPerfil(sesionActual.user.id);
      } else {
        setCargando(false);
      }
    }

    iniciar();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nuevaSession) => {
      setSession(nuevaSession);

      if (nuevaSession?.user) {
        await cargarPerfil(nuevaSession.user.id);
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
      .select("usuario_id, cliente_id, nombre, rol, activo")
      .eq("usuario_id", userId)
      .maybeSingle();

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
    setSession(null);
    setPerfil(null);
  }

  function nombreRol(rol) {
    if (rol === "admin_editor") return "Administrador";
    if (rol === "admin_lector") return "Administrador lector";
    if (rol === "cliente") return "Cliente";
    return rol || "Sin rol";
  }

  if (cargando) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🌾 AgroNegocios Mahmoud</h1>
          <p>Fumigación con drones y agroinsumos</p>
        </header>

        <main className="app-main">
          <h2>Cargando...</h2>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🌾 AgroNegocios Mahmoud</h1>
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

          {error && <p style={{ color: "crimson" }}>{error}</p>}
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌾 AgroNegocios Mahmoud</h1>
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

            {perfil.cliente_id && (
              <p>
                Cliente ID: <strong>{perfil.cliente_id}</strong>
              </p>
            )}
          </>
        ) : (
          <>
            <h2>Perfil no encontrado</h2>
            <p>
              El usuario inició sesión, pero no tiene registro en la tabla
              perfiles.
            </p>
          </>
        )}

        {error && <p style={{ color: "crimson" }}>{error}</p>}

        <button onClick={cerrarSesion}>Cerrar sesión</button>
      </main>
    </div>
  );
}
