import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function Home() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/posts"
        );

        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.log("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const handlePost = async () => {
    if (newPost.trim() === "") {
      return;
    }

    try {
      const savedUser = JSON.parse(
        localStorage.getItem("user")
      );

      const response = await fetch(
        "http://localhost:5000/api/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: newPost,
            userId: savedUser._id,
          }),
        }
      );

      const data = await response.json();

      setPosts((prevPosts) => [data, ...prevPosts]);
      setNewPost("");
    } catch (error) {
      console.log("Error creating post:", error);
    }
  };

  const handleLike = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${id}/like`,
        {
          method: "PUT",
        }
      );

      const updatedPost = await response.json();

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === updatedPost._id
            ? updatedPost
            : post
        )
      );
    } catch (error) {
      console.log("Error liking post:", error);
    }
  };

  const handleComment = async (id) => {
    const comment = commentInputs[id] || "";

    if (comment.trim() === "") {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${id}/comment`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comment: comment,
          }),
        }
      );

      const updatedPost = await response.json();

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === updatedPost._id
            ? updatedPost
            : post
        )
      );

      setCommentInputs((prev) => ({
        ...prev,
        [id]: "",
      }));
    } catch (error) {
      console.log("Error adding comment:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(
        `http://localhost:5000/api/posts/${id}`,
        {
          method: "DELETE",
        }
      );

      setPosts((prevPosts) =>
        prevPosts.filter(
          (post) => post._id !== id
        )
      );
    } catch (error) {
      console.log("Error deleting post:", error);
    }
  };

  const handleDeleteComment = async (postId, comment) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/comment/delete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comment: comment,
          }),
        }
      );

      const updatedPost = await response.json();

      setPosts((prevPosts) =>
        prevPosts.map((item) =>
          item._id === updatedPost._id
            ? updatedPost
            : item
        )
      );
    } catch (error) {
      console.log("Error deleting comment:", error);
    }
  };

  return (
    <div>
      <Navbar />

      <main className="home-container">

        <div className="home-header">
          <h1>Welcome to Mini Social Media 👋</h1>
          <p>Connect, share and interact with your friends.</p>
          <strong>Total Posts: {posts.length}</strong>
        </div>

        <div className="post-box">
          <h2>📝 Create a Post</h2>

          <textarea
            value={newPost}
            onChange={(e) =>
              setNewPost(e.target.value)
            }
            placeholder="What's on your mind?"
          />

          <button onClick={handlePost}>
            ➕ Post
          </button>
        </div>

        <div className="feed">

          {posts.length === 0 ? (
            <div className="empty-posts">
              <h3>No posts yet 😌</h3>
              <p>Be the first person to create a post!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div className="post" key={post._id}>

                <div className="post-user">
                  <div className="user-avatar">
                    👤
                  </div>

                  <div>
                    <h3>
                      {post.userId?.name || "User"}
                    </h3>

                    {post.createdAt && (
                      <small>
                        {new Date(
                          post.createdAt
                        ).toLocaleString()}
                      </small>
                    )}
                  </div>
                </div>

                <p className="post-content">
                  {post.content}
                </p>

                <div className="post-actions">

                  <button
                    onClick={() =>
                      handleLike(post._id)
                    }
                  >
                    ❤️ Like {post.likes || 0}
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(post._id)
                    }
                  >
                    🗑️ Delete
                  </button>

                </div>

                <div className="comment-section">

                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={
                      commentInputs[post._id] || ""
                    }
                    onChange={(e) =>
                      setCommentInputs((prev) => ({
                        ...prev,
                        [post._id]: e.target.value,
                      }))
                    }
                  />

                  <button
                    onClick={() =>
                      handleComment(post._id)
                    }
                  >
                    💬 Comment
                  </button>

                  <div className="comments">

                    {(post.comments || []).map(
                      (comment, index) => (
                        <div
                          className="comment"
                          key={index}
                        >
                          <span>
                            💬 {comment}
                          </span>

                          <button
                            onClick={() =>
                              handleDeleteComment(
                                post._id,
                                comment
                              )
                            }
                          >
                            🗑️
                          </button>
                        </div>
                      )
                    )}

                  </div>

                </div>

              </div>
            ))
          )}

        </div>
      </main>
    </div>
  );
}

export default Home;