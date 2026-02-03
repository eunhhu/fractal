// Vector types
export type vec2 = [number, number];
export type vec3 = [number, number, number];
export type vec4 = [number, number, number, number];

// Geometry types
export interface Point {
  x: number;
  y: number;
}

export interface Bound {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Line {
  start: Point;
  end: Point;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

// Game types
export interface IEffect {
  type: string;
  options: any;
  duration: number;
}

export interface IEnvironment {
  idx: number;
  position: Point;
  scale: Point;
  hitboxScale: Point;
  isCollidable: boolean;
}

export interface IWaveEnemy {
  tag: string;
  amount: number;
  spawn: number;
  interval: number;
}

export interface IWave {
  enemies: IWaveEnemy[];
  interval: number;
}

export interface DynamicState {
  wave?: number;
  leftWaitingCooldown?: number;
  state?: 'waiting' | 'running';
  coreHealth?: number;
}

export interface Updater {
  $set?: { [key: string]: any };
  $setObj?: { [key: string]: {} };
  $addObj?: { [key: string]: {} };
  $delObj?: string[];
}

// User types
export interface IMessage {
  message: string;
  time: number;
}

export interface IRune {
  id: string;
  tag: string;
  lvl: number;
}

export interface IItem {
  id: string;
  tag: string;
  lvl: number;
  exp: number;
  skills: number[];
  runes: IRune[];
}

export interface IEquipment {
  id: string;
  tag: string;
  slot: number;
}

export interface IUser {
  id: string;
  username: string;
  password: string;
  avatar: string;
  admin: boolean;
  banned: boolean;
  lvl: number;
  exp: number;
  gem: number;
  coin: number;
  lastLogin: number;
  lastLogout: number;
  items: IItem[];
  runes: IRune[];
  equipments: IEquipment[];
  friends: string[];
  totalClear: number;
  totalFail: number;
  totalPlay: number;
  totalMobKill: number;
  totalBossKill: number;
  totalDeath: number;
  totalWin: number;
  totalLose: number;
  totalDraw: number;
  totalPvpKill: number;
  totalPvpDeath: number;
}

export interface IDisplayUser {
  id: string;
  username: string;
  avatar: string;
  lvl: number;
  equipments: IEquipment[];
}

// Room types
export interface IDisplayRoom {
  id: string;
  name: string;
  ownerName: string;
  ownerLvl: number;
  mode: number;
  map: number;
  players: number;
  maxPlayer: number;
}

export interface IRoom {
  id: string;
  name: string;
  players: IDisplayUser[];
  ownerId: string;
  maxPlayers: number;
  isPrivate: boolean;
  map: number;
  mode: number;
}

// Clan types
export interface IClan {
  id: string;
  name: string;
  description: string;
  avatar: string;
  master: string;
  submasters: string[];
  members: string[];
  lvl: number;
  exp: number;
  coin: number;
}

// Utility types
export type KeystringAny = { [key: string]: any };
export type KeystringString = { [key: string]: string };
export type KeystringNumber = { [key: string]: number };
export type KeystringBoolean = { [key: string]: boolean };
