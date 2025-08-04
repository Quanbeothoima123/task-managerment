const Task = require("../models/task.model");
module.exports.index = async (req, res) => {
  try {
    //  Lọc theo trạng thái
    let find = { deleted: false };
    if (req.query.status) {
      find.status = req.query.status;
    }
    // Sắp xếp theo theo tiêu chí
    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    }
    const taskRecord = await Task.find(find).sort(sort);
    res.json(taskRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.detail = async (req, res) => {
  try {
    const taskRecord = await Task.findOne({
      _id: req.params.id,
      deleted: false,
    });

    if (!taskRecord) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(taskRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.changeStatus = async (req, res) => {
  const taskRecord = await Task.find({
    deleted: false,
  });
  res.json(taskRecord);
};
