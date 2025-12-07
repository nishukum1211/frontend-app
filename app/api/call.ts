import { getLoginJwtToken } from "../auth/auth";
import { AppConfig } from "../config";

/**
 * Defines the possible statuses for a call request.
 */
export enum CallStatus {
  REQUESTED = "requested",
  FULFILLED = "fulfilled",
  CANCELLED = "cancelled",
}

/**
 * Defines the structure for a call request item.
 */
export interface CallRequest {
  id: string;
  paid: boolean;
  user_id: string;
  user_name: string;
  agent_id?: string;
  message: string;
  request_time: string;
  fulfilled_time?: string;
  status: CallStatus;
  remarks?: string;
}

/**
 * Provides services related to call requests for agents.
 */
export class CallService {
  /**
   * Fetches all call requests for an agent.
   * @returns {Promise<CallRequest[] | null>} A list of call requests or null if an error occurs.
   */
  public static async getAllCallRequests(): Promise<CallRequest[] | null> {
    try {
      const token = await getLoginJwtToken();
      if (!token) {
        console.error("Authentication error. Please log in again.");
        return null;
      }

      const response = await fetch(`${AppConfig.API_BASE_URL}/chat/request`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch call requests: ${response.status} ${response.statusText}`);
      }

      const requests: CallRequest[] = await response.json();
      return requests;
    } catch (error) {
      console.error("Error in CallService.getAllCallRequests:", error);
      return null;
    }
  }

  /**
   * Fetches a single call request by its ID.
   * @param {string} id - The ID of the call request to fetch.
   * @returns {Promise<CallRequest | null>} The call request object or null if an error occurs.
   */
  public static async getCallRequest(id: string): Promise<CallRequest | null> {
    try {
      const token = await getLoginJwtToken();
      if (!token) {
        console.error("Authentication error. Please log in again.");
        return null;
      }

      const response = await fetch(`${AppConfig.API_BASE_URL}/chat/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch call request: ${response.status} ${response.statusText}`);
      }

      const request: CallRequest = await response.json();
      return request;
    } catch (error) {
      console.error("Error in CallService.getCallRequest:", error);
      return null;
    }
  }

  /**
   * Marks a call request as fulfilled.
   * @param {string} id - The ID of the call request.
   * @param {string} [remarks=""] - Optional remarks for the fulfillment.
   * @returns {Promise<boolean>} True if the update was successful, false otherwise.
   */
  public static async fulfillCallRequest(id: string, remarks: string = ""): Promise<boolean> {
    try {
      const token = await getLoginJwtToken();
      if (!token) {
        console.error("Authentication error. Please log in again.");
        return false;
      }

      const response = await fetch(`${AppConfig.API_BASE_URL}/chat/fulfilled/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ remarks }),
      });

      if (!response.ok) {
        throw new Error("Fulfilling request failed with status: " + response.status);
      }
      return true;
    } catch (err) {
      console.error("Error fulfilling request:", err);
      return false;
    }
  }
}