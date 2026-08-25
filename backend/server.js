const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Post = require("./models/Post");
const User = require("./models/User");

const app = express();

// ==================== MIDDLEWARE ====================

app.use(cors());
app.use(express.json());

// ==================== MONGODB CONNECTION ====================

let isConnecting = false;

const connectDB = async () => {
  try {
    // Already connected
    if (mongoose.connection.readyState === 1) {
      return;
    }

    // Connection already in progress
    if (isConnecting) {
      return;
    }

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    isConnecting = true;

    await mongoose.connect(process.env.MONGO_URI);

    isConnecting = false;

    console.log("MongoDB connected successfully!");
  } catch (error) {
    isConnecting = false;

    console.log("MongoDB connection error:", error.message);

    throw error;
  }
};

// ==================== DATABASE MIDDLEWARE ====================

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// ==================== TEST ====================

app.get("/", (req, res) => {
  res.json({
    message: "Mini Social Media Backend is running!",
  });
});

// ==================== REGISTER ====================

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

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
    console.log("Registration error:", error.message);

    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

// ==================== LOGIN ====================

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
    console.log("Login error:", error.message);

    res.status(500).json({
      message: "Login failed",
      error: error.message,
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
    console.log("Create post error:", error.message);

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
    console.log("Get posts error:", error.message);

    res.status(500).json({
      message: "Failed to fetch posts",
      error: error.message,
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
    console.log("Delete post error:", error.message);

    res.status(500).json({
      message: "Failed to delete post",
      error: error.message,
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
    console.log("Like error:", error.message);

    res.status(500).json({
      message: "Failed to like post",
      error: error.message,
    });
  }
});

// ==================== ADD COMMENT ====================

app.put("/api/posts/:id/comment", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: req.body.comment,
        },
      },
      { new: true }
    );

    res.json(post);
  } catch (error) {
    console.log("Add comment error:", error.message);

    res.status(500).json({
      message: "Failed to add comment",
      error: error.message,
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
    console.log("Delete comment error:", error.message);

    res.status(500).json({
      message: "Failed to delete comment",
      error: error.message,
    });
  }
});

// ==================== USER STATS ====================

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
    console.log("User stats error:", error.message);

    res.status(500).json({
      message: "Failed to fetch user stats",
      error: error.message,
    });
  }
});

// ==================== UPDATE USER PROFILE ====================

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
    console.log("Update profile error:", error.message);

    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
});

// ==================== FOLLOW USER ====================

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
    console.log("Follow error:", error.message);

    res.status(500).json({
      message: "Failed to follow user",
      error: error.message,
    });
  }
});

// ==================== UNFOLLOW USER ====================

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
    console.log("Unfollow error:", error.message);

    res.status(500).json({
      message: "Failed to unfollow user",
      error: error.message,
    });
  }
});

// ==================== GET ALL USERS ====================

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select(
      "name email followers following"
    );

    res.json(users);
  } catch (error) {
    console.log("Get users error:", error.message);

    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

// ==================== GET FOLLOWERS ====================

app.get("/api/users/:id/followers", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "name email"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user.followers);
  } catch (error) {
    console.log("Get followers error:", error.message);

    res.status(500).json({
      message: "Failed to fetch followers",
      error: error.message,
    });
  }
});

// ==================== LOCAL SERVER ====================

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// ==================== VERCEL EXPORT ====================

module.exports = app;