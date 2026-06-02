import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findFirst({
    where: { slug: "rebel-cultures" },
  });
  if (!org) throw new Error("Rebel Cultures org not found");

  const orgId = org.id;
  console.log(`Found Rebel Cultures: ${orgId}`);

  // Get existing users
  const della = await prisma.user.findFirst({
    where: { organizationId: orgId, role: "admin" },
  });
  if (!della) throw new Error("Della not found");

  const existingTech = await prisma.user.findFirst({
    where: { organizationId: orgId, role: "tech" },
  });

  // ─── ADD MORE TEAM MEMBERS ───
  const hash = await bcrypt.hash("demo1234", 10);

  const techUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: "sarah@rebel.vitros.app" },
      update: {},
      create: {
        name: "Sarah Chen",
        email: "sarah@rebel.vitros.app",
        passwordHash: hash,
        pin: "2222",
        role: "lead_tech",
        isActive: true,
        organizationId: orgId,
      },
    }),
    prisma.user.upsert({
      where: { email: "marcus@rebel.vitros.app" },
      update: {},
      create: {
        name: "Marcus Rivera",
        email: "marcus@rebel.vitros.app",
        passwordHash: hash,
        pin: "3333",
        role: "tech",
        isActive: true,
        organizationId: orgId,
      },
    }),
    prisma.user.upsert({
      where: { email: "jaylen@rebel.vitros.app" },
      update: {},
      create: {
        name: "Jaylen Brooks",
        email: "jaylen@rebel.vitros.app",
        passwordHash: hash,
        pin: "4444",
        role: "tech",
        isActive: true,
        organizationId: orgId,
      },
    }),
    prisma.user.upsert({
      where: { email: "emma@rebel.vitros.app" },
      update: {},
      create: {
        name: "Emma Whitfield",
        email: "emma@rebel.vitros.app",
        passwordHash: hash,
        pin: "5555",
        role: "tech",
        isActive: true,
        organizationId: orgId,
      },
    }),
    prisma.user.upsert({
      where: { email: "kevin@rebel.vitros.app" },
      update: {},
      create: {
        name: "Kevin Patel",
        email: "kevin@rebel.vitros.app",
        passwordHash: hash,
        pin: "6666",
        role: "tech",
        isActive: true,
        organizationId: orgId,
      },
    }),
  ]);

  const allTechs = existingTech
    ? [existingTech, ...techUsers]
    : techUsers;

  console.log(`Created/found ${allTechs.length} tech users`);

  // ─── GET LOCATIONS ───
  const locations = await prisma.location.findMany({
    where: { site: { organizationId: orgId } },
  });

  // ─── STATIONS (for team performance) ───
  const stationData = [
    { name: "Hood A - Station 1", type: "laminar_flow_hood" as const },
    { name: "Hood A - Station 2", type: "laminar_flow_hood" as const },
    { name: "Hood B - Station 1", type: "laminar_flow_hood" as const },
    { name: "Prep Station 1", type: "prep_station" as const },
    { name: "Clean Bench 1", type: "clean_bench" as const },
  ];

  const stations = await Promise.all(
    stationData.map((s) =>
      prisma.station.create({
        data: {
          name: s.name,
          type: s.type,
          locationId: locations[0]?.id,
          isActive: true,
          organizationId: orgId,
        },
      })
    )
  );
  console.log(`Created ${stations.length} stations`);

  // ─── INCENTIVE CONFIG ───
  await prisma.incentiveConfig.upsert({
    where: { organizationId: orgId },
    update: {},
    create: {
      organizationId: orgId,
      baseHourlyRate: 18.0,
      pointDollarValue: 0.03,
      contaminationThreshold: 5.0,
      contaminationLookbackDays: 30,
      bonusPeriod: "weekly",
      dailyVesselTarget: 40,
      enableIncentives: true,
    },
  });
  console.log("Created incentive config");

  // ─── INCENTIVE POINT RULES ───
  const pointRules = [
    { stage: "initiation", containerType: "jar", taskType: "initiation", basePoints: 3 },
    { stage: "multiplication", containerType: "jar", taskType: "transfer", basePoints: 2 },
    { stage: "rooting", containerType: "jar", taskType: "transfer", basePoints: 2 },
    { stage: "acclimation", containerType: "magenta_box", taskType: "transfer", basePoints: 4 },
    { stage: "multiplication", containerType: "jar", taskType: "grading", basePoints: 1 },
    { stage: "initiation", containerType: "jar", taskType: "media_prep", basePoints: 5 },
  ];

  for (const rule of pointRules) {
    await prisma.incentivePointRule.create({
      data: { ...rule, isActive: true, organizationId: orgId },
    });
  }
  console.log("Created point rules");

  // ─── TECH SHIFTS (last 30 days) ───
  const now = new Date();
  let shiftCount = 0;

  for (let day = 0; day < 30; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // 3-5 techs work each day
    const dailyTechs = allTechs
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 + Math.floor(Math.random() * 3));

    for (const tech of dailyTechs) {
      const clockIn = new Date(date);
      clockIn.setHours(7 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0);
      const clockOut = new Date(clockIn);
      clockOut.setHours(clockIn.getHours() + 7 + Math.floor(Math.random() * 2));

      const hoursWorked = (clockOut.getTime() - clockIn.getTime()) / 3600000;
      const vesselsProcessed = 25 + Math.floor(Math.random() * 35);
      const contaminationCount = Math.random() < 0.15 ? Math.floor(Math.random() * 3) + 1 : 0;
      const totalPoints = vesselsProcessed * 2 + (contaminationCount === 0 ? 10 : 0);
      const bonusAmount = totalPoints * 0.03;

      const station = stations[Math.floor(Math.random() * stations.length)];

      await prisma.techShift.create({
        data: {
          userId: tech.id,
          stationId: station.id,
          organizationId: orgId,
          clockIn,
          clockOut,
          hoursWorked,
          isOvertime: hoursWorked > 8,
          totalPoints,
          vesselsProcessed,
          contaminationCount,
          effectiveRate: 18 + bonusAmount / hoursWorked,
          bonusAmount,
          status: "completed",
        },
      });
      shiftCount++;
    }
  }
  console.log(`Created ${shiftCount} tech shifts`);

  // ─── SHIFT NOTES ───
  const shiftNotes = [
    { content: "Growth chamber 2 humidity dropped to 55% around 2pm. Adjusted manually. Plants look fine.", priority: "important" as const },
    { content: "New batch of Cafe au Lait initiations started. 20 vessels, all looking strong.", priority: "normal" as const },
    { content: "Spotted potential bacterial contamination on 3 Albion vessels in multiplication. Quarantined and flagged.", priority: "urgent" as const },
    { content: "Media prep done for tomorrow. 4L of dahlia multiplication media autoclaved and stored.", priority: "normal" as const },
    { content: "Sarah trained Kevin on the new rooting protocol for strawberries. He is picking it up fast.", priority: "normal" as const },
    { content: "Flow Hood A HEPA filter due for replacement next week. Performance still good for now.", priority: "important" as const },
    { content: "Received shipment of BAP and IBA. Inventory updated. We are good for 2 months.", priority: "normal" as const },
    { content: "Greenhouse acclimation batch RBC-0150 through RBC-0165 ready to move to hardening.", priority: "normal" as const },
  ];

  for (let i = 0; i < shiftNotes.length; i++) {
    const noteDate = new Date(now);
    noteDate.setDate(noteDate.getDate() - i);
    await prisma.shiftNote.create({
      data: {
        authorId: allTechs[i % allTechs.length].id,
        organizationId: orgId,
        content: shiftNotes[i].content,
        priority: shiftNotes[i].priority,
        isRead: i > 2,
        shiftDate: noteDate,
      },
    });
  }
  console.log("Created shift notes");

  // ─── ENVIRONMENT READINGS (last 14 days, every 4 hours) ───
  let envCount = 0;
  for (const loc of locations) {
    for (let day = 0; day < 14; day++) {
      for (let hour = 0; hour < 24; hour += 4) {
        const readingDate = new Date(now);
        readingDate.setDate(readingDate.getDate() - day);
        readingDate.setHours(hour, Math.floor(Math.random() * 60), 0);

        const baseTemp = loc.name?.includes("Greenhouse") ? 26 : 24;
        const baseHumidity = loc.name?.includes("Growth") ? 75 : 60;

        await prisma.environmentReading.create({
          data: {
            locationId: loc.id,
            temperature: baseTemp + (Math.random() * 3 - 1.5),
            humidity: baseHumidity + (Math.random() * 10 - 5),
            co2Level: 400 + Math.floor(Math.random() * 100),
            lightLevel: hour >= 6 && hour <= 20 ? 3000 + Math.floor(Math.random() * 2000) : 0,
            recordedById: allTechs[Math.floor(Math.random() * allTechs.length)].id,
            recordedAt: readingDate,
            source: Math.random() > 0.3 ? "automated" : "manual",
          },
        });
        envCount++;
      }
    }
  }
  console.log(`Created ${envCount} environment readings`);

  // ─── INVENTORY ITEMS ───
  const inventoryItems = [
    { name: "MS Basal Salt Mixture", category: "chemicals", sku: "MS-001", supplier: "PhytoTech Labs", currentStock: 2500, unit: "g", reorderLevel: 500, costPerUnit: 0.08, storageLocation: "Chemical Cabinet A" },
    { name: "6-Benzylaminopurine (BAP)", category: "chemicals", sku: "BAP-001", supplier: "Sigma-Aldrich", currentStock: 50, unit: "g", reorderLevel: 10, costPerUnit: 2.50, storageLocation: "Refrigerator 1" },
    { name: "Indole-3-Butyric Acid (IBA)", category: "chemicals", sku: "IBA-001", supplier: "Sigma-Aldrich", currentStock: 25, unit: "g", reorderLevel: 5, costPerUnit: 3.20, storageLocation: "Refrigerator 1" },
    { name: "Naphthaleneacetic acid (NAA)", category: "chemicals", sku: "NAA-001", supplier: "PhytoTech Labs", currentStock: 30, unit: "g", reorderLevel: 5, costPerUnit: 1.80, storageLocation: "Refrigerator 1" },
    { name: "Gibberellic Acid (GA3)", category: "chemicals", sku: "GA3-001", supplier: "Caisson Labs", currentStock: 15, unit: "g", reorderLevel: 3, costPerUnit: 4.50, storageLocation: "Refrigerator 1" },
    { name: "Agar (Plant TC Grade)", category: "supplies", sku: "AGR-001", supplier: "PhytoTech Labs", currentStock: 5000, unit: "g", reorderLevel: 1000, costPerUnit: 0.05, storageLocation: "Supply Shelf B" },
    { name: "Sucrose (Analytical Grade)", category: "supplies", sku: "SUC-001", supplier: "Fisher Scientific", currentStock: 10000, unit: "g", reorderLevel: 2000, costPerUnit: 0.02, storageLocation: "Supply Shelf B" },
    { name: "Culture Jars (350ml)", category: "containers", sku: "JAR-350", supplier: "PhytoTech Labs", currentStock: 450, unit: "pcs", reorderLevel: 100, costPerUnit: 1.25, storageLocation: "Container Rack 1" },
    { name: "Magenta GA7 Boxes", category: "containers", sku: "MGA-001", supplier: "Magenta Corp", currentStock: 200, unit: "pcs", reorderLevel: 50, costPerUnit: 2.80, storageLocation: "Container Rack 1" },
    { name: "Parafilm M (4in)", category: "supplies", sku: "PAR-004", supplier: "Bemis", currentStock: 12, unit: "rolls", reorderLevel: 3, costPerUnit: 18.00, storageLocation: "Supply Shelf A" },
    { name: "70% Ethanol", category: "chemicals", sku: "ETH-070", supplier: "Fisher Scientific", currentStock: 20, unit: "L", reorderLevel: 5, costPerUnit: 8.50, storageLocation: "Chemical Cabinet B" },
    { name: "Sodium Hypochlorite (10%)", category: "chemicals", sku: "NAH-010", supplier: "Fisher Scientific", currentStock: 10, unit: "L", reorderLevel: 2, costPerUnit: 5.00, storageLocation: "Chemical Cabinet B" },
    { name: "Sterile Forceps", category: "tools", sku: "FRC-001", supplier: "VWR", currentStock: 15, unit: "pcs", reorderLevel: 5, costPerUnit: 12.00, storageLocation: "Tool Drawer" },
    { name: "Scalpel Blades (#11)", category: "tools", sku: "SCL-011", supplier: "VWR", currentStock: 200, unit: "pcs", reorderLevel: 50, costPerUnit: 0.35, storageLocation: "Tool Drawer" },
    { name: "HEPA Filter (Hood A)", category: "equipment", sku: "HEP-A01", supplier: "Germfree Labs", currentStock: 2, unit: "pcs", reorderLevel: 1, costPerUnit: 285.00, storageLocation: "Equipment Storage" },
    { name: "pH Calibration Buffer 4.0", category: "chemicals", sku: "PHB-040", supplier: "Fisher Scientific", currentStock: 6, unit: "bottles", reorderLevel: 2, costPerUnit: 9.50, storageLocation: "Chemical Cabinet A" },
  ];

  for (const item of inventoryItems) {
    await prisma.inventoryItem.create({
      data: { ...item, organizationId: orgId },
    });
  }
  console.log(`Created ${inventoryItems.length} inventory items`);

  // ─── PROTOCOLS / SOPs ───
  const protocols = [
    {
      name: "Dahlia Initiation Protocol",
      stage: "initiation",
      version: 2,
      steps: JSON.parse(JSON.stringify([
        { step: 1, title: "Surface Sterilization", description: "Wash explant in running water for 15 min. Dip in 70% ethanol for 30 sec. Transfer to 1% sodium hypochlorite for 10 min. Rinse 3x with sterile distilled water." },
        { step: 2, title: "Explant Preparation", description: "Under laminar flow hood, trim explant to 1-2cm including at least one node. Remove any damaged tissue." },
        { step: 3, title: "Inoculation", description: "Place explant vertically on MS basal medium supplemented with 1mg/L BAP and 0.1mg/L NAA. One explant per jar." },
        { step: 4, title: "Incubation", description: "Place in growth chamber at 25C, 16h photoperiod, 2000 lux. Check for contamination at 48h and 7 days." },
      ])),
      safetyNotes: "Wear gloves and lab coat. Work in laminar flow hood. Dispose of bleach solution properly.",
    },
    {
      name: "Strawberry Multiplication Protocol",
      stage: "multiplication",
      version: 1,
      steps: JSON.parse(JSON.stringify([
        { step: 1, title: "Subculture Timing", description: "Transfer every 4 weeks when shoots reach 2-3cm. Do not exceed 6 weeks between subcultures." },
        { step: 2, title: "Division", description: "Carefully separate shoot clusters into groups of 2-3 shoots. Trim any brown or senescent tissue." },
        { step: 3, title: "Transfer", description: "Place divided shoots onto fresh strawberry multiplication medium (MS + 1mg/L BA + 0.5mg/L GA3). 3-4 explants per jar." },
        { step: 4, title: "Recording", description: "Scan vessel barcode and log subculture in VitrOS. Note multiplication rate and any abnormalities." },
      ])),
      safetyNotes: "Use sterile technique throughout. Flame-sterilize tools between explants.",
    },
    {
      name: "Rooting Induction Protocol",
      stage: "rooting",
      version: 1,
      steps: JSON.parse(JSON.stringify([
        { step: 1, title: "Shoot Selection", description: "Select healthy shoots 3-5cm tall with at least 3 leaves. Discard any with signs of hyperhydricity." },
        { step: 2, title: "Base Trimming", description: "Make a clean cut at the base of the shoot, removing any callus tissue." },
        { step: 3, title: "Transfer to Rooting Medium", description: "Place individual shoots on half-strength MS + 1mg/L IBA. One shoot per vessel." },
        { step: 4, title: "Monitoring", description: "Roots should appear within 2-3 weeks. Check weekly. Transfer to acclimation when roots are 1-2cm." },
      ])),
      safetyNotes: "Handle shoots gently to avoid damaging developing roots.",
    },
    {
      name: "Acclimation and Hardening Protocol",
      stage: "acclimation",
      version: 1,
      steps: JSON.parse(JSON.stringify([
        { step: 1, title: "Deflasking", description: "Gently remove rooted plantlet from jar. Wash agar from roots under lukewarm water." },
        { step: 2, title: "Planting", description: "Plant in pre-moistened sterile peat/perlite mix (1:1). Place in humidity dome." },
        { step: 3, title: "Humidity Reduction", description: "Week 1: 95% humidity. Week 2: 80%. Week 3: 65%. Week 4: ambient." },
        { step: 4, title: "Light Adjustment", description: "Gradually increase light from 2000 to 5000 lux over 3 weeks." },
      ])),
      safetyNotes: "Monitor for wilting daily. Mist if leaves show signs of stress.",
    },
    {
      name: "Media Preparation SOP",
      stage: "initiation",
      version: 3,
      steps: JSON.parse(JSON.stringify([
        { step: 1, title: "Weigh Components", description: "Weigh MS salts, sucrose, agar, and hormones according to recipe. Record weights in log." },
        { step: 2, title: "Dissolve and Adjust", description: "Dissolve components in distilled water. Adjust pH to 5.8 using NaOH/HCl. Add agar and heat to dissolve." },
        { step: 3, title: "Dispense", description: "Pour 50ml into each culture jar under clean conditions. Cap loosely for autoclaving." },
        { step: 4, title: "Autoclave", description: "Autoclave at 121C, 15 PSI for 20 minutes. Allow to cool undisturbed. Tighten caps once solidified." },
        { step: 5, title: "Quality Check", description: "Check pH of cooled media with indicator. Inspect for contamination after 48h before use." },
      ])),
      safetyNotes: "Use heat-resistant gloves when handling autoclave. Never open autoclave until pressure reaches zero.",
    },
    {
      name: "Contamination Response Protocol",
      stage: "multiplication",
      version: 1,
      steps: JSON.parse(JSON.stringify([
        { step: 1, title: "Identification", description: "Identify contamination type: bacterial (cloudy media), fungal (visible mycelium), or yeast (opaque spots)." },
        { step: 2, title: "Isolation", description: "Immediately remove contaminated vessel from growth area. Place in quarantine zone." },
        { step: 3, title: "Documentation", description: "Log contamination in VitrOS with type, location, and photo. Flag clone line if applicable." },
        { step: 4, title: "Investigation", description: "Check adjacent vessels. Review media batch records. Inspect hood/bench for source." },
        { step: 5, title: "Disposal", description: "Autoclave contaminated vessels before disposal. Do not open contaminated jars outside the hood." },
      ])),
      safetyNotes: "Treat all contaminated vessels as biohazard. Autoclave before disposal.",
    },
  ];

  for (const proto of protocols) {
    await prisma.protocol.create({
      data: { ...proto, isActive: true, organizationId: orgId },
    });
  }
  console.log(`Created ${protocols.length} protocols/SOPs`);

  // ─── SALES ORDERS ───
  const cultivars = await prisma.cultivar.findMany({
    where: { organizationId: orgId },
  });

  const salesOrders = [
    { orderNumber: "SO-2026-001", customerName: "Great Lakes Garden Center", cultivarName: "Cafe au Lait", quantity: 500, dueDate: 45, status: "in_production", priority: "high" },
    { orderNumber: "SO-2026-002", customerName: "Michigan Flower Farm Co-op", cultivarName: "Bishop of Llandaff", quantity: 300, dueDate: 60, status: "pending", priority: "medium" },
    { orderNumber: "SO-2026-003", customerName: "Holland Community Market", cultivarName: "Albion", quantity: 1000, dueDate: 30, status: "in_production", priority: "high" },
    { orderNumber: "SO-2026-004", customerName: "West Michigan Growers", cultivarName: "Seascape", quantity: 750, dueDate: 75, status: "pending", priority: "medium" },
    { orderNumber: "SO-2026-005", customerName: "Rebel Cultures Direct", cultivarName: "Thomas Edison", quantity: 200, dueDate: 90, status: "pending", priority: "low" },
    { orderNumber: "SO-2026-006", customerName: "Lakeshore Nurseries", cultivarName: "Kelvin Floodlight", quantity: 400, dueDate: 50, status: "in_production", priority: "high" },
  ];

  for (const order of salesOrders) {
    const cultivar = cultivars.find((c) => c.name === order.cultivarName);
    if (!cultivar) continue;

    const due = new Date(now);
    due.setDate(due.getDate() + order.dueDate);

    await prisma.salesOrder.create({
      data: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        cultivarId: cultivar.id,
        quantity: order.quantity,
        unitType: "plugs",
        dueDate: due,
        status: order.status,
        priority: order.priority,
        organizationId: orgId,
      },
    });
  }
  console.log(`Created ${salesOrders.length} sales orders`);

  // ─── MEDIA BATCHES ───
  const recipes = await prisma.mediaRecipe.findMany({
    where: { organizationId: orgId },
  });

  for (let i = 0; i < 8; i++) {
    const recipe = recipes[i % recipes.length];
    const prepDate = new Date(now);
    prepDate.setDate(prepDate.getDate() - i * 4);
    const expiresDate = new Date(prepDate);
    expiresDate.setDate(expiresDate.getDate() + 30);

    await prisma.mediaBatch.create({
      data: {
        batchNumber: `MB-2026-${String(i + 1).padStart(3, "0")}`,
        recipeId: recipe.id,
        volumeL: 2 + Math.floor(Math.random() * 4),
        vesselCount: 30 + Math.floor(Math.random() * 40),
        preparedById: allTechs[i % allTechs.length].id,
        measuredPH: 5.7 + Math.random() * 0.2,
        autoclaved: true,
        autoclavedAt: prepDate,
        expiresAt: expiresDate,
        organizationId: orgId,
      },
    });
  }
  console.log("Created 8 media batches");

  // ─── ALERTS ───
  const alerts = [
    { type: "contamination", severity: "critical", title: "Contamination Spike Detected", message: "3 vessels in Growth Chamber 1 flagged with bacterial contamination in the last 24 hours. Investigate media batch MB-2026-003." },
    { type: "inventory", severity: "warning", title: "Low Stock: BAP", message: "6-Benzylaminopurine stock is at 50g. Reorder level is 10g. Current burn rate suggests 3 weeks remaining." },
    { type: "subculture", severity: "info", title: "12 Vessels Overdue for Subculture", message: "12 vessels in multiplication stage are past their scheduled subculture date. Oldest is 5 days overdue." },
    { type: "environment", severity: "warning", title: "Growth Chamber 2 Humidity Low", message: "Humidity in Growth Chamber 2 dropped to 52% at 2:15 PM. Target range is 65-80%." },
    { type: "maintenance", severity: "info", title: "HEPA Filter Replacement Due", message: "Flow Hood A HEPA filter is due for replacement. Last changed 11 months ago." },
  ];

  for (const alert of alerts) {
    await prisma.alert.create({
      data: {
        ...alert,
        entityType: "system",
        isRead: false,
        isDismissed: false,
        organizationId: orgId,
      },
    });
  }
  console.log("Created alerts");

  console.log("\nDone! Rebel Cultures now has full demo data across all sections.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
