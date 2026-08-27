import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function Profile() {
  const savedUser = localStorage.getItem("user");
  const user = savedUser ? JSON.parse(savedUser) : null;

  const [name, setName] = useState(user ? user.name : "");
  const [email, setEmail] = useState(user ? user.email : "");

  const [postCount, setPostCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfileStats = async () => {
      if (!user) {
        return;
      }

      try {
        const response = await fetch(
          `https://mini-social-media-4xtk.vercel.app/api/users/${user._id}/posts`
        );

        const data = await response.json();

        setPostCount(data.count || 0);
        setFollowerCount(data.followers || 0);
        setFollowingCount(data.following || 0);
      } catch (error) {
        console.log("Error fetching profile:", error);
      }
    };

    fetchProfileStats();
  }, [user]);

  const handleUpdate = async () => {
    if (!user) {
      alert("User not found");
      return;
    }

    try {
      const response = await fetch(
        `https://mini-social-media-4xtk.vercel.app/api/users/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            email: email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Update failed");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data));

      alert("Profile updated successfully!");

      setEditing(false);

      window.location.reload();
    } catch (error) {
      console.log("Update error:", error);
      alert("Cannot connect to backend");
    }
  };

  return (
    <div>
      <Navbar />

      <main className="profile-container">
        <h1>My Profile 👤</h1>

        <div className="profile-card">

          <div className="profile-image">
            👤
          </div>

          {editing ? (
            <div className="profile-edit">

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />

              <button onClick={handleUpdate}>
                💾 Save Changes
              </button>

              <button
                onClick={() => setEditing(false)}
                className="cancel-button"
              >
                Cancel
              </button>

            </div>
          ) : (
            <div>
              <h2>{user ? user.name : "User"}</h2>

              <p>{user ? user.email : "No email"}</p>

              <button onClick={() => setEditing(true)}>
                ✏️ Edit Profile
              </button>
            </div>
          )}

          <hr />

          <div className="profile-stats">

            <div>
              <strong>{postCount}</strong>
              <span>Posts</span>
            </div>

            <div>
              <strong>{followerCount}</strong>
              <span>Followers</span>
            </div>

            <div>
              <strong>{followingCount}</strong>
              <span>Following</span>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

export default Profile;