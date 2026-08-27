import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [postCount, setPostCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      return;
    }

    const currentUser = JSON.parse(savedUser);
    setUser(currentUser);

    const fetchUserStats = async () => {
      try {
        const response = await fetch(
          `https://mini-social-media-4xtk.vercel.app/api/users/${currentUser._id}/posts`
        );

        const data = await response.json();

        setPostCount(data.count || 0);
        setFollowerCount(data.followers || 0);
        setFollowingCount(data.following || 0);
      } catch (error) {
        console.log(
          "Error fetching dashboard stats:",
          error
        );
      }
    };

    fetchUserStats();
  }, []);

  return (
    <div>
      <Navbar />

      <main className="dashboard-container">
        <h1>Dashboard 📊</h1>

        <div className="dashboard-profile">
          <div className="profile-image">👤</div>

          <h2>{user ? user.name : "User"}</h2>

          <p>{user ? user.email : ""}</p>

          <Link to="/profile">
            <button>
              👤 View Profile
            </button>
          </Link>
        </div>

        <div className="dashboard-stats">

          <Link
            to="/home"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div className="stat-card">
              <span className="stat-icon">📝</span>
              <strong>{postCount}</strong>
              <p>Posts</p>
            </div>
          </Link>

          <Link
            to="/followers"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div className="stat-card">
              <span className="stat-icon">👥</span>
              <strong>{followerCount}</strong>
              <p>Followers</p>
            </div>
          </Link>

          <Link
            to="/following"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div className="stat-card">
              <span className="stat-icon">🤝</span>
              <strong>{followingCount}</strong>
              <p>Following</p>
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;