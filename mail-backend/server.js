const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── CONFIG ────────────────────────────────────────────
const SENDER_EMAIL = "msuryakarthikeya@gmail.com";
const SENDER_PASS  = "rbrqsmwglblfpqnc"; // Gmail App Password
const NOTIFY_EMAIL = "msuryakarthikeya@gmail.com"; // Where YOU receive submissions
const COMPANY_NAME = "AMICOM Analytics";

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_PASS
  }
});

// ── HEALTH CHECK ──────────────────────────────────────
app.get("/", (req, res) => {
  res.send(`${COMPANY_NAME} mail server running ✅`);
});

// ── SEND MAIL API ─────────────────────────────────────
app.post("/send-mail", async (req, res) => {
  const { name, email1, phone1, message, subject, formType } = req.body;

  console.log(`[${formType || 'contact'}] Received from:`, name, email1);

  if (!name || !email1 || !message) {
    return res.status(400).json({ error: "Missing required fields: name, email1, message" });
  }

  const isCareer = formType === "career";

  try {
    // ── 1. Notification email to YOU ──────────────────
    await transporter.sendMail({
      from: `"${COMPANY_NAME} Website" <${SENDER_EMAIL}>`,
      to: NOTIFY_EMAIL,
      subject: isCareer
        ? `📋 New Career Application – ${name}`
        : `📩 New Contact Inquiry – ${subject || "General"} from ${name}`,
      html: isCareer
        ? `
          <div style="font-family:Arial,sans-serif; max-width:600px; color:#1a1a1a;">
            <div style="background:#254235; padding:20px 30px; border-radius:8px 8px 0 0;">
              <h2 style="color:#c9a84c; margin:0;">${COMPANY_NAME}</h2>
              <p style="color:rgba(255,255,255,0.7); margin:4px 0 0; font-size:13px;">New Career Application</p>
            </div>
            <div style="background:#f9fafb; padding:24px 30px; border:1px solid #e0e0e0; border-radius:0 0 8px 8px;">
              <table style="width:100%; border-collapse:collapse; font-size:14px;">
                <tr><td style="padding:8px 0; color:#666; width:140px;"><strong>Name</strong></td><td>${name}</td></tr>
                <tr><td style="padding:8px 0; color:#666;"><strong>Email</strong></td><td><a href="mailto:${email1}">${email1}</a></td></tr>
                <tr><td style="padding:8px 0; color:#666;"><strong>Phone</strong></td><td>${phone1 || "N/A"}</td></tr>
              </table>
              <hr style="border:none; border-top:1px solid #e0e0e0; margin:16px 0;"/>
              <h4 style="color:#254235; margin:0 0 10px;">Details</h4>
              <p style="white-space:pre-wrap; font-size:14px; line-height:1.7; color:#333;">${message}</p>
            </div>
          </div>`
        : `
          <div style="font-family:Arial,sans-serif; max-width:600px; color:#1a1a1a;">
            <div style="background:#254235; padding:20px 30px; border-radius:8px 8px 0 0;">
              <h2 style="color:#c9a84c; margin:0;">${COMPANY_NAME}</h2>
              <p style="color:rgba(255,255,255,0.7); margin:4px 0 0; font-size:13px;">New Contact Form Submission</p>
            </div>
            <div style="background:#f9fafb; padding:24px 30px; border:1px solid #e0e0e0; border-radius:0 0 8px 8px;">
              <table style="width:100%; border-collapse:collapse; font-size:14px;">
                <tr><td style="padding:8px 0; color:#666; width:140px;"><strong>Name</strong></td><td>${name}</td></tr>
                <tr><td style="padding:8px 0; color:#666;"><strong>Email</strong></td><td><a href="mailto:${email1}">${email1}</a></td></tr>
                <tr><td style="padding:8px 0; color:#666;"><strong>Phone</strong></td><td>${phone1 || "N/A"}</td></tr>
                <tr><td style="padding:8px 0; color:#666;"><strong>Subject</strong></td><td>${subject || "N/A"}</td></tr>
              </table>
              <hr style="border:none; border-top:1px solid #e0e0e0; margin:16px 0;"/>
              <h4 style="color:#254235; margin:0 0 10px;">Message</h4>
              <p style="white-space:pre-wrap; font-size:14px; line-height:1.7; color:#333;">${message}</p>
            </div>
          </div>`
    });

    // ── 2. Auto-reply to USER ─────────────────────────
    await transporter.sendMail({
      from: `"${COMPANY_NAME}" <${SENDER_EMAIL}>`,
      to: email1,
      subject: isCareer
        ? `Application Received – ${COMPANY_NAME}`
        : `Thank you for contacting ${COMPANY_NAME}`,
      html: isCareer
        ? `
          <div style="font-family:Arial,sans-serif; max-width:560px; color:#1a1a1a;">
            <div style="background:#254235; padding:20px 30px; border-radius:8px 8px 0 0;">
              <h2 style="color:#c9a84c; margin:0;">${COMPANY_NAME}</h2>
            </div>
            <div style="padding:28px 30px; border:1px solid #e0e0e0; border-radius:0 0 8px 8px; background:#fff;">
              <p style="font-size:15px;">Hi <strong>${name}</strong>,</p>
              <p style="font-size:14px; line-height:1.75; color:#444;">
                Thank you for applying to <strong>${COMPANY_NAME}</strong>. We have received your application and our HR team will carefully review it.
              </p>
              <p style="font-size:14px; line-height:1.75; color:#444;">
                If your profile matches our current requirements, we will reach out to you to discuss next steps.
              </p>
              <p style="margin-top:24px; font-size:14px; color:#444;">
                Best regards,<br/>
                <strong>HR Team</strong><br/>
                ${COMPANY_NAME} LLP
              </p>
            </div>
          </div>`
        : `
          <div style="font-family:Arial,sans-serif; max-width:560px; color:#1a1a1a;">
            <div style="background:#254235; padding:20px 30px; border-radius:8px 8px 0 0;">
              <h2 style="color:#c9a84c; margin:0;">${COMPANY_NAME}</h2>
            </div>
            <div style="padding:28px 30px; border:1px solid #e0e0e0; border-radius:0 0 8px 8px; background:#fff;">
              <p style="font-size:15px;">Hi <strong>${name}</strong>,</p>
              <p style="font-size:14px; line-height:1.75; color:#444;">
                Thank you for reaching out to <strong>${COMPANY_NAME}</strong>. We have received your inquiry and our team will get back to you within <strong>1–2 business days</strong>.
              </p>
              <p style="font-size:14px; color:#444;"><strong>Your query:</strong> ${subject || "General Inquiry"}</p>
              <p style="margin-top:24px; font-size:14px; color:#444;">
                Best regards,<br/>
                <strong>AMICOM Analytics Team</strong><br/>
                ${COMPANY_NAME} LLP<br/>
                IDA Cherlapally, Hyderabad – 500 051, Telangana, India
              </p>
            </div>
          </div>`
    });

    res.json({ success: true, message: "Emails sent successfully" });

  } catch (error) {
    console.error("Mailer error:", error);
    res.status(500).json({ error: "Email sending failed. Please try again." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ ${COMPANY_NAME} mail server running on port ${PORT}`);
});
