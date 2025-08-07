const User = require("../models/user.model");
const Otp = require("../models/otp.model");
const md5 = require("md5");
const sendOtp = require("../../../helpers/otpGenerator");
module.exports.register = async (req, res) => {
  try {
    const user = {
      fullName: req.body.fullName,
      email: req.body.email,
      password: md5(req.body.password),
    };
    const userSave = new User(user);
    await userSave.save();
    const subject = "Mã xác thực đăng ký tài khoản";
    await sendOtp.generateAndSendOtp(userSave, subject);
    res.cookie("userId", userSave.id);
    return res.json({
      code: 200,
      message: "Tạo tài khoản thành công",
      userId: userSave.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.auth = async (req, res) => {
  try {
    const userId = req.params.userId;
    const otpRequest = req.body.otp;

    const otpRecord = await Otp.findOne({ userId }).select("code expireAt");

    if (!otpRecord) {
      return res
        .status(400)
        .json({ message: "OTP không tồn tại hoặc đã hết hạn" });
    }

    if (otpRecord.expireAt < new Date()) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });
    }

    if (otpRecord.code !== otpRequest) {
      return res.status(400).json({ message: "Mã OTP không chính xác" });
    }

    // Cập nhật trạng thái user
    const user = await User.findByIdAndUpdate(
      userId,
      { status: "active" },
      { new: true }
    );

    // Xoá OTP sau khi dùng
    await Otp.deleteMany({ userId });
    res.cookie("tokenUser", user.tokenUser);
    return res.json({
      code: 200,
      message: "Xác thực thành công",
      userToken: user.tokenUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports.login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({
      email: email,
    }).select("tokenUser password");
    if (md5(password) != user.password) {
      return res.json({
        code: 400,
        message: "Sai mật khẩu hoặc tài khoản",
      });
    } else {
      res.cookie("tokenUser", user.tokenUser);
      return res.json({
        code: 200,
        message: "Đăng nhập thành công",
        userToken: user.tokenUser,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({
      email: email,
    }).select("id");
    const subject = "Mã xác thực quên mật khẩu";
    await sendOtp.generateAndSendOtp(user.id, subject, email);
    return res.json({
      code: 200,
      message: "Lấy mã xác thực quên mật khẩu thành công",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports.otpPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const otpRequest = req.body.otp;
    const otpRecord = await Otp.findOne({ email }).select(
      "code expireAt userId"
    );

    if (!otpRecord) {
      return res
        .status(400)
        .json({ message: "OTP không tồn tại hoặc đã hết hạn" });
    }

    if (otpRecord.expireAt < new Date()) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });
    }

    if (otpRecord.code !== otpRequest) {
      return res.status(400).json({ message: "Mã OTP không chính xác" });
    }
    // Xoá OTP sau khi dùng
    await Otp.deleteMany({ email });
    res.cookie("userId", otpRecord.userId);
    return res.json({
      code: 200,
      message: "Xác thực thành công",
      userId: otpRecord.userId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports.resetPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const userRecord = await User.findOne({
      _id: userId,
      deleted: false,
      status: "active",
    }).select("password tokenUser");
    if (md5(password) == userRecord.password) {
      return res.json({
        code: 400,
        message: "Mật khẩu này đã được dùng gần đây",
      });
    }
    await userRecord.updateOne({ password: md5(password) });
    res.cookie("tokenUser", userRecord.tokenUser);
    return res.json({
      code: 200,
      message: "Đổi mật khẩu thành công",
      tokenUser: userRecord.tokenUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
