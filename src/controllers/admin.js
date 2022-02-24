const { Router } = require("express");
const { Op } = require("sequelize");
const { getProfile } = require("../middleware/getProfile");
const router = Router();

router.get("/admin/best-profession", async (req, res) => {
  const { Job, Contract } = req.app.get("models");
  const sequelize = req.app.get("sequelize");
  const { start, end } = req.query;
  if (!isQueryParamValid(start, end)) {
    res.status(400).json({ msg: "start and end query params are not valid." });
    return;
  }
  const jobs = await Job.findAll({
    where: {
      paid: true,
      [Op.and]: [
        sequelize.where(
          sequelize.fn("date", sequelize.col("Job.updatedAt")),
          ">=",
          new Date(start)
        ),
        sequelize.where(
          sequelize.fn("date", sequelize.col("Job.updatedAt")),
          "<=",
          new Date(end)
        ),
      ],
    },
    attributes: [
      "Contract.ContractorId",
      [sequelize.fn("sum", sequelize.col("price")), "total"],
    ],
    include: [
      {
        model: Contract,
        include: [{ association: "Contractor" }, { association: "Client" }],
      },
    ],
    group: ["Contract.ContractorId"],
    order: sequelize.literal("total DESC"),
    limit: 1,
  });
  if (jobs.length) {
    res.json({ ContactorId: jobs[0].Contract.Contractor.id });
  } else {
    res.json({ ContactorId: null });
  }
});

router.get("/admin/best-clients", async (req, res) => {
  const { Job, Contract } = req.app.get("models");
  const sequelize = req.app.get("sequelize");
  const { start, end } = req.query;
  if (!isQueryParamValid(start, end)) {
    res.status(400).json({ msg: "start and end query params are not valid." });
    return;
  }
  const jobs = await Job.findAll({
    where: {
      paid: true,
      [Op.and]: [
        sequelize.where(
          sequelize.fn("date", sequelize.col("Job.updatedAt")),
          ">=",
          new Date(start)
        ),
        sequelize.where(
          sequelize.fn("date", sequelize.col("Job.updatedAt")),
          "<=",
          new Date(end)
        ),
      ],
    },
    attributes: [
      "Contract.ClientId",
      [sequelize.fn("sum", sequelize.col("price")), "total"],
    ],
    include: [
      {
        model: Contract,
        include: [{ association: "Contractor" }, { association: "Client" }],
      },
    ],
    group: ["Contract.ClientId"],
    order: sequelize.literal("total DESC"),
  });
  if (jobs.length) {
    res.json({ ClientIds: jobs.map((job) => job.Contract.Client.id) });
  } else {
    res.json({ ClientIds: [] });
  }
});

module.exports = {
  admin: router,
};

function isQueryParamValid(start, end) {
  if (!isValidDate(start) || !isValidDate(end)) {
    return false;
  }
  return true;
}

const isValidDate = function (date) {
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
  if (!dateRegex.test(date)) {
    return false;
  }
  return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
};
