const express = require("express");
const router = express.Router();
const userValidate = require("../../../validates/user/user.validate");
const controller = require("../controllers/user.controller");

router.post(
  "/register",
  userValidate.validateRegisterUser,
  controller.register
);
router.post("/auth/:userId", controller.auth);
router.post("/login", userValidate.validateLogin, controller.login);
router.post(
  "/password/forgot",
  userValidate.validateForgotPassword,
  controller.forgotPassword
);
router.post(
  "/password/otp",
  userValidate.validateOtpPassword,
  controller.otpPassword
);
module.exports = router;
