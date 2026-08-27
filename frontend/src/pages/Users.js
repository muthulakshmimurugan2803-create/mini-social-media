import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Users() {
  const [users, setUsers] = useState([]);

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "https://mini-social-media-4xtk.vercel.app/api/users"
      );

      const data = await response.json();

      setUsers(data);
    } catch (error) {
      console.log("Error fetching users:", error);
    }
  };

  const handleFollow = async (userId, isFollowing) => {
    try {
      if (!currentUser) {
        alert("Please login first");
        return;
      }

      const url = isFollowing
        ? `https://mini-social-media-4xtk.vercel.app/api/users/${userId}/unfollow`
        : `https://mini-social-media-4xtk.vercel.app/api/users/${userId}/follow`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentUserId: currentUser._id,
        }),
      });

      const data = await response.json();

      alert(data.message);

      fetchUsers();
    } catch (error) {
      console.log("Follow/Unfollow error:", error);
    }
  };

  return (
    <div>
      <Navbar />

      <div
        style={{
          textAlign: "center",
          marginTop: "40px",
        }}
      >
        <h1>Users 👥</h1>

        {users.map((user) => {
          if (
            currentUser &&
            user._id.toString() ===
              currentUser._id.toString()
          ) {
            return null;
          }

          const isFollowing =
            currentUser &&
            user.followers?.some(
              (id) =>
                id.toString() ===
                currentUser._id.toString()
            );

          return (
            <div
              key={user._id}
              className="profile-card"
              style={{
                margin: "20px auto",
                maxWidth: "400px",
              }}
            >
              <div className="profile-image">
                👤
              </div>

              <h2>{user.name}</h2>

              <p>{user.email}</p>

              <p>
                Followers:{" "}
                {user.followers?.length || 0}
              </p>

              <p>
                Following:{" "}
                {user.following?.length || 0}
              </p>

              <button
                onClick={() =>
                  handleFollow(
                    user._id,
                    isFollowing
                  )
                }
              >
                {isFollowing
                  ? "❌ Unfollow"
                  : "👥 Follow"}
              </button>

              <br />
              <br />

              <Link
                to={`/users/${user._id}`}
              >
                <button>
                  👤 View Profile
                </button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Users;