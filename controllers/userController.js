// controllers/userController.ts
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { getTransporter } = require("../services/mailer");
const { generateOTP } = require("../services/userService");
const knex = global.knex;

const FRONTEND_BASE = process.env.FRONTEND_BASE || "http://localhost:3000";

/* ============================================================
   CREATE USER + SEND INVITE EMAIL
============================================================ */
async function createUsers(req, res) {
  try {
    const { firstName, lastName, email, roleId } = req.body;

    if (!firstName || !lastName || !email || !roleId) {
      return res.status(400).json({
        status: false,
        data: "Missing required fields",
      });
    }

    // Check if user exists
    const existing = await knex("users").where({ email }).first();
    if (existing) {
      return res.status(400).json({
        status: false,
        data: "User with that email already exists.",
      });
    }

    // Generate token for password setup
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await knex("users").insert({
      firstName,
      lastName,
      email,
      roleId,
      password: "", // Empty string instead of NULL
      resetToken: token,
      resetTokenExpiry: expiry,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const link = `${FRONTEND_BASE}/set-password?token=${token}`;

    // Send invitation email
    const mailer = getTransporter();
    try {
      await mailer.sendMail({
        from:
          process.env.SMTP_FROM ||
          process.env.EMAIL_USER ||
          "no-reply@example.com",
        to: email,
        subject: "Set up your Vehicle Exemption System password",
        html: `
          <p>Hello ${firstName},</p>
          <p>An account was created for you. Click below to set your password:</p>
          <p><a href="${link}">${link}</a></p>
          <p>This link is valid for 24 hours.</p>
        `,
      });
      console.log(`Email sent successfully to ${email}`);
    } catch (mailErr) {
      console.error("Email sending error:", mailErr.message);
      // Don't fail user creation if email fails - user can retry
    }

    return res.status(201).json({
      status: true,
      data: process.env.APP_ENV === "development" ? { link } : "User created.",
    });
  } catch (err) {
    console.error("createUsers error:", err);
    return res
      .status(500)
      .json({ status: false, data: "Internal server error" });
  }
}

/* ============================================================
   SET PASSWORD WITH TOKEN
============================================================ */
async function setPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        status: false,
        data: "Token and new password required.",
      });
    }

    const user = await knex("users")
      .where("resetToken", token)
      .andWhere("resetTokenExpiry", ">", new Date())
      .first();

    if (!user) {
      return res.status(400).json({
        status: false,
        data: "Invalid or expired token.",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await knex("users").where({ id: user.id }).update({
      password: hashed,
      resetToken: null,
      resetTokenExpiry: null,
      updatedAt: new Date(),
    });

    return res.status(200).json({
      status: true,
      data: "Password set successfully.",
    });
  } catch (err) {
    console.error("setPassword error:", err);
    return res
      .status(500)
      .json({ status: false, data: "Internal server error" });
  }
}

/* ============================================================
   GET ALL USERS
============================================================ */
async function getUsers(req, res) {
  try {
    const users = await knex("Users as u")
      .leftJoin("Roles as r", "u.roleId", "r.id")
      .select(
        "u.id as userId",
        "u.firstName",
        "u.lastName",
        "u.email",
        "u.roleId",
        "r.roleName",
        knex.raw(
          "CASE WHEN u.password IS NULL OR u.password = '' THEN 0 ELSE 1 END AS passwordSet"
        )
      );

    return res.status(200).json({ status: true, data: users });
  } catch (err) {
    console.error("getUsers error:", err);
    return res
      .status(500)
      .json({ status: false, data: "Internal server error" });
  }
}

/* ============================================================
   DELETE USER
============================================================ */
async function deleteUsers(req, res) {
  try {
    const { userId } = req.body;
    if (!userId)
      return res.status(400).json({ status: false, data: "userId required" });

    await knex("users").where({ id: userId }).del();

    return res.status(200).json({
      status: true,
      data: "User deleted successfully",
    });
  } catch (err) {
    console.error("deleteUsers error:", err);
    return res
      .status(500)
      .json({ status: false, data: "Internal server error" });
  }
}

/* ============================================================
   UPDATE USER
============================================================ */
async function updateUsers(req, res) {
  try {
    const { userId, firstName, lastName, email, roleId, password } = req.body;

    if (!userId)
      return res
        .status(400)
        .json({ status: false, data: "userId is required" });

    const updateObj = {
      firstName,
      lastName,
      email,
      roleId,
      updatedAt: new Date(),
    };

    if (password) updateObj.password = await bcrypt.hash(password, 10);

    await knex("users").where({ id: userId }).update(updateObj);

    return res.status(200).json({
      status: true,
      data: "User updated successfully",
    });
  } catch (err) {
    console.error("updateUsers error:", err);
    return res
      .status(500)
      .json({ status: false, data: "Internal server error" });
  }
}

/* ============================================================
   RESET PASSWORD
============================================================ */
async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return res.status(400).json({
        status: false,
        data: "Email and password are required.",
      });

    const user = await knex("users").where({ email }).first();
    if (!user)
      return res.status(404).json({ status: false, data: "User not found." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await knex("users").where({ id: user.id }).update({
      password: hashed,
      updatedAt: new Date(),
    });

    return res.status(200).json({
      status: true,
      data: "Password reset successfully.",
    });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res
      .status(500)
      .json({ status: false, data: "Internal server error" });
  }
}

/* ============================================================
   CHANGE PASSWORD (LOGGED IN USER)
============================================================ */
async function changePassword(req, res) {
  try {
    const { oldpassword, newpassword } = req.body;
    const userId = req.userId;

    if (!userId)
      return res.status(401).json({ status: false, data: "Unauthorized" });

    const user = await knex("users").where({ id: userId }).first();
    if (!user)
      return res.status(404).json({ status: false, data: "User not found" });

    const valid = await bcrypt.compare(oldpassword, user.password);
    if (!valid)
      return res.status(401).json({
        status: false,
        data: "Incorrect old password.",
      });

    const hashed = await bcrypt.hash(newpassword, 10);
    await knex("users")
      .where({ id: userId })
      .update({ password: hashed, updatedAt: new Date() });

    return res.status(200).json({
      status: true,
      data: "Password changed successfully.",
    });
  } catch (err) {
    console.error("changePassword error:", err);
    return res
      .status(500)
      .json({ status: false, data: "Internal server error" });
  }
}

module.exports = {
  createUsers,
  setPassword,
  getUsers,
  deleteUsers,
  updateUsers,
  resetPassword,
  changePassword,
};
