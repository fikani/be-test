const supertest = require("supertest");
const app = require("../src/app");
const { Profile, Contract, Job } = require("../src/model");

describe("Admin", () => {
  describe("GET:/admin/best-profession", () => {
    beforeEach(async () => {
      jest.useFakeTimers().setSystemTime(new Date("2020-01-02").getTime());
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
      await Contract.create({
        id: 4,
        terms: "new",
        status: "new",
        ClientId: 1,
        ContractorId: 3,
      });
      await Job.create({
        id: 1,
        description: "not paid",
        price: 155,
        ContractId: 1,
        paid: true,
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
      await Job.create({
        id: 7,
        description: "paid",
        price: 200,
        ContractId: 4,
        paid: true,
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should require query params: start & end", async () => {
      let res = await supertest(app).get("/admin/best-profession");
      expect(res.status).toBe(400);

      res = await supertest(app)
        .get("/admin/best-profession")
        .query({ start: "12", end: "2020-02-02" });
      expect(res.status).toBe(400);

      res = await supertest(app)
        .get("/admin/best-profession")
        .query({ start: "2020-02-02", end: "02" });
      expect(res.status).toBe(400);
    });

    it("should get the most paid contractor", async () => {
      const res = await supertest(app)
        .get("/admin/best-profession")
        .query({ start: "2020-01-01", end: "2020-02-10" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ContactorId: 2 });
    });

    it("should get the best payers", async () => {
      const res = await supertest(app)
        .get("/admin/best-clients")
        .query({ start: "2020-01-01", end: "2020-02-10" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ClientIds: [1] });
    });
  });
});
