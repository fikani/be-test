const Sequelize = require("sequelize");

let sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite3",
});

function setSequelize(instance) {
  sequelize = instance;
}
function getSequelize() {
  return sequelize;
}

module.exports = {
  getSequelize,
  setSequelize,
};
