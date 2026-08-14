const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Post = require("./models/Post");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/mini_social_media")
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });

// Test
app.get("/", (req, res) => {
  res.send("Mini Social Media Backend is running!");
});

// ==================== REGISTER ====================

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const newUser = new User({
      name,
      email,
      password,
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "Registration successful",
      user: savedUser,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
});
// Login User
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (user.password !== password) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    res.json({
      message: "Login successful",
      user: user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});
// ==================== CREATE POST ====================

app.post("/api/posts", async (req, res) => {
  try {
    const newPost = new Post({
      content: req.body.content,
      userId: req.body.userId,
    });

    const savedPost = await newPost.save();

    res.status(201).json(savedPost);
  } catch (error) {
    console.log("Create post error:", error);

    res.status(500).json({
      message: "Failed to create post",
      error: error.message,
    });
  }
});

// ==================== GET POSTS ====================

app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch posts",
    });
  }
});

// ==================== DELETE POST ====================

app.delete("/api/posts/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);

    res.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to delete post",
    });
  }
});

// ==================== LIKE POST ====================

app.put("/api/posts/:id/like", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    res.json(post);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to like post",
    });
  }
});

// ==================== ADD COMMENT ====================

app.put("/api/posts/:id/comment", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: req.body.comment } },
      { new: true }
    );

    res.json(post);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to add comment",
    });
  }
});

// ==================== DELETE COMMENT ====================

app.put("/api/posts/:id/comment/delete", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: req.body.comment,
        },
      },
      { new: true }
    );

    res.json(post);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to delete comment",
    });
  }
});

// // ==================== USER STATS ====================

app.get("/api/users/:id/posts", async (req, res) => {
  try {
    const posts = await Post.find({
      userId: req.params.id,
    });

    const user = await User.findById(req.params.id);

    res.json({
      count: posts.length,
      followers: user ? user.followers.length : 0,
      following: user ? user.following.length : 0,
    });
  } catch (error) {
    console.log("Error fetching user stats:", error);

    res.status(500).json({
      message: "Failed to fetch user stats",
    });
  }
});
// Update User Profile
app.put("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
      },
      { new: true }
    );

    res.json(user);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to update profile",
    });
  }
});
 
// Follow User
app.put("/api/users/:id/follow", async (req, res) => {
  try {
    const currentUserId = req.body.currentUserId;
    const targetUserId = req.params.id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const alreadyFollowing = currentUser.following.includes(
      targetUserId
    );

    if (alreadyFollowing) {
      return res.status(400).json({
        message: "Already following this user",
      });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: "User followed successfully",
    });
  } catch (error) {
    console.log("Follow error:", error);

    res.status(500).json({
      message: "Failed to follow user",
    });
  }
});
// Unfollow User
// Unfollow User
app.put("/api/users/:id/unfollow", async (req, res) => {
  try {
    const currentUserId = req.body.currentUserId;
    const targetUserId = req.params.id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId.toString()
    );

    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId.toString()
    );

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: "User unfollowed successfully",
    });
  } catch (error) {
    console.log("Unfollow error:", error);

    res.status(500).json({
      message: "Failed to unfollow user",
    });
  }
});
// Get All Users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select(
      "name email followers following"
    );

    res.json(users);
  } catch (error) {
    console.log("Error fetching users:", error);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
});
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
// ==================== GET FOLLOWERS ====================

app.get("/api/users/:id/followers", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers", "name email");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user.followers);
  } catch (error) {
    console.log("Error fetching followers:", error);

    res.status(500).json({
      message: "Failed to fetch followers",
    });
  }
});