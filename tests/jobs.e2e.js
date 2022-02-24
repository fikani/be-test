const supertest = require("supertest");
const app = require("../src/app");
const { Profile, Contract, Job } = require("../src/model");

describe("Jobs", () => {
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
      terms: "terminated",
      status: "terminated",
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
      price: 200,
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

  describe("GET:/jobs/unpaid", () => {
    it("should get empty array when job does not exist", async () => {
      const res = await supertest(app)
        .get("/jobs/unpaid")
        .set({ profile_id: 3 });
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("should get only jobs that are not paid and contract in progress for that client", async () => {
      const res = await supertest(app)
        .get("/jobs/unpaid")
        .set({ profile_id: 1 });
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body).toEqual([
        expect.objectContaining({
          id: 4,
          description: "not paid",
          price: 200,
          ContractId: 2,
          paid: false,
        }),
      ]);
    });

    it("should get only jobs that are not paid and contract in progress for that contractor", async () => {
      const res = await supertest(app)
        .get("/jobs/unpaid")
        .set({ profile_id: 2 });
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body).toEqual([
        expect.objectContaining({
          id: 4,
          description: "not paid",
          price: 200,
          ContractId: 2,
          paid: false,
        }),
      ]);
    });
  });

  describe("POST:/jobs/:job_id/pay", () => {
    it("should pay job if client has balance", async () => {
      const jobBefore = await Job.findByPk(4, {
        include: [
          {
            association: "Contract",
            include: [{ association: "Client" }, { association: "Contractor" }],
          },
        ],
      });

      const res = await supertest(app)
        .post("/jobs/4/pay")
        .set({ profile_id: 1 });
      expect(res.status).toBe(200);

      const jobAfter = await Job.findByPk(4, {
        include: [
          {
            association: "Contract",
            include: [{ association: "Client" }, { association: "Contractor" }],
          },
        ],
      });
      expect(jobBefore.paid).toBe(false);

      expect(jobAfter.paid).toBe(true);
      expect(jobAfter.Contract.Client.balance).toBe(
        jobBefore.Contract.Client.balance - jobAfter.price
      );
      expect(jobAfter.Contract.Contractor.balance).toBe(
        jobBefore.Contract.Contractor.balance + jobAfter.price
      );
    });

    it("should not pay job if client has not enough balance", async () => {
      const jobBefore = await Job.findByPk(4);
      jobBefore.price = 2000;
      await jobBefore.save();

      const res = await supertest(app)
        .post("/jobs/4/pay")
        .set({ profile_id: 1 });
      expect(res.status).toBe(422);
    });
  });
});
