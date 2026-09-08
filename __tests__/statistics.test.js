import { oecdTaxWedge2025 } from "../constants/statistics";

describe("OECD tax wedge statistics", () => {
  test("keeps the headline Greece comparison internally consistent", () => {
    expect(oecdTaxWedge2025.greece.total).toBe(39.3);
    expect(oecdTaxWedge2025.oecd.total).toBe(35.1);
    expect(
      Number(
        (oecdTaxWedge2025.greece.total - oecdTaxWedge2025.oecd.total).toFixed(1),
      ),
    ).toBe(4.2);
  });

  test("labels all published examples as standardized household profiles", () => {
    expect(oecdTaxWedge2025.householdProfiles).toHaveLength(3);
    oecdTaxWedge2025.householdProfiles.forEach((profile) => {
      expect(profile.title).toBeTruthy();
      expect(profile.description).toBeTruthy();
      expect(profile.greece).toBeGreaterThan(0);
      expect(profile.oecd).toBeGreaterThan(0);
    });
  });
});
