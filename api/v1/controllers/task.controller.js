const Task = require("../models/task.model");
const Status = require("../models/status.model");
const paginationHelper = require("../../../helpers/pagination");
const searchHelper = require("../../../helpers/search");
const mongoose = require("mongoose");
module.exports.index = async (req, res) => {
  try {
    //  Lọc theo trạng thái
    let find = { deleted: false };
    if (req.query.status) {
      find.status = req.query.status;
    }
    // Tìm kiếm bằng keyword
    const objectSearch = searchHelper(req.query);
    if (req.query.keyword) {
      find.title = objectSearch.regex;
    }
    // Phân trang
    const countTasks = await Task.countDocuments(find);
    let objectPagination = paginationHelper(
      {
        currentPage: 1,
        limitItems: 2,
      },
      req.query,
      countTasks
    );
    // Sắp xếp theo theo tiêu chí
    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    }
    const taskRecord = await Task.find(find)
      .sort(sort)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);
    //  Phải dùng một mảng rồi push lại mới được vì taskRecord đang là một doc , mà một doc thì không thế dùng chèn kiểu javascript thuần được
    const result = [];

    for (const item of taskRecord) {
      const status = await Status.findOne({ _id: item.status, deleted: false });

      const plainItem = item.toObject(); // CHUYỂN sang object thường
      plainItem.statusName = status?.name || "Không xác định";

      result.push(plainItem);
    }

    res.json(result);
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
  const idTask = req.params.id;
  const statusId = req.body.status;
  try {
    const checkStatusValidate = await Status.findOne({ _id: statusId });
    const checkTaskValidate = await Task.findOne({ _id: idTask });

    if (checkStatusValidate && checkTaskValidate) {
      await Task.updateOne({ _id: idTask }, { status: statusId });

      return res.json({
        code: 200,
        message: "Cập nhật thành công trạng thái của task",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Không tồn tại trạng thái hoặc task này!" });
  }
};

module.exports.changeMulti = async (req, res) => {
  const ids = req.body.ids;
  const key = req.body.key;
  const value = req.body.value;

  console.log("Nhận yêu cầu:", { ids, key, value });

  // Kiểm tra đầu vào hợp lệ
  if (!Array.isArray(ids) || ids.length === 0 || !key) {
    return res.status(400).json({ message: "Dữ liệu đầu vào không hợp lệ" });
  }

  // Kiểm tra ObjectId hợp lệ
  const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length === 0) {
    return res.status(400).json({ message: "Tất cả ID đều không hợp lệ" });
  }

  try {
    switch (key) {
      case "status": {
        // Kiểm tra status hợp lệ
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return res.status(400).json({ message: "Status ID không hợp lệ" });
        }

        const checkStatus = await Status.findOne({
          _id: value,
          deleted: false,
        });

        if (!checkStatus) {
          return res
            .status(404)
            .json({ message: "Trạng thái không tồn tại trong hệ thống" });
        }

        await Task.updateMany({ _id: { $in: validIds } }, { status: value });

        return res.json({
          code: 200,
          message: "Cập nhật trạng thái thành công",
        });
      }

      case "deleted": {
        // Cập nhật trạng thái deleted (giả sử value là true/false)
        const deletedValue = value === true || value === "true";

        await Task.updateMany(
          { _id: { $in: validIds } },
          { deleted: deletedValue }
        );

        return res.json({
          code: 200,
          message: `Cập nhật deleted=${deletedValue} thành công`,
        });
      }

      default:
        return res.status(400).json({
          message: `Không hỗ trợ cập nhật với key '${key}'`,
        });
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật nhiều Task:", error);
    return res.status(500).json({
      message: "Đã có lỗi xảy ra từ server",
    });
  }
};

module.exports.create = async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    return res.status(201).json({
      success: true,
      message: "Tạo task mới thành công!",
      data: task,
    });
  } catch (error) {
    console.error(error); // Log nếu cần debug
    return res.status(500).json({
      success: false,
      message: "Tạo task mới thất bại!",
    });
  }
};

module.exports.edit = async (req, res) => {
  try {
    const account_id = req.body.account_id;
    const updatedBy = {
      account_id: account_id,
      updatedAt: new Date(),
    };

    const taskId = req.params.id;
    await Task.updateOne(
      {
        _id: taskId,
        deleted: false,
      },
      {
        ...req.body,
        $push: { updatedBy: updatedBy },
      }
    );
    return res.status(201).json({
      success: true,
      message: "Cập nhật task thành công!",
    });
  } catch (error) {
    console.error(error); // Log nếu cần debug
    return res.status(500).json({
      success: false,
      message: "Cập nhật thất bại!",
    });
  }
};

module.exports.delete = async (req, res) => {
  try {
    const account_id = req.body.account_id;
    console.log(account_id);
    const deletedBy = {
      account_id: account_id,
      deletedAt: new Date(),
    };
    const taskId = req.params.id;
    await Task.updateOne(
      {
        _id: taskId,
      },
      {
        deleted: true,
        deletedBy: deletedBy,
      }
    );
    return res.status(201).json({
      success: true,
      message: "Xóa thành công task!",
    });
  } catch (error) {
    console.error(error); // Log nếu cần debug
    return res.status(500).json({
      success: false,
      message: "Lỗi không tồn tại task!",
    });
  }
};
