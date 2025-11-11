import { SupplyChainEvent } from "./nftService";

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  relatedTokenId?: number;
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Array<(notifications: Notification[]) => void> = [];

  // Add a new notification
  addNotification(
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ): void {
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      read: false,
      ...notification,
    };

    this.notifications.unshift(newNotification);
    this.notifyListeners();
  }

  // Add a supply chain event as a notification
  addSupplyChainEventNotification(
    event: SupplyChainEvent,
    tokenId: number
  ): void {
    this.addNotification({
      type: "info",
      title: `Supply Chain Event: ${event.event}`,
      message: `${event.data} - Token #${tokenId}`,
      relatedTokenId: tokenId,
    });
  }

  // Mark a notification as read
  markAsRead(id: string): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.forEach((notification) => {
      notification.read = true;
    });
    this.notifyListeners();
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Get unread notifications
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter((n) => !n.read);
  }

  // Get notifications for a specific token
  getNotificationsForToken(tokenId: number): Notification[] {
    return this.notifications.filter((n) => n.relatedTokenId === tokenId);
  }

  // Clear all notifications
  clearNotifications(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  // Subscribe to notification updates
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.notifications);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of changes
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.notifications);
    });
  }

  // Simulate real-time events (for demo purposes)
  simulateRealTimeEvents(): void {
    setInterval(() => {
      // Randomly generate events for demo
      if (Math.random() > 0.7) {
        const events = [
          {
            event: "Product Manufactured",
            data: "New product batch created",
            tokenId: Math.floor(Math.random() * 1000) + 1000,
          },
          {
            event: "Quality Check Passed",
            data: "Product passed quality inspection",
            tokenId: Math.floor(Math.random() * 1000) + 1000,
          },
          {
            event: "Shipment Initiated",
            data: "Product shipment started",
            tokenId: Math.floor(Math.random() * 1000) + 1000,
          },
          {
            event: "Temperature Alert",
            data: "Temperature exceeded threshold",
            tokenId: Math.floor(Math.random() * 1000) + 1000,
          },
          {
            event: "Delivery Confirmed",
            data: "Product delivered to destination",
            tokenId: Math.floor(Math.random() * 1000) + 1000,
          },
        ];

        const randomEvent = events[Math.floor(Math.random() * events.length)];

        this.addNotification({
          type: randomEvent.event.includes("Alert") ? "warning" : "info",
          title: randomEvent.event,
          message: randomEvent.data,
          relatedTokenId: randomEvent.tokenId,
        });
      }
    }, 10000); // Every 10 seconds
  }
}

export default new NotificationService();
