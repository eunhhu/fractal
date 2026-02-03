import type { IUser, IRoom, IDisplayRoom, IEquipment } from './types';

// ============================================
// Client → Server Messages
// ============================================

export type WSClientMessage =
  // Connection
  | { type: 'logined'; userId: string }

  // Room System
  | { type: 'getRooms' }
  | { type: 'createRoom'; user: IUser; name: string; maxPlayers: number; isPrivate: boolean; requestId: string }
  | { type: 'joinRoom'; roomId: string; user: IUser; requestId: string }
  | { type: 'leaveRoom'; roomId: string; requestId: string }
  | { type: 'chat'; roomId: string; message: string }
  | { type: 'changeMap'; roomId: string; map: number }
  | { type: 'changeMode'; roomId: string; mode: number }

  // Inventory System
  | { type: 'equipItem'; itemId: string; slot: number; requestId: string }
  | { type: 'unequipItem'; itemId: string; requestId: string }

  // Game System
  | { type: 'gameInput'; roomId: string; input: GameInput }
  | { type: 'startGame'; roomId: string; requestId: string };

// ============================================
// Server → Client Messages
// ============================================

export type WSServerMessage =
  // Connection
  | { type: 'kick'; reason: string }
  | { type: 'connected' }

  // Room System
  | { type: 'rooms'; data: IDisplayRoom[] }
  | { type: 'roomUpdated'; data: IRoom }
  | { type: 'roomDestroyed'; reason: string }
  | { type: 'chat'; message: string }

  // Inventory System
  | { type: 'equipmentsUpdated'; data: IEquipment[] }

  // Game System
  | { type: 'gameState'; data: GameState }
  | { type: 'gameStarted'; roomId: string }
  | { type: 'gameEnded'; roomId: string; result: GameResult }

  // Generic response for requestId-based operations
  | { type: 'response'; requestId: string; success: boolean; error?: string; data?: any };

// ============================================
// Game Types
// ============================================

export interface GameInput {
  keys: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
  mouse: {
    x: number;
    y: number;
    left: boolean;
    right: boolean;
  };
  actions: string[];
}

export interface GameState {
  tick: number;
  entities: EntityState[];
  projectiles: ProjectileState[];
  structures: StructureState[];
  dynamicState: DynamicStateData;
}

export interface EntityState {
  id: string;
  tag: string;
  position: [number, number];
  velocity: [number, number];
  rotation: number;
  scale: [number, number];
  health: number;
  state: string;
}

export interface ProjectileState {
  id: string;
  tag: string;
  position: [number, number];
  velocity: [number, number];
  rotation: number;
  scale: [number, number];
  health: number;
  damage: number;
}

export interface StructureState {
  id: string;
  tag: string;
  position: [number, number];
  scale: [number, number];
  rotation: number;
  health: number;
  state: string;
}

export interface DynamicStateData {
  wave?: number;
  leftWaitingCooldown?: number;
  state?: 'waiting' | 'running';
  coreHealth?: number;
}

export interface GameResult {
  winner?: string;
  stats: {
    playerId: string;
    kills: number;
    deaths: number;
    damage: number;
  }[];
}

// ============================================
// Helper Types
// ============================================

export type MessageType<T extends WSClientMessage | WSServerMessage> = T['type'];

export function createClientMessage<T extends WSClientMessage>(message: T): T {
  return message;
}

export function createServerMessage<T extends WSServerMessage>(message: T): T {
  return message;
}
