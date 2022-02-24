const Sequelize = require("sequelize");
const fs = require("fs");
const { setSequelize, getSequelize } = require("../src/sequelize.config");
setSequelize(new Sequelize("sqlite::memory:", { logging: false }));

beforeEach(async () => {
  jest.setTimeout(100000);
  await getSequelize().sync({ force: true });
});
