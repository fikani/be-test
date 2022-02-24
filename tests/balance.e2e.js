const supertest = require("supertest");
const app = require("../src/app");
const { Profile, Contract, Job } = require("../src/model");

describe("Balance", () => {
  describe("POST:/balances/deposit/:userId", () => {
    beforeEach(async () => {
      await Profile.create({
        id: 1,
        firstName: "Harry",
        lastName: "Potter",
        profession: "Wizard",
        balance: 1150,
        type: "client",
      });
      await Profile.create({
        id: 2,
        firstName: "Mr",
        lastName: "Robot",
        profession: "Hacker",
        balance: 231.11,
        type: "contractor",
      });
      await Profile.create({
        id: 3,
        firstName: "Mr2",
        lastName: "Robot2",
        profession: "Hacker",
        balance: 231.11,
        type: "contractor",
      });
      await Contract.create({
        id: 1,
        terms: "in_progress",
        status: "in_progress",
        ClientId: 1,
        ContractorId: 2,
      });
      await Contract.create({
        id: 2,
        terms: "in_progress",
        status: "in_progress",
        ClientId: 1,
        ContractorId: 2,
      });
      await Contract.create({
        id: 3,
        terms: "new",
        status: "new",
        ClientId: 1,
        ContractorId: 2,
      });
      await Job.create({
        id: 1,
        description: "not paid",
        price: 155,
        ContractId: 1,
        paid: false,
      });
      await Job.create({
        id: 2,
        description: "paid",
        price: 200,
        ContractId: 1,
        paid: true,
      });
      await Job.create({
        id: 3,
        description: "paid 2",
        price: 200,
        ContractId: 2,
        paid: true,
      });
      await Job.create({
        id: 4,
        description: "not paid",
        price: 200,
        ContractId: 2,
        paid: false,
      });
      await Job.create({
        id: 5,
        description: "not paid",
        price: 200,
        ContractId: 3,
        paid: false,
      });
      await Job.create({
        id: 6,
        description: "paid",
        price: 200,
        ContractId: 3,
        paid: true,
      });
    });

    it("should not allow to deposit values greater than 25% of unpaid contracts", async () => {
      const res = await supertest(app)
        .post("/balances/deposit/1")
        .send({ value: 100 });

      expect(res.status).toBe(412);
      expect(res.body).toEqual({ msg: "Value is to high." });
    });

    it("should not allow negative values", async () => {
      const res = await supertest(app)
        .post("/balances/deposit/1")
        .send({ value: -1 });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ msg: "invalid value." });
    });

    it("should allow to deposit valid values", async () => {
      const res = await supertest(app)
        .post("/balances/deposit/1")
        .send({ value: 88.74 });

      expect(res.status).toBe(200);

      const user = await Profile.findByPk(1);

      expect(user.balance).toBe(1238.74);
    });
  });
});
