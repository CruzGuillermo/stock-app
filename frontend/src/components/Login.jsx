import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "./UserContext"; // ajusta ruta

const Login = () => {
  const [usuarioInput, setUserInput] = useState("");
  const [contraseñaInput, setPassInput] = useState("");
  const { setUsuario } = useUser();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(`/login`, {
        usuario: usuarioInput,
        contrasena: contraseñaInput,
      });
      setUsuario(res.data);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.error || "Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="mb-4">Iniciar Sesión</h2>
      <input
        type="text"
        placeholder="Usuario"
        value={usuarioInput}
        onChange={(e) => setUserInput(e.target.value)}
        className="form-control mb-3"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={contraseñaInput}
        onChange={(e) => setPassInput(e.target.value)}
        className="form-control mb-3"
      />
      <button onClick={handleLogin} className="btn btn-primary w-100">
        Ingresar
      </button>
    </div>
  );
};

export default Login;
