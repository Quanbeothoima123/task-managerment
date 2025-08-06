const User = require("../../api/v1/models/user.model");
module.exports.validateRegisterUser = async (req, res, next) => {
  const { fullName, email, password } = req.body;
  let errors = [];

  // Validate fullName
  if (!fullName || fullName.trim() === "") {
    errors.push({
      field: "fullName",
      message: "Vui lòng nhập họ tên",
    });
  }

  // Validate email
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!email || email.trim() === "") {
    errors.push({
      field: "email",
      message: "Vui lòng nhập email",
    });
  } else if (!emailRegex.test(email)) {
    errors.push({
      field: "email",
      message: "Email không hợp lệ",
    });
  } else {
    // Kiểm tra tồn tại email (nếu định dạng đúng)
    const isExist = await User.findOne({ email: email });
    if (isExist) {
      errors.push({
        field: "email",
        message: "Email đã tồn tại trên hệ thống",
      });
    }
  }

  // Validate password
  if (!password || password.trim() === "") {
    errors.push({
      field: "password",
      message: "Vui lòng nhập mật khẩu",
    });
  } else if (password.length < 6) {
    errors.push({
      field: "password",
      message: "Mật khẩu phải có ít nhất 6 ký tự",
    });
  }

  // Nếu có lỗi
  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: "Dữ liệu đăng ký không hợp lệ",
      errors,
    });
  }

  // Nếu không có lỗi → tiếp tục
  next();
};

module.exports.validateLogin = async (req, res, next) => {
  const { email } = req.body;
  let errors = [];
  // Validate email
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!email || email.trim() === "") {
    errors.push({
      field: "email",
      message: "Vui lòng nhập email",
    });
  } else if (!emailRegex.test(email)) {
    errors.push({
      field: "email",
      message: "Email không hợp lệ",
    });
  } else {
    // Kiểm tra tồn tại email (nếu định dạng đúng)
    const isExist = await User.findOne({
      email: email,
      deleted: false,
      status: "active",
    });
    if (!isExist) {
      errors.push({
        field: "email",
        message: "Email không tồn tại trên hệ thống hoặc đã bị khóa",
      });
    }
  }
  // Nếu có lỗi
  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      message: "Dữ liệu đăng ký không hợp lệ",
      errors,
    });
  }

  // Nếu không có lỗi → tiếp tục
  next();
};
