const nodemailer = require('nodemailer');

const isEmailConfigured = () => Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

const getTransporter = () => {
  if (!isEmailConfigured()) {
    throw new Error('Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM in backend environment.');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendMail = async ({ to, subject, text, html, attachments = [] }) => {
  const transporter = getTransporter();
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
    attachments,
  });
};

const sendInvoiceEmail = async (invoice, company = {}, attachments = []) => {
  const email = invoice.customer?.email;
  if (!email) return null;
  const companyName = company.name || 'Pather Khonje';
  const total = Number(invoice.total || 0).toLocaleString('en-IN');
  const due = Number(invoice.dueAmount || 0).toLocaleString('en-IN');
  return sendMail({
    to: email,
    subject: `${companyName} invoice ${invoice.invoiceNumber}`,
    text: `Dear ${invoice.customer?.name || 'Customer'},\n\nYour invoice ${invoice.invoiceNumber} has been created.\nTotal: Rs. ${total}\nDue: Rs. ${due}\n\nThe PDF invoice is attached with this email.\n\n${companyName}`,
    html: `<p>Dear ${invoice.customer?.name || 'Customer'},</p><p>Your invoice <strong>${invoice.invoiceNumber}</strong> has been created.</p><p>Total: <strong>Rs. ${total}</strong><br/>Due: <strong>Rs. ${due}</strong></p><p>The PDF invoice is attached with this email.</p><p>${companyName}</p>`,
    attachments,
  });
};

const sendReceiptEmail = async (invoice, payment, company = {}, attachments = []) => {
  const email = invoice.customer?.email;
  if (!email) return null;
  const companyName = company.name || 'Pather Khonje';
  const amount = Number(payment.amount || 0).toLocaleString('en-IN');
  return sendMail({
    to: email,
    subject: `${companyName} payment receipt ${payment.receiptNumber}`,
    text: `Dear ${invoice.customer?.name || 'Customer'},\n\nWe received Rs. ${amount} against invoice ${invoice.invoiceNumber}.\nReceipt: ${payment.receiptNumber}\nRemaining due: Rs. ${Number(invoice.dueAmount || 0).toLocaleString('en-IN')}\n\n${companyName}`,
    html: `<p>Dear ${invoice.customer?.name || 'Customer'},</p><p>We received <strong>Rs. ${amount}</strong> against invoice <strong>${invoice.invoiceNumber}</strong>.</p><p>Receipt: <strong>${payment.receiptNumber}</strong><br/>Remaining due: <strong>Rs. ${Number(invoice.dueAmount || 0).toLocaleString('en-IN')}</strong></p><p>${companyName}</p>`,
    attachments,
  });
};

module.exports = {
  isEmailConfigured,
  sendMail,
  sendInvoiceEmail,
  sendReceiptEmail,
};
