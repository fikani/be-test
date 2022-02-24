const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");
const { contracts } = require("./controllers/contracts");
const { jobs } = require("./controllers/jobs");
const { balances } = require("./controllers/balances");
const { admin } = require("./controllers/admin");
const app = express();
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

/**
 * FIX ME!
 * @returns contract by id
 */
app.use(contracts);
app.use(jobs);
app.use(balances);
app.use(admin);

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send({});
});
module.exports = app;
