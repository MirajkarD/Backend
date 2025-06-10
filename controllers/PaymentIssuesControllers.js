const PaymentIssues = require("../models/PaymentIssues");

const getPaymentIssues = async (req, res) => {
  try {
    const issues = await Payment.find({ status: "failed" });
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment issues", error });
  }
};

module.exports = { getPaymentIssues };
