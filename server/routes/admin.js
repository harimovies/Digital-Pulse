const express = require("express");
const router = express.Router();
const Post = require("../model/Post");
const User = require("../model/User");
const Article = require("../model/Articles");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { upload } = require("./uploads");

const adminLayout = "./layouts/admin";

const jwtSecret = process.env.JWT_SECRET;

/**
 * check login
 * middleware
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    // return res.status(401).json({ message: "Unauthorized" });
    return res.render("admin/error2");
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    // console.log(decoded.userID);
    // console.log(decoded.role);

    if (decoded.role == "admin") {
      next();
    } else {
      // return res.status(401).json({ message: "Unauthorized" });
      return res.render("admin/error2");
    }
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

/**
 * GET/
 * Admin - Login page
 */
router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "New Management System Project",
    };
    res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST/
 * Admin - Login
 */
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    // console.log(req.body);
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(409).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userID: user._id, role: "admin" }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {}
});

/**
 * GET/
 * Admin Dashboard with posts
 */
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "Admin Panel for News Management System",
    };
    // const articleName = req.params.articleName;
    const data = await Article.find();
    res.render("admin/articles", { locals, data, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET/
 * Admin Dashboard with posts
 */
router.get("/dashboard/:articleName", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "Admin Panel for News Management System",
    };
    const articleName = req.params.articleName;
    const data = await Post.find({ articleType: articleName });
    res.render("admin/dashboard", {
      locals,
      data,
      articleName,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET/
 * Admin - Create new post
 */
router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Adding a new post",
    };
    const data = await Article.find();
    res.render("admin/add-post", { locals, data, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET/
 * Admin - Create new category
 */
router.get("/add-article", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Adding a new post",
    };
    res.render("admin/add-article", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST/
 * Admin - Add new post
 */
router.post(
  "/add-post",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      // console.log(req.body);
      try {
        const newPost = new Post({
          articleType: req.body.articleType,
          title: req.body.title,
          synopsis: req.body.synopsis,
          body: req.body.body,
          filename: req.file.filename,
          filepath: req.file.path,
        });
        await Post.create(newPost);
        res.redirect("/dashboard/" + req.body.articleType);
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  }
);

/**
 * POST/
 * Admin - Add new category
 */
router.post(
  "/add-article",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      // console.log(req.body);
      try {
        const newArticle = new Article({
          articleType: req.body.articleType,
          filename: req.file.filename,
          filepath: req.file.path,
        });
        await Article.create(newArticle);
        res.redirect("/dashboard");
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  }
);

/**
 * DELETE
 * Admin - Delete a post
 */
router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    const article_ = await Post.findById(req.params.id);
    const articleType = article_.articleType;
    await Post.findByIdAndDelete(req.params.id);
    res.redirect("/dashboard/" + articleType);
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET
 * Admin - edit - post page
 */
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Adding a new post",
    };
    const data = await Post.findOne({ _id: req.params.id });
    const data2 = await Article.find();
    res.render("admin/edit-post", {
      locals,
      data,
      data2,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});

/**
 * PUT
 * Admin - Update a post
 */
router.put(
  "/edit-post/:id",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      await Post.findByIdAndUpdate(req.params.id, {
        articleType: req.body.articleType,
        title: req.body.title,
        synopsis: req.body.synopsis,
        body: req.body.body,
        filename: req.file.filename,
        filepath: req.file.path,
        updatedAt: Date.now(),
      });
      res.redirect(`/edit-post/${req.params.id}`);
    } catch (error) {
      console.log(error);
    }
  }
);

/**
 * GET - update article category
 */
router.get("/edit-article/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Adding a new post",
    };
    const data = await Article.findOne({ _id: req.params.id });
    // const data2 = await Article.find();
    res.render("admin/edit-article", {
      locals,
      data,
      // data2,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});

/**
 * PUT - update article category
 */
router.put(
  "/edit-article/:id",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const locals = {
        title: "Add Post",
        description: "Adding a new post",
      };
      const data = await Article.findOne({ _id: req.params.id });
      const articleName = data.articleType;
      // const data2 = await Article.find();
      await Article.findByIdAndUpdate(req.params.id, {
        $set: {
          articleType: req.body.articleType,
          filename: req.file.filename,
          filepath: req.file.path,
        },
      });
      await Post.updateMany(
        {
          articleType: articleName,
        },
        {
          $set: { articleType: req.body.articleType },
        }
      );
      res.redirect("/edit-article/" + req.params.id);
    } catch (error) {
      console.log(error);
    }
  }
);

/**
 * Delte - article category
 */
router.delete("/delete-article/:id", authMiddleware, async (req, res) => {
  try {
    const data = await Article.findOne({ _id: req.params.id });
    const articleName = data.articleType;
    await Article.findByIdAndDelete(req.params.id);
    await Post.deleteMany({
      articleType: articleName,
    });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST/
 * Admin - login sample
 */
// router.post("/admin", async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     // console.log(req.body);
//     if (req.body.username === "admin" && req.body.password === "pass") {
//       res.send("You are logged in.");
//     } else {
//       res.send("Wrong Username or Password.");
//     }
//   } catch (error) {}
// });

/**
 * POST/
 * Admin - Redister
 */
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: "User Created", user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: "User already in use" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET/
 * User - logout Admin
 */
router.get("/logoutAdmin", (req, res) => {
  res.clearCookie("token");
  // res.json({ message: "Logout successfull" });
  res.redirect("/admin");
});

module.exports = router;

//!--------------------------------
/**
 * GET/
 * Admin Dashboard old
 */
// router.get("/dashboard", authMiddleware, async (req, res) => {
//   try {
//     const locals = {
//       title: "Dashboard",
//       description: "Admin Panel for News Management System",
//     };
//     const data = await Post.find();
//     res.render("admin/dashboard", { locals, data, layout: adminLayout });
//   } catch (error) {
//     console.log(error);
//   }
// });
