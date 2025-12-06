import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLoginJwtToken } from "../auth/auth";
import { AppConfig } from "../config";

/**
 * Defines the structure for an item that an agent can sell.
 */
export interface SellableItem {
  id: string;
  name: string;
  crops: string;
  content: string;
  desc: string;
  desc_hn: string;
  price: number;
}

const SELLABLE_ITEMS_CACHE_KEY = "sellableItems";

/**
 * Provides services related to the agent role.
 */
export class AgentService {
  /**
   * Fetches the list of all items available for an agent to sell.
   * It first tries to load from cache, unless forceRefresh is true.
   * Requires a valid agent authentication token.
   * @param {boolean} [forceRefresh=false] - If true, bypasses the cache and fetches from the server.
   * @returns {Promise<SellableItem[] | null>} A list of sellable items or null if an error occurs.
   */
  public static async getSellableItems(forceRefresh: boolean = false): Promise<SellableItem[] | null> {
    if (!forceRefresh) {
      try {
        const cachedItems = await AsyncStorage.getItem(SELLABLE_ITEMS_CACHE_KEY);
        if (cachedItems) {
          return JSON.parse(cachedItems);
        }
      } catch (error) {
        console.error("Error reading sellable items from cache:", error);
      }
    }

    try {
      const token = await getLoginJwtToken();
      if (!token) {
        console.log("No auth token found for fetching sellable items.");
        return null;
      }

      const response = await fetch(`${AppConfig.API_BASE_URL}/agent/sell/item`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Token-Source": "password",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sellable items: ${response.status} ${response.statusText}`);
      }

      const items: SellableItem[] = await response.json();
      try {
        await AsyncStorage.setItem(SELLABLE_ITEMS_CACHE_KEY, JSON.stringify(items));
      } catch (error) {
      }
      return items;
    } catch (error) {
      console.error("Error in AgentService.getSellableItems:", error);
      return null;
    }
  }

  public static async createResource(formData: FormData): Promise<boolean> {
    try {
      const token = await getLoginJwtToken();
      if (!token) {
        alert("Authentication error. Please log in again.");
        return false;
      }

      const response = await fetch(`${AppConfig.API_BASE_URL}/agent/sell/item`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type' is set automatically by browser for multipart/form-data
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed with status: " + response.status);
      }
      return true;
    } catch (err) {
      console.error("Error submitting:", err);
      return false;
    }
  }
}
