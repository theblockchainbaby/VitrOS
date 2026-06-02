import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TARGET_VESSEL_COUNT = 5100;

// Helper: random integer between min and max (inclusive)
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: random element from array
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: random date within the past N days
function randomDateWithinDays(days: number): Date {
  const now = Date.now();
  return new Date(now - Math.random() * days * 24 * 60 * 60 * 1000);
}

async function main() {
  console.log("=== Rebel Cultures Scale Seed ===\n");

  // ─── FIND ORG ───
  const org = await prisma.organization.findFirst({
    where: { slug: "rebel-cultures" },
  });
  if (!org) throw new Error("Rebel Cultures org not found");
  const orgId = org.id;
  console.log(`Found org: ${org.name} (${orgId})`);

  // ─── CURRENT VESSEL COUNT ───
  const currentCount = await prisma.vessel.count({
    where: { organizationId: orgId },
  });
  console.log(`Current vessel count: ${currentCount}`);

  const vesselsNeeded = TARGET_VESSEL_COUNT - currentCount;
  if (vesselsNeeded <= 0) {
    console.log(`Already at ${currentCount} vessels (target: ${TARGET_VESSEL_COUNT}). Nothing to add.`);
    return;
  }
  console.log(`Need to create ${vesselsNeeded} vessels to reach ${TARGET_VESSEL_COUNT}\n`);

  // ─── FETCH EXISTING DATA ───
  const cultivars = await prisma.cultivar.findMany({
    where: { organizationId: orgId },
  });
  const locations = await prisma.location.findMany({
    where: { site: { organizationId: orgId } },
  });
  const recipes = await prisma.mediaRecipe.findMany({
    where: { organizationId: orgId },
  });
  const users = await prisma.user.findMany({
    where: { organizationId: orgId },
  });

  console.log(`Cultivars: ${cultivars.length}, Locations: ${locations.length}, Recipes: ${recipes.length}, Users: ${users.length}`);

  if (!cultivars.length || !locations.length || !recipes.length || !users.length) {
    throw new Error("Missing required reference data (cultivars, locations, recipes, or users)");
  }

  // ─── FIND MAX BARCODE NUMBER ───
  const maxBarcodeResult = await prisma.vessel.findFirst({
    where: { organizationId: orgId },
    orderBy: { barcode: "desc" },
    select: { barcode: true },
  });
  const maxBarcodeNum = maxBarcodeResult
    ? parseInt(maxBarcodeResult.barcode.replace("RBC-", ""), 10)
    : 0;
  console.log(`Max existing barcode: RBC-${String(maxBarcodeNum).padStart(4, "0")}\n`);

  // ─── STAGE DISTRIBUTION ───
  // initiation 15%, multiplication 35%, rooting 25%, acclimation 15%, hardening 10%
  const stageWeights: { stage: string; weight: number }[] = [
    { stage: "initiation", weight: 0.15 },
    { stage: "multiplication", weight: 0.35 },
    { stage: "rooting", weight: 0.25 },
    { stage: "acclimation", weight: 0.15 },
    { stage: "hardening", weight: 0.10 },
  ];

  function pickStage(): string {
    const r = Math.random();
    let cum = 0;
    for (const sw of stageWeights) {
      cum += sw.weight;
      if (r < cum) return sw.stage;
    }
    return "multiplication";
  }

  // ─── HEALTH DISTRIBUTION ───
  // healthy 75%, stable 15%, critical 5%, slow_growth 5%
  const healthWeights: { health: string; weight: number }[] = [
    { health: "healthy", weight: 0.75 },
    { health: "stable", weight: 0.15 },
    { health: "critical", weight: 0.05 },
    { health: "slow_growth", weight: 0.05 },
  ];

  function pickHealth(): string {
    const r = Math.random();
    let cum = 0;
    for (const hw of healthWeights) {
      cum += hw.weight;
      if (r < cum) return hw.health;
    }
    return "healthy";
  }

  // ─── STATUS DISTRIBUTION ───
  function pickStatus(stage: string): string {
    if (stage === "hardening") return Math.random() < 0.3 ? "ready_for_sale" : "active";
    if (stage === "acclimation") return "active";
    // Small chance of contamination
    if (Math.random() < 0.03) return "contaminated";
    return "active";
  }

  // ─── LOCATION MAPPING BY STAGE ───
  // Growth chambers for initiation/multiplication/rooting, greenhouse for acclimation/hardening
  function pickLocation(stage: string): string {
    const growthChambers = locations.filter(
      (l) => l.type === "growth_chamber" || l.type === "flow_hood" || l.type === "bench"
    );
    const greenhouses = locations.filter((l) => l.type === "greenhouse");
    if ((stage === "acclimation" || stage === "hardening") && greenhouses.length) {
      return pick(greenhouses).id;
    }
    if (growthChambers.length) return pick(growthChambers).id;
    return pick(locations).id;
  }

  // ─── RECIPE MAPPING BY STAGE ───
  function pickRecipe(stage: string): string {
    const name = (r: { name: string }) => r.name.toLowerCase();
    if (stage === "rooting") {
      const rootingRecipes = recipes.filter((r) => name(r).includes("rooting"));
      if (rootingRecipes.length) return pick(rootingRecipes).id;
    }
    if (stage === "multiplication") {
      const multRecipes = recipes.filter((r) => name(r).includes("multiplication"));
      if (multRecipes.length) return pick(multRecipes).id;
    }
    // initiation / acclimation / hardening -> basal or any
    const basalRecipes = recipes.filter((r) => name(r).includes("basal"));
    if (basalRecipes.length) return pick(basalRecipes).id;
    return pick(recipes).id;
  }

  // ─── CREATE MEDIA BATCHES (25 entries) ───
  console.log("Creating media batches...");
  const mediaBatchCount = 25;
  const mediaBatches: { id: string; recipeId: string }[] = [];

  for (let i = 1; i <= mediaBatchCount; i++) {
    const recipe = pick(recipes);
    const prepDate = randomDateWithinDays(60);
    const expiresDate = new Date(prepDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const volumeL = 2 + Math.floor(Math.random() * 6);
    const vesselCount = 30 + Math.floor(Math.random() * 70);
    const preparedBy = pick(users);

    const batch = await prisma.mediaBatch.create({
      data: {
        batchNumber: `MB-2026-${String(i).padStart(3, "0")}`,
        recipeId: recipe.id,
        volumeL,
        vesselCount,
        preparedById: preparedBy.id,
        measuredPH: 5.7 + Math.random() * 0.2,
        autoclaved: true,
        autoclavedAt: prepDate,
        expiresAt: expiresDate,
        createdAt: prepDate,
      },
    });
    mediaBatches.push({ id: batch.id, recipeId: recipe.id });
  }
  console.log(`Created ${mediaBatchCount} media batches (MB-2026-001 through MB-2026-025)`);

  // ─── CREATE VESSELS IN BATCHES ───
  console.log(`\nCreating ${vesselsNeeded} vessels in batches of 500...`);

  const BATCH_SIZE = 500;
  let created = 0;

  for (let batchStart = 0; batchStart < vesselsNeeded; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, vesselsNeeded);
    const vesselData: any[] = [];

    for (let i = batchStart; i < batchEnd; i++) {
      const barcodeNum = maxBarcodeNum + 1 + i;
      const barcode = `RBC-${String(barcodeNum).padStart(4, "0")}`;
      const stage = pickStage();
      const healthStatus = pickHealth();
      const status = pickStatus(stage);
      const cultivar = pick(cultivars);
      const locationId = pickLocation(stage);
      const mediaRecipeId = pickRecipe(stage);
      const mediaBatch = pick(mediaBatches);

      // Dates spread over past 90 days
      const createdAt = randomDateWithinDays(90);
      const lastSubcultureDate = new Date(
        createdAt.getTime() + Math.random() * (Date.now() - createdAt.getTime())
      );
      const nextSubcultureDate = new Date(
        lastSubcultureDate.getTime() + randInt(14, 35) * 24 * 60 * 60 * 1000
      );

      // Subculture/generation numbers based on stage
      let subcultureNumber = 0;
      let generation = 0;
      switch (stage) {
        case "initiation":
          subcultureNumber = 0;
          generation = 0;
          break;
        case "multiplication":
          subcultureNumber = randInt(1, 6);
          generation = randInt(1, 4);
          break;
        case "rooting":
          subcultureNumber = randInt(2, 5);
          generation = randInt(2, 5);
          break;
        case "acclimation":
          subcultureNumber = randInt(3, 7);
          generation = randInt(3, 6);
          break;
        case "hardening":
          subcultureNumber = randInt(4, 8);
          generation = randInt(4, 7);
          break;
      }

      const explantCount = stage === "initiation"
        ? randInt(1, 3)
        : stage === "multiplication"
        ? randInt(3, 8)
        : randInt(1, 4);

      const contaminationType =
        status === "contaminated"
          ? pick(["bacterial", "fungal", "yeast"])
          : null;
      const contaminationDate =
        status === "contaminated" ? randomDateWithinDays(14) : null;

      vesselData.push({
        barcode,
        cultivarId: cultivar.id,
        mediaRecipeId,
        locationId,
        explantCount,
        healthStatus,
        status,
        stage,
        subcultureNumber,
        generation,
        contaminationType,
        contaminationDate,
        organizationId: orgId,
        plantedAt: stage !== "initiation" ? createdAt : null,
        nextSubcultureDate: ["initiation", "multiplication", "rooting"].includes(stage)
          ? nextSubcultureDate
          : null,
        createdAt,
        updatedAt: lastSubcultureDate,
        mediaBatchId: mediaBatch.id,
        lastSubcultureDate: subcultureNumber > 0 ? lastSubcultureDate : null,
        notes: null,
      });
    }

    await prisma.vessel.createMany({ data: vesselData });
    created += vesselData.length;
    console.log(`  Created ${created}/${vesselsNeeded} vessels`);
  }

  // ─── VERIFY FINAL COUNT ───
  const finalCount = await prisma.vessel.count({
    where: { organizationId: orgId },
  });
  console.log(`\nFinal vessel count: ${finalCount}`);

  // ─── CREATE ACTIVITY LOG ENTRIES ───
  console.log("\nCreating activity log entries...");

  // Get a sample of newly created vessels for activities
  const sampleVessels = await prisma.vessel.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, stage: true, createdAt: true },
  });

  const activityTypes = [
    { type: "vessel_created", category: "vessel" },
    { type: "subculture", category: "vessel" },
    { type: "stage_change", category: "vessel" },
    { type: "health_update", category: "vessel" },
    { type: "contamination_flagged", category: "vessel" },
    { type: "media_prep", category: "lab" },
    { type: "grading", category: "vessel" },
    { type: "observation", category: "vessel" },
  ];

  const activityData: any[] = [];
  for (const vessel of sampleVessels) {
    // 1-3 activities per vessel
    const numActivities = randInt(1, 3);
    for (let a = 0; a < numActivities; a++) {
      const actType = pick(activityTypes);
      const user = pick(users);
      const actDate = new Date(
        vessel.createdAt.getTime() +
          Math.random() * (Date.now() - vessel.createdAt.getTime())
      );

      activityData.push({
        vesselId: vessel.id,
        userId: user.id,
        type: actType.type,
        category: actType.category,
        metadata: JSON.stringify({ automated: false }),
        createdAt: actDate,
      });
    }
  }

  // Batch insert activities
  const ACT_BATCH = 500;
  for (let i = 0; i < activityData.length; i += ACT_BATCH) {
    const batch = activityData.slice(i, i + ACT_BATCH);
    await prisma.activity.createMany({ data: batch });
  }
  console.log(`Created ${activityData.length} activity log entries`);

  // ─── SUMMARY ───
  console.log("\n=== SCALE SEED COMPLETE ===");
  console.log(`Vessels: ${currentCount} → ${finalCount}`);
  console.log(`Media Batches: ${mediaBatchCount} created`);
  console.log(`Activity Logs: ${activityData.length} created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
