import nodemailer from "nodemailer";
// Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mahmud18379@gmail.com",
    pass: "cjeziatrpnhquajg",
  },
});

const sendOTP = ({to, subject, html}) => {
  try {
    transporter.sendMail({
      from: "mahmud18379@gmail.com",
      to,
      subject,
      html,
    });
    return {success:true}
  } catch (error) {
   return {success:false}
  }
}

export default sendOTP