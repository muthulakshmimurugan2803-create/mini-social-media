import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Following() {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  return (
    <div>
      <Navbar />

      <main className="profile-container">
        <h1>Following 🤝</h1>

        <div className="profile-card">
          <h2>People I Follow</h2>

          <p>
            Total Following:{" "}
            {user?.following?.length || 0}
          </p>

          <hr />

          <p>
            People you follow will appear here.
          </p>

          <br />

          <Link to="/dashboard">
            <button>
              ← Back to Dashboard
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Following;