import { Navigate } from "react-router-dom";
import { useUser } from "./UserContext";

const PrivateRoute = ({ children }) => {
  const { usuario } = useUser();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
