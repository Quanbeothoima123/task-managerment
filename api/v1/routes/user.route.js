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
module.exports = router;
