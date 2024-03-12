import { seedUser } from "./userSeeder.js"

const runSeeder = async () => {
  // user seeder
  seedUser().then(() => {
    console.log("User seeding completed");
    process.exit(0);
  }).catch((err) => {
    console.error("Error seeding user:", err);
    process.exit(1);
});
}

await runSeeder();
