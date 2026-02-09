// ===================== IMPORTS =====================
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getUserByLogin, getToken } = require("../services/userService");
const { select } = require("../services/generalDbService");
const { response } = require("../services/utilities");
const userStore = require("./userStore");
const knex = global.knex;

// ===================== LOGIN =====================
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return response(res, "Both Email and Password are required", false);

    // Get user
    const users = await getUserByLogin(email);
    if (!users || users.length === 0)
      return response(res, "Incorrect Email or Password", false);

    const user = users[0];

    // If password not set yet → must set password first
    if (!user.password) {
      return res.status(403).json({
        requirePasswordSetup: true,
        message:
          "You must set your password first. Please check your email invitation.",
      });
    }

    // Validate password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return response(res, "Incorrect Email or Password", false);

    // Generate JWT
    const token = await getToken(user);
    userStore.addUser(user.id, { email });

    return response(res, { token, user, message: "Login Successful" }, true);
  } catch (err) {
    console.error("login error:", err);
    return response(res, "Internal Server Error", false);
  }
}

// ===================== TOKEN CHECK =====================
async function checkToken(req, res, next) {
  // Routes that do NOT need authentication
  const openRoutes = [
    "/login",
    "/resetpassword",
    "/roles",
    "/departments",
    "/addUser",
    "/set-password",
  ];

  if (openRoutes.includes(req.url)) return next();

  // Get token from headers
  let token =
    req.headers["x-access-token"] || req.headers["authorization"] || null;

  if (!token) return response(res, "Auth token is not supplied", false);

  if (token.startsWith("Bearer "))
    token = token.replace("Bearer ", "").replace(/"/g, "");

  jwt.verify(token, process.env.jwt_secret, (err, decoded) => {
    if (err) return response(res, "Token is not valid", false);

    req.userId = decoded.id;
    next();
  });
}

// ===================== VIEW USERS =====================
async function users(req, res) {
  try {
    const Users = await knex("users").select(
      "id",
      "firstName",
      "lastName",
      "email",
      "roleId",
      "createdAt",
      "updatedAt"
    );

    return response(res, Users, true);
  } catch (ex) {
    return response(res, "Internal server error", false);
  }
}

// ===================== ROLES =====================
const roles = async (req, res) => {
  try {
    const result = await select("roles", "*");
    return response(res, result, true);
  } catch (ex) {
    return response(res, "Internal server error", false);
  }
};

// ===================== DEPARTMENTS =====================
const departments = async (req, res) => {
  try {
    const result = await select("departments", "*");
    return response(res, result, true);
  } catch (ex) {
    return response(res, "Internal server error", false);
  }
};

// ===================== RESET PASSWORD (ADMIN FORCED) =====================
async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return res
        .status(400)
        .json({ message: "Email and new password are required." });

    const user = await knex("users").where({ email }).first();
    if (!user) return res.status(404).json({ message: "User not found." });

    const hashed = await bcrypt.hash(newPassword, 10);

    await knex("users")
      .where({ id: user.id })
      .update({ password: hashed, updatedAt: new Date() });

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// ===================== CHANGE PASSWORD (LOGGED IN USER) =====================
async function changePassword(req, res) {
  try {
    const { oldpassword, newpassword } = req.body;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await knex("users").where({ id: userId }).first();
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(oldpassword, user.password);
    if (!valid)
      return res.status(401).json({ message: "Incorrect old password." });

    const hashed = await bcrypt.hash(newpassword, 10);

    await knex("users")
      .where({ id: userId })
      .update({ password: hashed, updatedAt: new Date() });

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("changePassword error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// ===================== DELETE USER =====================
async function deleteUsers(req, res) {
  try {
    const { id } = req.body;

    if (!id) return res.status(400).json({ message: "User ID is required." });

    const deleted = await knex("users").where({ id }).del();

    if (!deleted) return res.status(404).json({ message: "User not found." });

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (ex) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

// ===================== EXPORT =====================
module.exports = {
  login,
  checkToken,
  users,
  roles,
  departments,
  resetPassword,
  changePassword,
  deleteUsers,
};
