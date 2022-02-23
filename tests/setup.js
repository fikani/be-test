const Sequelize = require("sequelize");
const { setSequelize, getSequelize } = require("../src/sequelize.config");
setSequelize(
  new Sequelize({
    dialect: "sqlite",
    storage: "./tests/test.sqlite3",
    logging: false,
  })
);

beforeEach(async () => {
  await getSequelize().sync({ force: true });
});
