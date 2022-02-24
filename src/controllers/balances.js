const { Router } = require("express");
const { Profile } = require("../model");
const router = Router();

router.post("/balances/deposit/:userId", async (req, res) => {
  const { Job, Contract } = req.app.get("models");
  const { userId } = req.params;
  const { value } = req.body;

  if (!value || value < 0) {
    res.status(400).json({ msg: "invalid value." });
    return;
  }

  const sequelize = req.app.get("sequelize");
  const jobs = await Job.findOne({
    attributes: [[sequelize.fn("sum", sequelize.col("price")), "total"]],
    where: { paid: false },
    include: [
      {
        model: Contract,
        where: {
          ClientId: userId,
          status: "in_progress",
        },
      },
    ],
  });

  const total = (jobs && jobs.get("total")) || 0;
  if (value <= 0.25 * total) {
    Profile.update(
      { balance: sequelize.literal("balance + " + value) },
      { where: { id: userId } }
    );
    res.send();
  } else {
    res.status(412).json({ msg: "Value is to high." });
  }
});

module.exports = {
  balances: router,
};
