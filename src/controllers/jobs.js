const { Router } = require("express");
const { Op, Transaction } = require("sequelize");
const { getProfile } = require("../middleware/getProfile");
const router = Router();

router.get("/jobs/unpaid", getProfile, async (req, res) => {
  const { Job, Contract } = req.app.get("models");
  const jobs = await Job.findAll({
    where: { paid: false },
    include: [
      {
        model: Contract,
        where: {
          [Op.or]: [
            { ContractorId: req.profile.id },
            { ClientId: req.profile.id },
          ],
          status: "in_progress",
        },
      },
    ],
  });

  res.json(jobs);
});

router.post("/jobs/:job_id/pay", getProfile, async (req, res) => {
  const { Job, Contract } = req.app.get("models");
  const sequelize = req.app.get("sequelize");
  const { job_id } = req.params;

  await sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
    async (t) => {
      const job = await Job.findOne({
        where: { id: job_id },
        include: [
          {
            model: Contract,
            where: {
              [Op.or]: [
                { ContractorId: req.profile.id },
                { ClientId: req.profile.id },
              ],
              status: "in_progress",
            },
            include: [
              {
                association: "Contractor",
              },
              {
                association: "Client",
                where: { balance: { [Op.gte]: sequelize.col("Job.price") } },
              },
            ],
          },
        ],
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (job) {
        job.Contract.Client.balance -= job.price;
        job.Contract.Contractor.balance += job.price;
        job.paid = true;
        await job.Contract.Client.save({ transaction: t });
        await job.Contract.Contractor.save({ transaction: t });
        await job.save({ transaction: t });
        res.status(200).send();
      } else {
        res.status(422).send();
      }
    }
  );
});

module.exports = {
  jobs: router,
};
