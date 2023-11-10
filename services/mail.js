import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "haiquytruong@gmail.com",
    pass: process.env.APPLICATION_PASSWORD,
  },
});

export async function sendMail({ name, content, email }) {
  const mailOptions = {
    from: "haiquytruong@gmail.com",
    to: "haitruong.tech@gmail.com",
    subject: `${name} wants to contact`,
    text: `${content}\nFrom: ${email},\n${name}`,
  };

  return new Promise((resolve, reject) =>
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.log(error);
        return reject("Send mail failed");
      }
      console.log("Email sent: " + JSON.stringify(info, null, 2));
      return resolve("Email sent successfully");
    })
  );
}
