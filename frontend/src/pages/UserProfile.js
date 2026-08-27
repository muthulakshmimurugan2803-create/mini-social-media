import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

function UserProfile() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [postCount, setPostCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  // Get user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(
          "https://mini-social-media-4xtk.vercel.app/api/users"
        );

        const users = await response.json();

        const selectedUser = users.find(
          (item) => item._id === id
        );

        if (!selectedUser) {
          return;
        }

        setUser(selectedUser);

        setPostCount(
          selectedUser.posts?.length || 0
        );

        setFollowerCount(
          selectedUser.followers?.length || 0
        );

        setFollowingCount(
          selectedUser.following?.length || 0
        );

        if (currentUser) {
          const following =
            selectedUser.followers?.some(
              (followerId) =>
                followerId.toString() ===
                currentUser._id.toString()
            );

          setIsFollowing(following);
        }
      } catch (error) {
        console.log(
          "Error fetching user profile:",
          error
        );
      }
    };

    fetchUserProfile();
  }, [id, currentUser]);

  // Follow / Unfollow
  const handleFollow = async () => {
    if (!currentUser) {
      alert("Please login first");
      return;
    }

    try {
      const url = isFollowing
        ? `https://mini-social-media-4xtk.vercel.app/api/users/${id}/unfollow`
        : `https://mini-social-media-4xtk.vercel.app/api/users/${id}/follow`;

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

      window.location.reload();
    } catch (error) {
      console.log(
        "Follow/Unfollow error:",
        error
      );
    }
  };

  // User not found
  if (!user) {
    return (
      <div>
        <Navbar />

        <div
          style={{
            textAlign: "center",
            marginTop: "50px",
          }}
        >
          <h2>User not found</h2>

          <Link to="/users">
            <button>Back to Users</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <main className="profile-container">
        <h1>User Profile 👤</h1>

        <div className="profile-card">
          <div className="profile-image">
            👤
          </div>

          <h2>{user.name}</h2>

          <p>{user.email}</p>

          <br />

          <button onClick={handleFollow}>
            {isFollowing
              ? "❌ Unfollow"
              : "👥 Follow"}
          </button>

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

          <br />

          <Link to="/users">
            <button>
              ← Back to Users
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default UserProfile;