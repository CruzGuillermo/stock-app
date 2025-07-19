import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "./UserContext";

const Login = () => {
  const [usuarioInput, setUserInput] = useState("");
  const [contraseñaInput, setPassInput] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [recordarme, setRecordarme] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUsuario } = useUser();
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  useEffect(() => {
  const recordar = localStorage.getItem("recordarme") === "true";
  setRecordarme(recordar);

  if (recordar) {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioGuardado?.usuario) {
      setUserInput(usuarioGuardado.usuario);
    }
  }
}, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const PARTICLE_COUNT = 60;

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = 3 + Math.random() * 3; // tamaño 3 a 6
        this.speedX = (Math.random() - 0.5) * 1.6; // velocidad ±0.8
        this.speedY = (Math.random() - 0.5) * 1.6;
        this.alpha = 0.1 + Math.random() * 0.2;
      }
      move() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > width) this.speedX = -this.speedX;
        if (this.y < 0 || this.y > height) this.speedY = -this.speedY;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    let animationFrameId;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (let p of particles) {
        p.move();
        p.draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`/login`, {
        usuario: usuarioInput,
        contrasena: contraseñaInput,
        recordarme,
      });
      setUsuario(res.data);
      if (recordarme) {
  localStorage.setItem("recordarme", "true");
  localStorage.setItem("usuario", JSON.stringify({ usuario: res.data.usuario }));
} else {
  localStorage.setItem("recordarme", "false");
  localStorage.removeItem("usuario");
}

      navigate("/");
    } catch (error) {
      alert(error.response?.data?.error || "Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 0,
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(135deg, #8e9eab, #eef2f3)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <style>
          {`
            input::placeholder {
              opacity: 0.7;
            }
            .input-icon {
              position: relative;
              margin-bottom: 20px;
            }
            /* Ajustamos padding-right para que no se pise con el botón */
            .input-icon input {
              padding-left: 40px !important;
              padding-right: 45px !important;
            }
            .input-icon span.icon-left {
              position: absolute;
              left: 10px;
              top: 50%;
              transform: translateY(-50%);
              font-size: 1.4rem;
              user-select: none;
            }
            .password-toggle {
              position: absolute;
              right: 10px;
              top: 50%;
              transform: translateY(-50%);
              cursor: pointer;
              font-size: 1.2rem;
              user-select: none;
              color: #555;
              transition: color 0.3s ease;
              z-index: 2;
              width: 24px;
              height: 24px;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .password-toggle:hover {
              color: #000;
            }
            .login-box {
              background: rgba(255, 255, 255, 0.85);
              border-radius: 12px;
              box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
              padding: 30px;
              width: 100%;
              max-width: 400px;
              color: #333;
              text-align: center;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .btn-primary {
              background: #2575fc;
              border: none;
              transition: background-color 0.3s ease;
              color: white;
              font-weight: 600;
            }
            .btn-primary:hover:not(:disabled) {
              background: #1859c5;
            }
            .spinner {
              margin: 20px auto 0 auto;
              border: 4px solid rgba(0, 0, 0, 0.1);
              border-top: 4px solid #2575fc;
              border-radius: 50%;
              width: 36px;
              height: 36px;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              0% { transform: rotate(0deg);}
              100% { transform: rotate(360deg);}
            }
            .remember-me {
              text-align: left;
              margin-bottom: 20px;
              font-size: 0.9rem;
            }
            .info-message {
              margin-bottom: 20px;
              color: #555;
              font-size: 1rem;
            }
          `}
        </style>

        <div
          className="login-box"
          role="main"
          aria-label="Formulario de inicio de sesión"
        >
          <h2 style={{ marginBottom: "30px", fontWeight: "700" }}>
            Iniciar Sesión
          </h2>

          <div className="info-message" aria-live="polite" aria-atomic="true">
            Por favor ingresa tu usuario y contraseña para continuar.
          </div>

          <div className="input-icon">
            <span role="img" aria-label="usuario" className="icon-left">
              👤
            </span>
            <input
              type="text"
              placeholder="Usuario"
              value={usuarioInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="form-control"
              autoComplete="username"
              disabled={loading}
              aria-required="true"
            />
          </div>

          <div className="input-icon" style={{ marginBottom: "10px" }}>
            <span role="img" aria-label="contraseña" className="icon-left">
              🔒
            </span>
            <input
              type={mostrarPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={contraseñaInput}
              onChange={(e) => setPassInput(e.target.value)}
              className="form-control"
              autoComplete="current-password"
              disabled={loading}
              aria-required="true"
            />
            <span
              className="password-toggle"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setMostrarPassword(!mostrarPassword);
              }}
              aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {mostrarPassword ? "🙈" : "🙉"}
            </span>
          </div>

          <label className="remember-me">
            <input
              type="checkbox"
              checked={recordarme}
              onChange={() => setRecordarme(!recordarme)}
              disabled={loading}
            />{" "}
            Recordarme
          </label>

          <button
            onClick={handleLogin}
            className="btn btn-primary w-100"
            disabled={loading || !usuarioInput || !contraseñaInput}
            aria-busy={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          {loading && <div className="spinner" aria-label="Cargando"></div>}
        </div>
      </div>
    </>
  );
};

export default Login;
