const Sequelize = require("sequelize");

let sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite3",
});

function setSequelize(instance) {
  sequelize = instance;
}
function getSequelize() {
  if (!sequelize) {
    sequilize = new Sequelize({
      dialect: "sqlite",
      storage: "./database.sqlite3",
    });
  }

  return sequelize;
}

module.exports = {
  getSequelize,
  setSequelize,
};
