const supertest = require("supertest");
const app = require("../src/app");
const { Profile, Contract } = require("../src/model");

describe("Contracts", () => {
  describe("GET:/contracts/:id", () => {
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
        id: 4,
        firstName: "Not",
        lastName: "Authorized",
        profession: "No",
        balance: 12,
        type: "contractor",
      });
      await Contract.create({
        id: 3,
        terms: "bla bla bla",
        status: "terminated",
        ClientId: 1,
        ContractorId: 2,
      });
    });
    it("should get 404 when contract does not exist", async () => {
      const res = await supertest(app)
        .get("/contracts/5")
        .set({ profile_id: 1 });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({});
    });

    it("should get 404 when user does not have access to contract", async () => {
      const res = await supertest(app)
        .get("/contracts/3")
        .set({ profile_id: 4 });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({});
    });

    it("should fetch contract to both client and contractor", async () => {
      const res = await supertest(app)
        .get("/contracts/3")
        .set({ profile_id: 1 });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          id: 3,
          terms: "bla bla bla",
          status: "terminated",
          ClientId: 1,
          ContractorId: 2,
        })
      );

      const res2 = await supertest(app)
        .get("/contracts/3")
        .set({ profile_id: 2 });
      expect(res2.status).toBe(200);
      expect(res2.body).toEqual(
        expect.objectContaining({
          id: 3,
          terms: "bla bla bla",
          status: "terminated",
          ClientId: 1,
          ContractorId: 2,
        })
      );
    });
  });

  describe("GET:/contracts", () => {
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
        firstName: "Not",
        lastName: "Authorized",
        profession: "No",
        balance: 12,
        type: "contractor",
      });
      await Profile.create({
        id: 4,
        firstName: "Not",
        lastName: "Authorized",
        profession: "No",
        balance: 12,
        type: "contractor",
      });
      await Contract.create({
        id: 1,
        terms: "bla bla bla",
        status: "new",
        ClientId: 1,
        ContractorId: 2,
      });
      await Contract.create({
        id: 2,
        terms: "bla bla bla 2",
        status: "terminated",
        ClientId: 1,
        ContractorId: 2,
      });
      await Contract.create({
        id: 3,
        terms: "bla bla bla 3",
        status: "terminated",
        ClientId: 1,
        ContractorId: 3,
      });
      await Contract.create({
        id: 4,
        terms: "bla bla bla 4",
        status: "terminated",
        ClientId: 2,
        ContractorId: 3,
      });
      await Contract.create({
        id: 5,
        terms: "bla bla bla 5",
        status: "in_progress",
        ClientId: 1,
        ContractorId: 2,
      });
    });

    it("should fetch all terminated contracts of a user as ClientId", async () => {
      const res = await supertest(app).get("/contracts").set({ profile_id: 1 });
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);

      expect(res.body[0].id).toBe(2);
      expect(res.body[0].status).toBe("terminated");

      expect(res.body[1].id).toBe(3);
      expect(res.body[1].status).toBe("terminated");
    });

    it("should fetch all terminated contracts of a user as ContractorId", async () => {
      const res = await supertest(app).get("/contracts").set({ profile_id: 3 });
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);

      expect(res.body[0].id).toBe(3);
      expect(res.body[0].status).toBe("terminated");

      expect(res.body[1].id).toBe(4);
      expect(res.body[1].status).toBe("terminated");
    });

    it("should return empty array if no contract is related to user", async () => {
      const res = await supertest(app).get("/contracts").set({ profile_id: 4 });
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });
});
