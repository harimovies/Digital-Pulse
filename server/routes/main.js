const express = require("express");
const router = express.Router();
const Post = require("../model/Post");
const Subscriber = require("../model/Subscribers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Article = require("../model/Articles");
const Comment = require("../model/Comments");

const jwtSecret = process.env.JWT_SECRET;

/**
 * check login
 * middleware
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    // return res.status(401).json({ message: "Unauthorized" });
    return res.redirect("/login");
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userID;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

/**
 * GET/
 * user side posts
 */
router.get("/posts/:articleName", authMiddleware, async (req, res) => {
  const locals = {
    title: "Daily News",
    description: "New Management System Project",
  };
  try {
    // console.log(req.params.articleName);

    let articleName = req.params.articleName;
    let perPage = 10;
    let page = req.query.page || 1;
    const data = await Post.find({ articleType: articleName })
      .sort({
        createdAt: -1,
      })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    // const data = await postss
    //   .aggregate([{ $sort: { createdAt: -1 } }])
    //   .skip(perPage * page - perPage)
    //   .limit(perPage)
    //   .exec();
    const count = await Post.find({
      articleType: articleName,
    }).countDocuments();
    // console.log(count);
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    let articleData = await Article.findOne({ articleType: articleName });

    res.render("index", {
      locals,
      data,
      articleName,
      current: page,
      articleData,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET/
 * post:id
 */
router.get("/post/:id", authMiddleware, async (req, res) => {
  try {
    let slug = req.params.id;
    const data = await Post.findById({ _id: slug });
    const subscriber_id = req.userId;
    const comments_arr = await Comment.find({ post_id: slug });
    // console.log(comments_arr);

    const locals = {
      title: data.title,
      description: "New Management System Project",
    };
    res.render("post", { locals, data, comments_arr });
  } catch (error) {
    console.log(error);
  }
});

/**
 * Add comments
 */
router.post("/post/addComment/:id", authMiddleware, async (req, res) => {
  try {
    const post_id = req.params.id;
    const subscriber_id = req.userId;
    // console.log(post_id);
    // console.log(user_id);
    const subscriber_data = await Subscriber.findById(subscriber_id);
    const subscriber_name = subscriber_data.username;
    const newComment = await Comment.create({
      post_id: post_id,
      subscriber_id: subscriber_id,
      subscriber_name: subscriber_name,
      comment_content: req.body.commentContent,
    });
    // console.log(req.body.commentContent);
    // console.log(newComment);
    res.redirect(`/post/${post_id}`);
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST/
 * Post - searchTerm
 */
router.post("/search", async (req, res) => {
  try {
    const locals = {
      title: "Search",
      description: "New Management System Project",
    };
    let searchTerm = req.body.searchTerm;
    // console.log(searchTerm);
    let searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });
    res.render("search", {
      data,
      locals,
    });
  } catch (error) {
    console.log(error);
  }
});

/**
 * about page
 */
router.get("/about", (req, res) => {
  res.render("about");
});

//!----------------------------------------
/**
 * User Login page
 */
router.get("/login", async (req, res) => {
  try {
    const locals = {
      title: "User Login",
      description: "New Management System Project",
      webPage: "login",
    };
    res.render("login", { locals });
  } catch (error) {
    console.log(error);
  }
});

/**
 * User register page
 */
router.get("/user_register", async (req, res) => {
  try {
    const locals = {
      title: "User Register",
      description: "New Management System Project",
      webPage: "login",
    };
    res.render("register", { locals });
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST/
 * User - signUp
 */
router.post("/signUp", async (req, res) => {
  try {
    const locals = {
      title: "User Register",
      description: "New Management System Project",
      webPage: "login",
    };
    const errs = {
      page: "exitsuser",
    };
    const { username, email, password, confirmPassword } = req.body;
    const hashedPassword = await bcrypt.hash(confirmPassword, 10);
    try {
      const user = await Subscriber.create({
        username,
        email,
        password: hashedPassword,
      });
      // res.status(201).json({ message: "User Created", user });
      res.render("accCreated", { locals });
    } catch (error) {
      if (error.code === 11000) {
        // res.status(409).json({ message: "User already in use" });
        res.render("error1", { locals, errs });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
});

/**
 * User Login check
 */
// let userName = "";
router.post("/signIn", async (req, res) => {
  try {
    const locals = {
      title: "User Login",
      description: "New Management System Project",
      webPage: "login",
    };
    const errs = {
      page: "invalid",
    };
    const { email, password } = req.body;
    // console.log(req.body);
    const subscriber = await Subscriber.findOne({ email });
    if (!subscriber) {
      return res.render("error1", { locals, errs });
    }
    const isPasswordValid = await bcrypt.compare(password, subscriber.password);
    if (!isPasswordValid) {
      return res.render("error1", { locals, errs });
    }
    const token = jwt.sign(
      { userID: subscriber._id, userName: subscriber.username },
      jwtSecret
    );
    res.cookie("token", token, { httpOnly: true });
    // userName = subscriber.username;
    res.redirect("/homePage");
  } catch (error) {
    console.log(error);
  }
});

/**
 * Home
 */
router.get("/homePage", async (req, res) => {
  try {
    const locals = {
      title: "User Register",
      description: "New Management System Project",
      webPage: "home",
    };
    // console.log(req.cookies.token);
    // const decoded = jwt.verify(req.cookies.token, jwtSecret);
    // req.userId = decoded.userID;
    // console.log(decoded.userName);
    // const name = {
    //   user_name: decoded.userName,
    // };

    const data = await Article.find();
    const posts = await Post.find();
    const posts_data = posts.reverse();
    const post_3 = posts_data.map((ele, ind) => {
      if (ind <= 4) {
        return ele;
      }
      return null;
    });
    res.render("home", { locals, data, post_3 });
  } catch (error) {
    console.log(error);
  }
});

/**
 * Forgot password
 */
router.get("/forgot", async (req, res) => {
  try {
    const locals = {
      title: "User Login",
      description: "New Management System Project",
      webPage: "login",
    };
    res.render("forgot", { locals });
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET/
 * User - logout
 */
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  // res.json({ message: "Logout successfull" });
  res.redirect("/login");
});

module.exports = router;
