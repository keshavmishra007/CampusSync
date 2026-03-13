const Channel = require("../models/Channel");

const branches = ["CSE", "EC", "ME", "CE", "EE"]; // add your branches
const years = [1, 2, 3, 4];

const seedBranchYearChannels = async () => {
  try {
    for (let branch of branches) {
      for (let year of years) {
        const channelName = `${branch}-Year-${year}`;

        const existing = await Channel.findOne({
          name: channelName,
          type: "branch-year",
        });

        if (!existing) {
          await Channel.create({
            name: channelName,
            type: "branch-year",
            branch,
            year,
          });

          console.log(`Created channel: ${channelName}`);
        }
      }
    }

    console.log("Branch-Year channels seeded successfully");
  } catch (error) {
    console.error("Error seeding channels:", error.message);
  }
};

module.exports = seedBranchYearChannels;