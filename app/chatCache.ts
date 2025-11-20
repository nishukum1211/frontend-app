import AsyncStorage from "@react-native-async-storage/async-storage";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { getLoginJwtToken } from "./auth";

const ALL_CHATS_STORAGE_KEY = "allChats";

type AgentChatListItem = {
  id: string;
  userName: string;
  lastMessage: string;
  all: IMessage[];
};

/**
 * Fetches all chat messages for the current user (either 'user' or 'agent')
 * and caches them in AsyncStorage.
 *
 * @param role The role of the current user, determines which endpoint to call.
 * @returns For agents, it returns the list of conversations for display. For users, it returns void.
 */
export const fetchAllChatsAndCache = async (
  role: "user" | "agent"
): Promise<AgentChatListItem[] | void> => {
  console.log(`Attempting to fetch and cache all chats for ${role}...`);
  try {
    const token = await getLoginJwtToken();
    if (!token) {
      console.log("No auth token found for fetching chats.");
      return;
    }

    const isAgent = role === "agent";
    // Agents get a list of conversations, users get all messages from all conversations.
    const url = isAgent
      ? "https://dev-backend-py-23809827867.us-east1.run.app/chat/agent/history"
      : "https://dev-backend-py-23809827867.us-east1.run.app/chat/user/history";

    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };
    if (isAgent) {
      headers["X-Token-Source"] = "password";
    } else {
      headers["X-Token-Source"] = "firebase";
    }

    const response = await fetch(url, { method: "GET", headers });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Failed to fetch all chats for ${role}:`,
        response.status,
        errorText
      );
      return;
    }

    const responseData = await response.json();

    if (isAgent) {
      const agentChatList: AgentChatListItem[] = responseData;
      const messagesToCache: Record<string, AgentChatListItem> = {};

      // For agents, iterate through each conversation and cache its messages
      agentChatList.forEach(chat => {
        if (chat && chat.id && chat.all) {
          messagesToCache[chat.id] = chat;
        }
      });

      await AsyncStorage.setItem(ALL_CHATS_STORAGE_KEY, JSON.stringify(messagesToCache));
      return agentChatList; // Return the list for the UI
    } else {


      // For users, the response is a single AgentChatListItem object, store it similarly to agents
      const userChat: AgentChatListItem = responseData;
      const messagesToCache: Record<string, AgentChatListItem> = {};

      if (userChat && userChat.id && userChat.all) {
        messagesToCache[userChat.id] = userChat;
      }
      await AsyncStorage.setItem(ALL_CHATS_STORAGE_KEY, JSON.stringify(messagesToCache));
    }
    console.log(`Successfully fetched and cached all chats for ${role}.`);
  } catch (error) {
    console.error(`Error during fetchAllChatsAndCache for ${role}:`, error);
  }
};

/**
 * Loads the cached list of agent conversations, including all details.
 */
export const loadAgentChatListFromCache = async (): Promise<AgentChatListItem[] | null
> => {
  try {
    const allChatsJSON = await AsyncStorage.getItem(ALL_CHATS_STORAGE_KEY);
    if (!allChatsJSON) return null;

    const allChats: Record<string, AgentChatListItem> = JSON.parse(allChatsJSON);
    // Convert the dictionary of chats into an array
    return Object.values(allChats);
  } catch (error) {
    console.error("Failed to load agent chat list from cache:", error);
    return null;
  }
};
/**
 * Loads all chat data from the local cache.
 * @returns {Promise<Record<string, IMessage[]> | null>} A dictionary of chat histories or null.
 */
export const loadAllChatsFromCache = async (): Promise<Record<string, AgentChatListItem> | null> => {
  try {
    const allChatsJSON = await AsyncStorage.getItem(ALL_CHATS_STORAGE_KEY);
    return allChatsJSON ? JSON.parse(allChatsJSON) : null;
  } catch (error) {
    console.error("Failed to load all chats from cache:", error);
    return null;
  }
};

/**
 * Updates the cache for a single chat conversation.
 * @param chatId The ID of the chat to update.
 * @param messages The array of new messages to append.
 */
export const updateChatCache = async (chatId: string, messages: IMessage[]) => {
  const allChats = (await loadAllChatsFromCache()) || {};
  const chatItem = allChats[chatId];

  if (chatItem) {
    const chatHistory = chatItem.all || [];
    const updatedHistory = GiftedChat.append(chatHistory, messages);
    // Update only the 'all' property with the new messages
    chatItem.all = updatedHistory;
    await AsyncStorage.setItem(ALL_CHATS_STORAGE_KEY, JSON.stringify(allChats));
  }
};