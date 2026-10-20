/**
 * Instagram Export Analysis Test
 *
 * This test demonstrates how to use the Instagram_Export_Analysis_Task.
 *
 * ⚠️ SETUP:
 * 1. Download your Instagram data export (JSON or HTML format)
 * 2. Extract the ZIP file to test-data/instagram-content/
 * 3. Update the paths below to match your export folder
 *
 * Usage:
 *   npx tsx test-code/instagram-export-analysis.test.ts
 */

import {
  Instagram_Export_Analysis_Task,
  Instagram_Export_Analysis_Task_Props,
} from "../src/lib/tasks";
import { Data_Interface, IO_Meta } from "../src/lib/io/types";

async function test_instagram_export_analysis() {
  // Configure paths to your exported files
  // Update this to match your export folder name
  const exportFolder = "./test-data/instagram-content/instagram-binary_voids-2026-07-21-gS2INRv5";
  
  const props: Instagram_Export_Analysis_Task_Props = {
    followers_path: `${exportFolder}/connections/followers_and_following/followers_1.html`,
    following_path: `${exportFolder}/connections/followers_and_following/following.html`,
    output_path: "./test-data/instagram-content/analysis-result.json",
    sort_by_date: true, // Sort by follow date (newest first)
    // sort_by_username: true,  // Or sort alphabetically
    
    // Optional: Exclude favorites from the non-followers list
    // favorites: ["friend1", "friend2", "important_account"],
    // Or load from file (one username per line):
    // favorites_file: "./test-data/instagram-content/favorites.txt",
  };

  console.log("🚀 Starting Instagram Export Analysis\n");
  console.log("Configuration:");
  console.log(`   Followers file: ${props.followers_path}`);
  console.log(`   Following file: ${props.following_path}`);
  console.log(`   Output: ${props.output_path}`);
  console.log("");

  const task = new Instagram_Export_Analysis_Task<any>(props);

  // Create empty DAO
  const dao: Data_Interface<any> = {
    data: {},
    io_meta: new IO_Meta(),
  };

  try {
    await task.perform_async(dao);
    console.log("\n✅ Analysis complete!");
    console.log("\nNext steps:");
    console.log("1. Open the analysis-result.json to see all non-followers");
    console.log("2. Use the .txt file for easy copy/paste of usernames");
    console.log("3. Manually unfollow users on Instagram if desired");
  } catch (error) {
    console.error("\n❌ Analysis failed:", error);
    console.log("\n💡 Make sure you have extracted your Instagram data export.");
    console.log("   Expected structure:");
    console.log("   - <export-folder>/connections/followers_and_following/followers_1.html");
    console.log("   - <export-folder>/connections/followers_and_following/following.html");
    process.exit(1);
  }
}

// Run the test
test_instagram_export_analysis();
