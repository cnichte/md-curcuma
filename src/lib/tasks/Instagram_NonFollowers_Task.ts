import { IgApiClient } from "instagram-private-api";
import {
  AccountFollowersFeedResponseUsersItem,
  AccountFollowingFeedResponseUsersItem,
} from "instagram-private-api";

import { Data_Interface } from "../io/types";
import { Observable_Abstract_TaskBase } from "./Observable_Abstract_TaskBase";
import { Filesystem } from "../core";

/**
 * Instagram user data structure
 */
export interface Instagram_User {
  pk: string;
  username: string;
  full_name: string;
  is_private: boolean;
  profile_pic_url?: string;
}

/**
 * Result of the non-followers analysis
 */
export interface Instagram_NonFollowers_Result {
  /** Users you follow who don't follow you back */
  non_followers: Instagram_User[];
  /** Users who follow you but you don't follow back */
  fans: Instagram_User[];
  /** Users who follow each other (mutual) */
  mutuals: Instagram_User[];
  /** All users you follow */
  following: Instagram_User[];
  /** All users who follow you */
  followers: Instagram_User[];
  /** Timestamp of the analysis */
  timestamp: string;
  /** Your username */
  username: string;
}

/**
 * Actions that can be performed on non-followers
 */
export type Instagram_Action = "analyze" | "unfollow";

/**
 * Configuration props for Instagram_NonFollowers_Task
 */
export interface Instagram_NonFollowers_Task_Props {
  /** Instagram username */
  username: string;
  /** Instagram password */
  password: string;
  /** Action to perform: 'analyze' or 'unfollow' */
  action: Instagram_Action;
  /** 
   * Throttle delay in milliseconds between API calls.
   * Recommended: 2000-5000ms to avoid rate limiting.
   * @default 3000
   */
  throttle_ms?: number;
  /**
   * Throttle delay in milliseconds between unfollow actions.
   * Should be higher than regular throttle to avoid detection.
   * @default 10000
   */
  unfollow_throttle_ms?: number;
  /**
   * Maximum number of users to unfollow per run.
   * Safety limit to avoid mass unfollowing.
   * @default 50
   */
  max_unfollow?: number;
  /**
   * List of usernames to never unfollow (whitelist)
   */
  whitelist?: string[];
  /**
   * Output file path for the JSON result.
   * @default './instagram-non-followers.json'
   */
  output_path?: string;
  /**
   * If true, only simulate actions without actually unfollowing.
   * @default true
   */
  dry_run?: boolean;
  /**
   * Two-factor authentication code (if required)
   */
  two_factor_code?: string;
}

/**
 * Instagram Non-Followers Task
 * 
 * Analyzes your Instagram following/followers to find:
 * - Non-followers: Users you follow who don't follow you back
 * - Fans: Users who follow you but you don't follow back
 * - Mutuals: Users who follow each other
 * 
 * Can optionally unfollow non-followers with configurable throttling.
 * 
 * ⚠️ WARNING: This uses Instagram's private API which is against their ToS.
 * Use at your own risk. Excessive usage may result in account restrictions.
 * 
 * @example
 * ```typescript
 * const task = new Instagram_NonFollowers_Task({
 *   username: process.env.IG_USERNAME!,
 *   password: process.env.IG_PASSWORD!,
 *   action: 'analyze',
 *   throttle_ms: 3000,
 *   output_path: './ig-analysis.json',
 *   dry_run: true
 * });
 * 
 * await task.perform_async(dao);
 * ```
 */
export class Instagram_NonFollowers_Task<T> extends Observable_Abstract_TaskBase<T> {
  private props: Instagram_NonFollowers_Task_Props;
  private ig: IgApiClient;

  constructor(props: Instagram_NonFollowers_Task_Props) {
    super();
    this.props = {
      throttle_ms: 3000,
      unfollow_throttle_ms: 10000,
      max_unfollow: 50,
      whitelist: [],
      output_path: "./instagram-non-followers.json",
      dry_run: true,
      ...props,
    };
    this.ig = new IgApiClient();
  }

  /**
   * Synchronous perform method (required by interface).
   * For Instagram API calls, use perform_async() instead.
   */
  perform(dao: Data_Interface<T>): Data_Interface<T> {
    console.warn(
      "Instagram_NonFollowers_Task.perform() is synchronous. Use perform_async() for actual Instagram API calls."
    );
    return dao;
  }

  /**
   * Main async method to perform the Instagram analysis/unfollow task.
   */
  async perform_async(dao: Data_Interface<T>): Promise<Data_Interface<T>> {
    try {
      console.log(`🔐 Logging in as ${this.props.username}...`);
      await this.login();
      console.log(`✅ Login successful!`);

      console.log(`📊 Fetching followers and following...`);
      const result = await this.analyze();

      console.log(`\n📈 Analysis Results for @${this.props.username}:`);
      console.log(`   Following: ${result.following.length}`);
      console.log(`   Followers: ${result.followers.length}`);
      console.log(`   Mutuals: ${result.mutuals.length}`);
      console.log(`   Non-followers (they don't follow back): ${result.non_followers.length}`);
      console.log(`   Fans (you don't follow back): ${result.fans.length}`);

      // Save results to file
      await this.save_results(result);
      console.log(`💾 Results saved to ${this.props.output_path}`);

      // Unfollow if requested
      if (this.props.action === "unfollow" && result.non_followers.length > 0) {
        await this.unfollow_non_followers(result.non_followers);
      }

      return dao;
    } catch (error) {
      console.error("❌ Instagram Task Error:", error);
      throw error;
    }
  }

  /**
   * Login to Instagram
   */
  private async login(): Promise<void> {
    this.ig.state.generateDevice(this.props.username);

    // Try pre-login flow (simulates real app behavior)
    try {
      await this.ig.simulate.preLoginFlow();
    } catch (e) {
      console.log("⚠️ Pre-login flow failed, continuing...");
    }

    try {
      await this.ig.account.login(this.props.username, this.props.password);
    } catch (error: any) {
      // Handle 2FA
      if (error.name === "IgCheckpointError") {
        console.log("🔐 Two-factor authentication required...");
        if (this.props.two_factor_code) {
          // Handle checkpoint challenge
          await this.ig.challenge.auto(true);
          await this.ig.challenge.sendSecurityCode(this.props.two_factor_code);
        } else {
          throw new Error(
            "Two-factor authentication required. Please provide two_factor_code in props."
          );
        }
      } else {
        throw error;
      }
    }

    // Post-login flow
    try {
      await this.ig.simulate.postLoginFlow();
    } catch (e) {
      console.log("⚠️ Post-login flow failed, continuing...");
    }
  }

  /**
   * Analyze followers/following and categorize users
   */
  private async analyze(): Promise<Instagram_NonFollowers_Result> {
    const userId = this.ig.state.cookieUserId;

    // Fetch all followers
    console.log("   Fetching followers...");
    const followers = await this.get_all_followers(userId);
    console.log(`   Found ${followers.length} followers`);

    // Fetch all following
    console.log("   Fetching following...");
    const following = await this.get_all_following(userId);
    console.log(`   Found ${following.length} following`);

    // Create sets for efficient lookup
    const followerIds = new Set(followers.map((u) => u.pk));
    const followingIds = new Set(following.map((u) => u.pk));

    // Calculate categories
    const non_followers: Instagram_User[] = [];
    const mutuals: Instagram_User[] = [];

    for (const user of following) {
      if (followerIds.has(user.pk)) {
        mutuals.push(user);
      } else {
        non_followers.push(user);
      }
    }

    const fans: Instagram_User[] = [];
    for (const user of followers) {
      if (!followingIds.has(user.pk)) {
        fans.push(user);
      }
    }

    return {
      non_followers,
      fans,
      mutuals,
      following,
      followers,
      timestamp: new Date().toISOString(),
      username: this.props.username,
    };
  }

  /**
   * Fetch all followers (paginated)
   */
  private async get_all_followers(userId: string): Promise<Instagram_User[]> {
    const followersFeed = this.ig.feed.accountFollowers(userId);
    const users: Instagram_User[] = [];

    let page = 1;
    do {
      const items = await followersFeed.items();
      users.push(...items.map(this.map_user));
      console.log(`      Page ${page}: ${items.length} followers (total: ${users.length})`);
      page++;

      if (followersFeed.isMoreAvailable()) {
        await this.throttle();
      }
    } while (followersFeed.isMoreAvailable());

    return users;
  }

  /**
   * Fetch all following (paginated)
   */
  private async get_all_following(userId: string): Promise<Instagram_User[]> {
    const followingFeed = this.ig.feed.accountFollowing(userId);
    const users: Instagram_User[] = [];

    let page = 1;
    do {
      const items = await followingFeed.items();
      users.push(...items.map(this.map_user));
      console.log(`      Page ${page}: ${items.length} following (total: ${users.length})`);
      page++;

      if (followingFeed.isMoreAvailable()) {
        await this.throttle();
      }
    } while (followingFeed.isMoreAvailable());

    return users;
  }

  /**
   * Map Instagram API user response to our simpler interface
   */
  private map_user(
    user: AccountFollowersFeedResponseUsersItem | AccountFollowingFeedResponseUsersItem
  ): Instagram_User {
    return {
      pk: String(user.pk),
      username: user.username,
      full_name: user.full_name,
      is_private: user.is_private,
      profile_pic_url: user.profile_pic_url,
    };
  }

  /**
   * Unfollow non-followers with throttling
   */
  private async unfollow_non_followers(non_followers: Instagram_User[]): Promise<void> {
    const whitelist = new Set(this.props.whitelist?.map((u) => u.toLowerCase()) || []);
    const toUnfollow = non_followers.filter(
      (u) => !whitelist.has(u.username.toLowerCase())
    );

    const limit = Math.min(toUnfollow.length, this.props.max_unfollow!);

    console.log(`\n🔄 Unfollowing ${limit} users...`);
    if (this.props.dry_run) {
      console.log("   (DRY RUN - no actual unfollowing)");
    }

    let unfollowed = 0;
    for (const user of toUnfollow.slice(0, limit)) {
      try {
        console.log(
          `   ${unfollowed + 1}/${limit}: @${user.username} (${user.full_name})`
        );

        if (!this.props.dry_run) {
          await this.ig.friendship.destroy(user.pk);
        }

        unfollowed++;

        // Throttle between unfollows
        if (unfollowed < limit) {
          await this.throttle_unfollow();
        }
      } catch (error) {
        console.error(`   ❌ Failed to unfollow @${user.username}:`, error);
      }
    }

    console.log(`\n✅ Unfollowed ${unfollowed} users`);
  }

  /**
   * Save results to JSON file
   */
  private async save_results(result: Instagram_NonFollowers_Result): Promise<void> {
    const outputPath = this.props.output_path!;
    
    // Create a summary version for the file (without full profile pics)
    const output = {
      ...result,
      non_followers: result.non_followers.map(({ pk, username, full_name, is_private }) => ({
        pk,
        username,
        full_name,
        is_private,
      })),
      fans: result.fans.map(({ pk, username, full_name, is_private }) => ({
        pk,
        username,
        full_name,
        is_private,
      })),
      mutuals: result.mutuals.map(({ pk, username, full_name, is_private }) => ({
        pk,
        username,
        full_name,
        is_private,
      })),
      // Don't save full following/followers lists to keep file smaller
      following_count: result.following.length,
      followers_count: result.followers.length,
      following: undefined,
      followers: undefined,
    };

    Filesystem.write_file(outputPath, JSON.stringify(output, null, 2));
  }

  /**
   * Throttle between API calls
   */
  private async throttle(): Promise<void> {
    const delay = this.props.throttle_ms! + Math.random() * 1000; // Add jitter
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Throttle between unfollow actions (longer delay)
   */
  private async throttle_unfollow(): Promise<void> {
    const delay = this.props.unfollow_throttle_ms! + Math.random() * 3000; // Add more jitter
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
