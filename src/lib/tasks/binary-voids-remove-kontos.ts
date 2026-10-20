/**
 * Instagram Export Analysis Task
 *
 * Analyzes Instagram's official data export (HTML or JSON format) to find:
 * - Non-followers: Users you follow who don't follow you back
 * - Fans: Users who follow you but you don't follow back
 * - Mutuals: Users who follow each other
 *
 * This uses the official Meta data export, which is:
 * ✅ 100% reliable (no login issues)
 * ✅ No API rate limits
 * ✅ No risk to your account
 *
 * How to get your data:
 * 1. Instagram App → Settings → Accounts Center → Your Information and Permissions
 * 2. → Download Your Information → Request a Download
 * 3. Select your Instagram account
 * 4. Choose "Some information" → select only "Followers and Following"
 * 5. Format: JSON or HTML (both supported)
 * 6. Time range: All time
 * 7. Wait for email with download link (usually within hours)
 *
 * The export contains:
 * - connections/followers_and_following/followers_1.html (or .json)
 * - connections/followers_and_following/following.html (or .json)
 *
 * @example
 * ```typescript
 * const task = new Instagram_Export_Analysis_Task({
 *   followers_path: './instagram-export/connections/followers_and_following/followers_1.html',
 *   following_path: './instagram-export/connections/followers_and_following/following.html',
 *   output_path: './non-followers-analysis.json'
 * });
 *
 * await task.perform_async(dao);
 * ```
 */

import * as fs from "fs";
import * as path from "path";
import { Observable_Abstract_TaskBase } from "./Observable_Abstract_TaskBase";
import { Data_Interface } from "../io/types";

/**
 * Instagram export entry structure (as exported by Meta)
 */
interface Instagram_Export_Entry {
  title: string;
  media_list_data: any[];
  string_list_data: Array<{
    href: string;
    value: string;
    timestamp: number;
  }>;
}

/**
 * Followers export file structure
 */
interface Instagram_Followers_Export {
  relationships_followers?: Instagram_Export_Entry[];
  // Newer format might use different key
  followers?: Instagram_Export_Entry[];
}

/**
 * Following export file structure
 */
interface Instagram_Following_Export {
  relationships_following?: Instagram_Export_Entry[];
  // Newer format might use different key
  following?: Instagram_Export_Entry[];
}

/**
 * Simplified user info extracted from export
 */
export interface Instagram_Export_User {
  username: string;
  profile_url: string;
  followed_at?: number; // timestamp when you followed them (or they followed you)
}

/**
 * Result of the export analysis
 */
export interface Instagram_Export_Analysis_Result {
  /** Timestamp of the analysis */
  timestamp: string;
  /** Path to followers file used */
  followers_file: string;
  /** Path to following file used */
  following_file: string;
  /** Total users you follow */
  following_count: number;
  /** Total users who follow you */
  followers_count: number;
  /** Users you follow who don't follow you back */
  non_followers: Instagram_Export_User[];
  /** Users who follow you but you don't follow back */
  fans: Instagram_Export_User[];
  /** Users who follow each other */
  mutuals: Instagram_Export_User[];
}

/**
 * Props for the Instagram Export Analysis Task
 */
export interface Instagram_Export_Analysis_Task_Props {
  /** Path to the followers JSON file (e.g., followers_1.json) */
  followers_path: string;
  /** Path to the following JSON file (e.g., following.json) */
  following_path: string;
  /** Output path for the analysis results */
  output_path?: string;
  /** Sort results by username (default: true) */
  sort_by_username?: boolean;
  /** Sort results by follow date (default: false) */
  sort_by_date?: boolean;
}

/**
 * Instagram Export Analysis Task
 *
 * Analyzes exported Instagram data to find non-followers, fans, and mutuals.
 */
export class Instagram_Export_Analysis_Task<T> extends Observable_Abstract_TaskBase<T> {
  private props: Instagram_Export_Analysis_Task_Props;

  constructor(props: Instagram_Export_Analysis_Task_Props) {
    super();
    this.props = {
      output_path: "./instagram-export-analysis.json",
      sort_by_username: true,
      sort_by_date: false,
      ...props,
    };
  }

  /**
   * Synchronous perform method (required by interface).
   */
  perform(dao: Data_Interface<T>): Data_Interface<T> {
    // This task can actually run synchronously since it just reads files
    try {
      const result = this.analyze();
      this.save_results(result);
      console.log(`\n✅ Analysis complete! Results saved to ${this.props.output_path}`);
    } catch (error) {
      console.error("❌ Analysis failed:", error);
    }
    return dao;
  }

  /**
   * Async version for consistency with other tasks.
   */
  async perform_async(dao: Data_Interface<T>): Promise<Data_Interface<T>> {
    return this.perform(dao);
  }

  /**
   * Parse an Instagram export file and extract usernames.
   * Supports both HTML and JSON formats.
   */
  private parse_export_file(
    filePath: string,
    type: "followers" | "following"
  ): Instagram_Export_User[] {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const isHtml = filePath.toLowerCase().endsWith(".html") || content.trim().startsWith("<");

    if (isHtml) {
      return this.parse_html_export(content, type);
    } else {
      return this.parse_json_export(content, type, filePath);
    }
  }

  /**
   * Parse HTML format export (default Instagram export format)
   */
  private parse_html_export(
    content: string,
    type: "followers" | "following"
  ): Instagram_Export_User[] {
    const users: Instagram_Export_User[] = [];

    if (type === "followers") {
      // Followers format: <a target="_blank" href="https://www.instagram.com/username">username</a>
      // Pattern: href="https://www.instagram.com/username">username</a>
      const regex = /href="https:\/\/www\.instagram\.com\/([^"/_]+)"[^>]*>([^<]+)<\/a>/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const username = match[1];
        // Skip if it's not a valid username (e.g., contains _u/ which is in following format)
        if (!username.includes("/") && username.length > 0) {
          users.push({
            username,
            profile_url: `https://www.instagram.com/${username}`,
          });
        }
      }
    } else {
      // Following format: <h2 class="...">username</h2> followed by link
      // Pattern: Find h2 with username, then extract
      const regex = /<h2[^>]*class="[^"]*_a6-h[^"]*"[^>]*>([^<]+)<\/h2>/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const username = match[1].trim();
        if (username.length > 0) {
          users.push({
            username,
            profile_url: `https://www.instagram.com/${username}`,
          });
        }
      }
    }

    return users;
  }

  /**
   * Parse JSON format export
   */
  private parse_json_export(
    content: string,
    type: "followers" | "following",
    filePath: string
  ): Instagram_Export_User[] {
    let data: any;
    
    try {
      data = JSON.parse(content);
    } catch (e) {
      throw new Error(`Invalid JSON in ${filePath}: ${e}`);
    }

    // Try different possible keys based on Instagram's export format
    let entries: Instagram_Export_Entry[] = [];

    if (type === "followers") {
      entries = data.relationships_followers || data.followers || data || [];
    } else {
      entries = data.relationships_following || data.following || data || [];
    }

    // Handle case where the file itself is an array
    if (Array.isArray(data)) {
      entries = data;
    }

    if (!Array.isArray(entries)) {
      console.warn(`⚠️ Unexpected format in ${filePath}. Keys found:`, Object.keys(data));
      return [];
    }

    return entries.map((entry) => {
      // Extract username from different possible locations
      const username = entry.title || 
                       entry.string_list_data?.[0]?.value || 
                       (entry as any).value ||
                       "unknown";
      
      const profile_url = entry.string_list_data?.[0]?.href || 
                         `https://www.instagram.com/${username}`;
      
      const timestamp = entry.string_list_data?.[0]?.timestamp;

      return {
        username,
        profile_url,
        followed_at: timestamp,
      };
    });
  }

  /**
   * Analyze the exported data
   */
  private analyze(): Instagram_Export_Analysis_Result {
    console.log(`📂 Reading followers from: ${this.props.followers_path}`);
    const followers = this.parse_export_file(this.props.followers_path, "followers");
    console.log(`   Found ${followers.length} followers`);

    console.log(`📂 Reading following from: ${this.props.following_path}`);
    const following = this.parse_export_file(this.props.following_path, "following");
    console.log(`   Found ${following.length} following`);

    // Create sets for efficient lookup
    const followerUsernames = new Set(followers.map((f) => f.username.toLowerCase()));
    const followingUsernames = new Set(following.map((f) => f.username.toLowerCase()));

    // Find non-followers: users you follow who don't follow you back
    const non_followers = following.filter(
      (user) => !followerUsernames.has(user.username.toLowerCase())
    );

    // Find fans: users who follow you but you don't follow back
    const fans = followers.filter(
      (user) => !followingUsernames.has(user.username.toLowerCase())
    );

    // Find mutuals: users who follow each other
    const mutuals = following.filter(
      (user) => followerUsernames.has(user.username.toLowerCase())
    );

    // Sort results
    const sortFn = this.props.sort_by_date
      ? (a: Instagram_Export_User, b: Instagram_Export_User) =>
          (b.followed_at || 0) - (a.followed_at || 0)
      : this.props.sort_by_username
      ? (a: Instagram_Export_User, b: Instagram_Export_User) =>
          a.username.toLowerCase().localeCompare(b.username.toLowerCase())
      : undefined;

    if (sortFn) {
      non_followers.sort(sortFn);
      fans.sort(sortFn);
      mutuals.sort(sortFn);
    }

    console.log(`\n📊 Analysis Results:`);
    console.log(`   Following: ${following.length}`);
    console.log(`   Followers: ${followers.length}`);
    console.log(`   Non-followers (they don't follow back): ${non_followers.length}`);
    console.log(`   Fans (you don't follow back): ${fans.length}`);
    console.log(`   Mutuals: ${mutuals.length}`);

    return {
      timestamp: new Date().toISOString(),
      followers_file: this.props.followers_path,
      following_file: this.props.following_path,
      following_count: following.length,
      followers_count: followers.length,
      non_followers,
      fans,
      mutuals,
    };
  }

  /**
   * Save results to JSON file
   */
  private save_results(result: Instagram_Export_Analysis_Result): void {
    const outputPath = this.props.output_path!;
    
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`💾 Results saved to ${outputPath}`);

    // Also create a simple text list of non-followers for easy copy/paste
    if (result.non_followers.length > 0) {
      const txtPath = outputPath.replace(/\.json$/, "-non-followers.txt");
      const txtContent = result.non_followers
        .map((u) => u.username)
        .join("\n");
      fs.writeFileSync(txtPath, txtContent);
      console.log(`📝 Non-followers list saved to ${txtPath}`);
    }
  }
}
