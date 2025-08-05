const Status = require("../../api/v1/models/status.model");
const Task = require("../../api/v1/models/task.model");
module.exports.validateCreateTask = async (req, res, next) => {
  const { title, status, content, timeStart, timeFinish, createdBy } = req.body;
  let errors = [];
  let statusList = [
    "6891756913ad616de04c7382",
    "6891756913ad616de04c7383",
    "6891756913ad616de04c7384",
    "6891756913ad616de04c7385",
    "6891756913ad616de04c7386",
  ];
  const validateStatus = statusList.includes(status);
  // Kiểm tra title
  if (!title || title.trim() === "") {
    errors.push({ field: "title", message: "Vui lòng nhập tiêu đề" });
  }

  // Kiểm tra status
  if (!status || !validateStatus) {
    errors.push({ field: "status", message: "Trạng thái không hợp lệ" });
  }

  // Kiểm tra content (optional)
  if (content && typeof content !== "string") {
    errors.push({ field: "content", message: "Nội dung không hợp lệ" });
  }

  // Kiểm tra timeStart (optional)
  if (timeStart && isNaN(Date.parse(timeStart))) {
    errors.push({ field: "timeStart", message: "Ngày bắt đầu không hợp lệ" });
  }

  // Kiểm tra timeFinish (optional)
  if (timeFinish && isNaN(Date.parse(timeFinish))) {
    errors.push({ field: "timeFinish", message: "Ngày kết thúc không hợp lệ" });
  }

  // Kiểm tra timeStart < timeFinish nếu cả 2 đều có
  if (timeStart && timeFinish && new Date(timeStart) > new Date(timeFinish)) {
    errors.push({
      field: "timeRange",
      message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc",
    });
  }

  // Kiểm tra createdBy.account_id
  if (
    !createdBy ||
    !createdBy.account_id ||
    typeof createdBy.account_id !== "string" ||
    createdBy.account_id.trim() === ""
  ) {
    errors.push({
      field: "createdBy.account_id",
      message: "Thông tin người tạo không hợp lệ",
    });
  }

  // Nếu có lỗi → trả về JSON
  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: "Dữ liệu gửi lên không hợp lệ",
      errors,
    });
  }

  // Không có lỗi → tiếp tục
  next();
};

module.exports.validateEditTask = async (req, res, next) => {
  const { title, status, content, timeStart, timeFinish } = req.body;
  let errors = [];

  // Nếu có trường nào → mới kiểm tra
  if (title !== undefined && title.trim() === "") {
    errors.push({ field: "title", message: "Tiêu đề không được để trống" });
  }

  const statusList = [
    "6891756913ad616de04c7382",
    "6891756913ad616de04c7383",
    "6891756913ad616de04c7384",
    "6891756913ad616de04c7385",
    "6891756913ad616de04c7386",
  ];

  if (status !== undefined && !statusList.includes(status)) {
    errors.push({ field: "status", message: "Trạng thái không hợp lệ" });
  }

  if (content !== undefined && typeof content !== "string") {
    errors.push({ field: "content", message: "Nội dung không hợp lệ" });
  }

  if (timeStart !== undefined && isNaN(Date.parse(timeStart))) {
    errors.push({ field: "timeStart", message: "Ngày bắt đầu không hợp lệ" });
  }

  if (timeFinish !== undefined && isNaN(Date.parse(timeFinish))) {
    errors.push({ field: "timeFinish", message: "Ngày kết thúc không hợp lệ" });
  }

  if (
    timeStart !== undefined &&
    timeFinish !== undefined &&
    new Date(timeStart) > new Date(timeFinish)
  ) {
    errors.push({
      field: "timeRange",
      message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc",
    });
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: "Dữ liệu cập nhật không hợp lệ",
      errors,
    });
  }

  next();
};
