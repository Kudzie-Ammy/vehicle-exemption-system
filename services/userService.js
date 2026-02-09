"use strict";
const jwt = require("jsonwebtoken");
const rn = require("random-number");

const getUserByLogin = async (email) => {
  const users = await knex("users")
    .select(["*"])
    .where({ email })
    .catch((ex) => {
      console.log(ex);
      return [];
    });

  return users;
};

const getPAUserByPhone = async (phone, password) => {
  const users = await knex("park_assist_users")
    .select([
      "id",
      "phoneNumber",
      "fullName",
      "otp",
      "isVerified",
      "defaultVehicle",
    ])
    .where({ phoneNumber: phone, password: password })
    .catch((ex) => {
      console.log(ex);
      return [];
    });

  return users;
};

const getToken = async (user) => {
  try {
    const token = await jwt.sign(
      JSON.parse(JSON.stringify(user)),
      process.env.jwt_secret,
      {
        expiresIn: "750 hours",
      }
    );

    return token;
  } catch (ex) {
    console.log(ex);
    return null;
  }
};

const generateOTP = async () => {
  const gen = rn.generator({
    min: 1000000,
    max: 9999999,
    integer: true,
  });

  const otp = await gen();

  return `${otp}`;
};

module.exports = {
  getUserByLogin,
  getToken,
  generateOTP,
  getPAUserByPhone,
};
