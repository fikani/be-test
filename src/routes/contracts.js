const { Router } = require("express");
const { Op } = require("sequelize");
const { getProfile } = require("../middleware/getProfile");
const router = Router();

/**
 * FIX ME!
 * @returns contract by id
 */
router.get("/contracts/:id", getProfile, async (req, res) => {
  const { Contract } = req.app.get("models");
  const { id } = req.params;
  const contract = await Contract.findOne({
    where: {
      id,
      [Op.or]: [{ ContractorId: req.profile.id }, { ClientId: req.profile.id }],
    },
  });
  if (!contract) return res.status(404).end();
  res.json(contract);
});

router.get("/contracts", getProfile, async (req, res) => {
  const { Contract } = req.app.get("models");
  const contracts = await Contract.findAll({
    where: {
      status: "terminated",
      [Op.or]: [{ ContractorId: req.profile.id }, { ClientId: req.profile.id }],
    },
  });
  res.json(contracts);
});

module.exports = {
  contracts: router,
};
