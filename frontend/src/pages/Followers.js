import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Followers() {
  const [followers, setFollowers] = useState([]);

  const userId = JSON.parse(
    localStorage.getItem("user")
  )?._id;

  useEffect(() => {
    const fetchFollowers = async () => {
      if (!userId) {
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/users/${userId}/followers`
        );

        const data = await response.json();

        setFollowers(data);
      } catch (error) {
        console.log(
          "Error fetching followers:",
          error
        );
      }
    };

    fetchFollowers();
  }, [userId]);

  return (
    <div>
      <Navbar />

      <main className="profile-container">
        <h1>Followers 👥</h1>

        {followers.length === 0 ? (
          <div className="profile-card">
            <h2>No Followers Yet</h2>

            <p>
              You don't have any followers yet.
            </p>
          </div>
        ) : (
          followers.map((follower) => (
            <div
              key={follower._id}
              className="profile-card"
            >
              <div className="profile-image">
                👤
              </div>

              <h2>{follower.name}</h2>

              <p>{follower.email}</p>

              <Link
                to={`/users/${follower._id}`}
              >
                <button>
                  👤 View Profile
                </button>
              </Link>
            </div>
          ))
        )}

        <br />

        <Link to="/dashboard">
          <button>
            ← Back to Dashboard
          </button>
        </Link>
      </main>
    </div>
  );
}

export default Followers;