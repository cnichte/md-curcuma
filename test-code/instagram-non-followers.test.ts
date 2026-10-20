/**
 * Instagram Non-Followers Test
 * 
 * This test demonstrates how to use the Instagram_NonFollowers_Task.
 * 
 * ⚠️ IMPORTANT:
 * - Set environment variables IG_USERNAME and IG_PASSWORD before running
 * - Use with caution - Instagram may rate limit or ban accounts
 * - Always start with dry_run: true
 * - If 2FA is enabled, the script will prompt you to enter the code
 * 
 * Usage:
 *   export IG_USERNAME="your_username"
 *   export IG_PASSWORD="vycmYb-rapqoz-1vuthy"
 *   npx tsx test-code/instagram-non-followers.test.ts
 */

import { Instagram_NonFollowers_Task, Instagram_NonFollowers_Task_Props } from "../src/lib/tasks";
import { Data_Interface, IO_Meta } from "../src/lib/io/types";

async function test_instagram_non_followers() {
  // Check for credentials - USE ENVIRONMENT VARIABLES, NOT HARDCODED!
  // Live Instagram access is opt-in because it is not a deterministic test.
  const username = process.env.IG_USERNAME;
  const password = process.env.IG_PASSWORD;

  if (!username || !password) {
    console.log("⏭️ Skipping live Instagram analysis: set IG_USERNAME and IG_PASSWORD to enable it.");
    return;
  }

  const props: Instagram_NonFollowers_Task_Props = {
    username,
    password,
    action: "analyze", // or "unfollow"
    throttle_ms: 3000, // 3 seconds between API calls
    unfollow_throttle_ms: 15000, // 15 seconds between unfollows
    max_unfollow: 10, // Maximum 10 unfollows per run (safety limit)
    whitelist: [
      // Add usernames you never want to unfollow
      // "friend1",
      // "important_account",
    ],
    output_path: "./test-data/instagram/non-followers.json",
    session_path: "./test-data/instagram/session.json", // Save session to avoid re-login
    dry_run: true, // Set to false to actually unfollow
  };

  console.log("🚀 Starting Instagram Non-Followers Analysis\n");
  console.log("Configuration:");
  console.log(`   Username: ${props.username}`);
  console.log(`   Action: ${props.action}`);
  console.log(`   Dry Run: ${props.dry_run}`);
  console.log(`   Throttle: ${props.throttle_ms}ms`);
  console.log(`   Output: ${props.output_path}`);
  console.log(`   Session: ${props.session_path}`);
  console.log("");

  const task = new Instagram_NonFollowers_Task<any>(props);

  // Create empty DAO
  const dao: Data_Interface<any> = {
    data: {},
    io_meta: new IO_Meta(),
  };

  try {
    await task.perform_async(dao);
    console.log("\n✅ Analysis complete!");
  } catch (error) {
    console.error("\n❌ Analysis failed:", error);
    process.exit(1);
  }
}

// Run the test
test_instagram_non_followers();
