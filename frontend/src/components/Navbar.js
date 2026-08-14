import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <nav className="navbar">
      <h2>🌐 Mini Social</h2>

      <div className="nav-links">
        <Link to="/home">🏠 Home</Link>
        <Link to="/dashboard">📊 Dashboard</Link>
        <Link to="/users">👥 Users</Link>
        <Link to="/profile">👤 Profile</Link>

        <button onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;