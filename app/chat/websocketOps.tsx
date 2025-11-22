import { IMessage } from "react-native-gifted-chat";

const WEBSOCKET_URL = "wss://dev-backend-py-23809827867.us-east1.run.app/chat/ws";

type ConnectionParams = {
  userId: string;
  agentId: string;
  role: "user" | "agent";
};

type Callbacks = {
  onOpen?: () => void;
  onMessage?: (event: MessageEvent, userId?: string) => void;
  onError?: (error: Event, userId?: string) => void;
  onClose?: (event: CloseEvent, userId?: string) => void;
};

type AgentConnection = {
  ws: WebSocket;
  idleTimer: number | null;
  callbacks: Callbacks;
};

class WebSocketManager {
  private static instance: WebSocketManager;

  // Single connection for user
  private userWs: WebSocket | null = null;
  private userPingInterval: number | null = null;
  private userCallbacks: Callbacks = {};

  // Multiple connections for agent (keyed by userId)
  private agentConnections: Map<string, AgentConnection> = new Map();

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public isConnected(userId?: string, role: "user" | "agent" = "user"): boolean {
    if (role === "user") {
      return this.userWs?.readyState === WebSocket.OPEN;
    }

    if (role === "agent" && userId) {
      const conn = this.agentConnections.get(userId);
      return conn?.ws?.readyState === WebSocket.OPEN;
    }

    return false;
  }

  /** -------------------- Connect -------------------- */
  public connect(params: ConnectionParams, callbacks: Callbacks = {}): WebSocket {
    const { userId, agentId, role } = params;
    const url = `${WEBSOCKET_URL}/${userId}/${agentId}/${role}`;

    if (role === "user") {
      // User role: single persistent connection
      if (this.userWs) {
        // Already connected or connecting
        this.userCallbacks = callbacks; // update latest callbacks
        if (this.userWs.readyState === WebSocket.OPEN) {
          callbacks.onOpen?.();
        }
        return this.userWs;
      }

      this.userCallbacks = callbacks;
      this.userWs = new WebSocket(url);

      this.userWs.onopen = () => {
        console.log("User WebSocket connected.");
        this.userCallbacks.onOpen?.();
        this.startUserPing();
      };

      this.userWs.onmessage = (event) => {
        this.userCallbacks.onMessage?.(event);
      };

      this.userWs.onerror = (error) => {
        this.userCallbacks.onError?.(error);
      };

      this.userWs.onclose = (event) => {
        console.log("User WebSocket closed.");
        this.userCallbacks.onClose?.(event);
        this.stopUserPing();
        this.userWs = null;
      };

      return this.userWs;
    }

    // Agent role: multiple connections to users
    if (this.agentConnections.has(userId)) {
      const conn = this.agentConnections.get(userId)!;
      // Update callbacks
      conn.callbacks = callbacks;
      // If already open, notify immediately
      if (conn.ws.readyState === WebSocket.OPEN) {
        callbacks.onOpen?.();
      }
      return conn.ws;
    }

    const ws = new WebSocket(url);
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const startIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        console.log(`Agent idle for user ${userId} -> disconnecting.`);
        this.disconnectAgent(userId);
      }, 2 * 60 * 1000); // 2 minutes
    };

    const agentConn: AgentConnection = { ws, idleTimer, callbacks };
    this.agentConnections.set(userId, agentConn);

    ws.onopen = () => {
      console.log(`Agent WebSocket connected to user ${userId}.`);
      callbacks.onOpen?.();
      startIdle();
    };

    ws.onmessage = (event) => {
      startIdle();
      this.agentConnections.get(userId)?.callbacks.onMessage?.(event, userId);
    };

    ws.onerror = (error) => {
      this.agentConnections.get(userId)?.callbacks.onError?.(error, userId);
    };

    ws.onclose = (event) => {
      console.log(`Agent WebSocket closed for user ${userId}.`);
      this.agentConnections.get(userId)?.callbacks.onClose?.(event, userId);
      if (idleTimer) clearTimeout(idleTimer);
      this.agentConnections.delete(userId);
    };

    return ws;
  }

  /** -------------------- Send Chat -------------------- */
  public sendChat(message: IMessage, userId?: string) {
    const payload = {
      type: "chat",
      message
    };

    const msgStr = JSON.stringify(payload);
    // console.log("Sending message via WebSocket:", msgStr);

    // User connection
    if (!userId && this.userWs && this.userWs.readyState === WebSocket.OPEN) {
      this.userWs.send(msgStr);
      return;
    }

    // Agent connection
    if (userId && this.agentConnections.has(userId)) {
      const conn = this.agentConnections.get(userId)!;
      if (conn.ws.readyState === WebSocket.OPEN) {
        conn.ws.send(msgStr);
        // Reset idle timer
        if (conn.idleTimer !== null) {
          clearTimeout(conn.idleTimer);
          conn.idleTimer = setTimeout(() => this.disconnectAgent(userId), 2 * 60 * 1000);
        }
      }
    }
  }

  /** -------------------- Disconnect -------------------- */
  public disconnect(userId?: string) {
    if (!userId && this.userWs) {
      this.userWs.close();
      this.userWs = null;
      this.stopUserPing();
      return;
    }

    if (userId) {
      this.disconnectAgent(userId);
    }
  }

  private disconnectAgent(userId: string) {
    const conn = this.agentConnections.get(userId);
    if (conn) {
      conn.ws.close();
      if (conn.idleTimer !== null) clearTimeout(conn.idleTimer);
      this.agentConnections.delete(userId);
    }
  }

  /** -------------------- User Ping -------------------- */
  private startUserPing() {
    this.stopUserPing();
    this.userPingInterval = setInterval(() => {
      if (this.userWs && this.userWs.readyState === WebSocket.OPEN) {
        this.userWs.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
  }

  private stopUserPing() {
    if (this.userPingInterval !== null) {
      clearInterval(this.userPingInterval);
      this.userPingInterval = null;
    }
  }
}

export const webSocketManager = WebSocketManager.getInstance();
