const express = require("express");
const router = express.Router();
const taskValidate = require("../../../validates/user/task.validate");
const controller = require("../controllers/task.controller");

router.get("/", controller.index);

router.get("/detail/:id", controller.detail);

router.patch("/change-status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

router.post("/create", taskValidate.validateCreateTask, controller.create);

router.patch("/tasks/edit/:id", taskValidate.validateEditTask, controller.edit);

router.delete("/tasks/delete/:id", controller.delete);

module.exports = router;
