import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { MongoClient } from 'mongodb';
import { Room, type IUser, type WSClientMessage, type WSServerMessage, type IDisplayRoom, type IEquipment } from '@fractal/shared';

const PORT = process.env.PORT || 8081;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

// MongoDB Client
const mongoClient = new MongoClient(MONGODB_URI);

// Connection maps
const userSockets = new Map<string, any>(); // userId -> WebSocket
const socketUsers = new Map<any, string>(); // WebSocket -> userId
const roomMembers = new Map<string, Set<string>>(); // roomId -> Set<userId>

// Rooms
let rooms: Room[] = [];
const showingRooms = (): IDisplayRoom[] => rooms.filter(room => !room.isPrivate).map(room => room.display);

// Helper functions
function broadcastToRoom(roomId: string, message: WSServerMessage) {
  const members = roomMembers.get(roomId);
  if (!members) return;

  const msgString = JSON.stringify(message);
  for (const userId of members) {
    const socket = userSockets.get(userId);
    if (socket?.readyState === 1) {
      socket.send(msgString);
    }
  }
}

function broadcastToAll(message: WSServerMessage) {
  const msgString = JSON.stringify(message);
  for (const socket of userSockets.values()) {
    if (socket?.readyState === 1) {
      socket.send(msgString);
    }
  }
}

function broadcastToOthers(excludeUserId: string, message: WSServerMessage) {
  const msgString = JSON.stringify(message);
  for (const [userId, socket] of userSockets.entries()) {
    if (userId !== excludeUserId && socket?.readyState === 1) {
      socket.send(msgString);
    }
  }
}

function sendToUser(userId: string, message: WSServerMessage) {
  const socket = userSockets.get(userId);
  if (socket?.readyState === 1) {
    socket.send(JSON.stringify(message));
  }
}

function destroyConnection(userId: string, ws: any) {
  const room = rooms.find(r => r.players.find(p => p.id === userId));
  if (room) {
    room.leave(userId);
    roomMembers.get(room.id)?.delete(userId);

    if (room.ownerId === userId) {
      broadcastToRoom(room.id, { type: 'roomDestroyed', reason: 'Room owner left the room' });
      rooms = rooms.filter(r => r.id !== room.id);
      roomMembers.delete(room.id);
    } else {
      broadcastToRoom(room.id, { type: 'roomUpdated', data: room.serialize() });
    }
    broadcastToOthers(userId, { type: 'rooms', data: showingRooms() });
  }
}

// Main
async function main() {
  await mongoClient.connect();
  const db = mongoClient.db('fractal');
  console.log('MongoDB connected:', MONGODB_URI);

  const app = new Elysia()
    .use(cors())
    .get('/', () => 'Fractal Server (Elysia) is running')
    .ws('/ws', {
      open(ws) {
        console.log('WebSocket connected');
      },

      message(ws, rawMessage) {
        let message: WSClientMessage;
        try {
          message = typeof rawMessage === 'string' ? JSON.parse(rawMessage) : rawMessage;
        } catch {
          return;
        }

        handleMessage(ws, message, db);
      },

      close(ws) {
        const userId = socketUsers.get(ws);
        if (userId) {
          destroyConnection(userId, ws);
          userSockets.delete(userId);
          socketUsers.delete(ws);
          db.collection('users').updateOne({ id: userId }, { $set: { lastLogout: Date.now() } });
          console.log('User disconnected:', userId);
        }
      },
    })
    .listen(PORT);

  console.log(`Elysia server running on http://localhost:${PORT}`);
}

async function handleMessage(ws: any, message: WSClientMessage, db: ReturnType<typeof mongoClient.db>) {
  const userId = socketUsers.get(ws);

  switch (message.type) {
    // Connection
    case 'logined': {
      const newUserId = message.userId;

      // Kick existing connection
      const existingSocket = userSockets.get(newUserId);
      if (existingSocket && existingSocket !== ws) {
        existingSocket.send(JSON.stringify({ type: 'kick', reason: 'You are logged in from another device' }));
        destroyConnection(newUserId, existingSocket);
        socketUsers.delete(existingSocket);
      }

      // Register new connection
      userSockets.set(newUserId, ws);
      socketUsers.set(ws, newUserId);

      await db.collection('users').updateOne({ id: newUserId }, { $set: { lastLogin: Date.now() } });
      console.log('User logged in:', newUserId);
      break;
    }

    // Room System
    case 'getRooms': {
      ws.send(JSON.stringify({ type: 'rooms', data: showingRooms() }));
      break;
    }

    case 'createRoom': {
      if (message.maxPlayers < 2 || message.maxPlayers > 6) {
        ws.send(JSON.stringify({
          type: 'response',
          requestId: message.requestId,
          success: false,
          error: 'Invalid max players'
        }));
        return;
      }

      const room = new Room(message.name, message.user, message.maxPlayers, message.isPrivate);
      rooms.push(room);

      // Add user to room members
      if (!roomMembers.has(room.id)) {
        roomMembers.set(room.id, new Set());
      }
      if (userId) {
        roomMembers.get(room.id)!.add(userId);
      }

      ws.send(JSON.stringify({
        type: 'response',
        requestId: message.requestId,
        success: true,
        data: room.serialize()
      }));

      broadcastToOthers(userId || '', { type: 'rooms', data: showingRooms() });
      break;
    }

    case 'joinRoom': {
      const room = rooms.find(r => r.id === message.roomId);
      if (!room) {
        ws.send(JSON.stringify({
          type: 'response',
          requestId: message.requestId,
          success: false,
          error: 'Room not found'
        }));
        return;
      }

      if (room.isFull()) {
        ws.send(JSON.stringify({
          type: 'response',
          requestId: message.requestId,
          success: false,
          error: 'Room is full'
        }));
        return;
      }

      room.join(message.user);
      if (userId) {
        if (!roomMembers.has(room.id)) {
          roomMembers.set(room.id, new Set());
        }
        roomMembers.get(room.id)!.add(userId);
      }

      broadcastToRoom(room.id, { type: 'roomUpdated', data: room.serialize() });
      broadcastToOthers(userId || '', { type: 'rooms', data: showingRooms() });

      ws.send(JSON.stringify({
        type: 'response',
        requestId: message.requestId,
        success: true,
        data: room.serialize()
      }));
      break;
    }

    case 'leaveRoom': {
      const room = rooms.find(r => r.id === message.roomId);
      if (!room || !userId) {
        ws.send(JSON.stringify({
          type: 'response',
          requestId: message.requestId,
          success: false,
          error: 'Room not found or user not found'
        }));
        return;
      }

      room.leave(userId);
      roomMembers.get(room.id)?.delete(userId);

      if (room.ownerId === userId) {
        broadcastToRoom(room.id, { type: 'roomDestroyed', reason: 'Room owner left the room' });
        rooms = rooms.filter(r => r.id !== room.id);
        roomMembers.delete(room.id);
      } else {
        broadcastToRoom(room.id, { type: 'roomUpdated', data: room.serialize() });
      }

      broadcastToOthers(userId, { type: 'rooms', data: showingRooms() });
      ws.send(JSON.stringify({
        type: 'response',
        requestId: message.requestId,
        success: true
      }));
      break;
    }

    case 'chat': {
      const room = rooms.find(r => r.id === message.roomId);
      if (!room || !userId) return;

      const user = room.players.find(p => p.id === userId);
      if (user) {
        broadcastToRoom(room.id, { type: 'chat', message: `[${user.username}] ${message.message}` });
      }
      break;
    }

    case 'changeMap': {
      const room = rooms.find(r => r.id === message.roomId);
      if (!room || room.ownerId !== userId) return;

      room.setMap(message.map);
      broadcastToRoom(room.id, { type: 'roomUpdated', data: room.serialize() });
      broadcastToOthers(userId, { type: 'rooms', data: showingRooms() });
      break;
    }

    case 'changeMode': {
      const room = rooms.find(r => r.id === message.roomId);
      if (!room || room.ownerId !== userId) return;

      room.setMode(message.mode);
      broadcastToRoom(room.id, { type: 'roomUpdated', data: room.serialize() });
      broadcastToOthers(userId, { type: 'rooms', data: showingRooms() });
      break;
    }

    // Inventory System
    case 'equipItem': {
      if (!userId) return;

      const user = await db.collection('users').findOne({ id: userId });
      if (!user) {
        ws.send(JSON.stringify({
          type: 'response',
          requestId: message.requestId,
          success: false,
          error: 'User not found'
        }));
        return;
      }

      const item = user.items.find((i: any) => i.id === message.itemId);
      if (!item) {
        ws.send(JSON.stringify({
          type: 'response',
          requestId: message.requestId,
          success: false,
          error: 'Item not found'
        }));
        return;
      }

      const equipped = user.equipments.find((e: IEquipment) => e.slot === message.slot);
      if (equipped) {
        user.equipments = user.equipments.map((e: IEquipment) =>
          e.slot === message.slot ? { id: item.id, tag: item.tag, slot: message.slot } : e
        );
      } else {
        user.equipments.push({ id: item.id, tag: item.tag, slot: message.slot });
      }

      await db.collection('users').updateOne({ id: userId }, { $set: { equipments: user.equipments } });
      sendToUser(userId, { type: 'equipmentsUpdated', data: user.equipments });
      ws.send(JSON.stringify({
        type: 'response',
        requestId: message.requestId,
        success: true
      }));
      break;
    }

    case 'unequipItem': {
      if (!userId) return;

      const user = await db.collection('users').findOne({ id: userId });
      if (!user) {
        ws.send(JSON.stringify({
          type: 'response',
          requestId: message.requestId,
          success: false,
          error: 'User not found'
        }));
        return;
      }

      const item = user.items.find((i: any) => i.id === message.itemId);
      if (!item) {
        ws.send(JSON.stringify({
          type: 'response',
          requestId: message.requestId,
          success: false,
          error: 'Item not found'
        }));
        return;
      }

      user.equipments = user.equipments.filter((e: IEquipment) => e.id !== item.id);
      await db.collection('users').updateOne({ id: userId }, { $set: { equipments: user.equipments } });
      sendToUser(userId, { type: 'equipmentsUpdated', data: user.equipments });
      ws.send(JSON.stringify({
        type: 'response',
        requestId: message.requestId,
        success: true
      }));
      break;
    }

    // Game System (placeholder)
    case 'startGame':
    case 'gameInput': {
      // TODO: Implement game logic
      break;
    }
  }
}

main().catch(console.error);
