const { Router } = require("express");
const { Profile } = require("../model");
const { Transaction } = require("sequelize");
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
  await sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
    async (t) => {
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
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      const total = (jobs && jobs.get("total")) || 0;
      if (value <= 0.25 * total) {
        await Profile.update(
          { balance: sequelize.literal("balance + " + value) },
          { where: { id: userId }, lock: t.LOCK.UPDATE, transaction: t }
        );
        res.send();
      } else {
        res.status(412).json({ msg: "Value is to high." });
      }
    }
  );
});

module.exports = {
  balances: router,
};
