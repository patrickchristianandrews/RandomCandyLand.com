import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { ChaosGameState, ChaosPlayer, ChaosCard } from '../types/candyChaos';
import { ABSURD_CHAOS_CARDS, createDefaultAiPlayers } from '../utils/candyChaosEngine';

interface RoomSession {
  state: ChaosGameState;
  clients: Map<string, WebSocket>; // playerId -> socket
  lastActive: number;
}

const rooms = new Map<string, RoomSession>();

const ROOM_WORDS = ['SUGR', 'CHOC', 'YUMM', 'LPOP', 'GUMM', 'JELL', 'TACO', 'MINT'];

function generateRoomCode(): string {
  const word = ROOM_WORDS[Math.floor(Math.random() * ROOM_WORDS.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${word}${num}`;
}

export function createRoom(hostPlayerName: string = 'Host'): { roomId: string; state: ChaosGameState } {
  const roomId = generateRoomCode();
  const hostPlayer: ChaosPlayer = {
    id: `p_host_${Date.now()}`,
    name: hostPlayerName,
    characterId: 'trumpagotchi',
    tileIndex: 0,
    sugarGems: 100,
    isHost: true,
    isAi: false,
    isConnected: true,
    score: 0,
    shieldActive: false,
  };

  const initialAi = createDefaultAiPlayers().slice(0, 2);

  const state: ChaosGameState = {
    roomId,
    phase: 'LOBBY',
    players: [hostPlayer, ...initialAi],
    currentTurnPlayerId: hostPlayer.id,
    turnNumber: 1,
    lastDiceRoll: null,
    activeCard: null,
    lastAnnouncement: 'Welcome to Sugar Chaos 3D! Scan the QR code with your phone to join as a player!',
    cannonTargetId: null,
    winnerPlayerId: null,
  };

  rooms.set(roomId, {
    state,
    clients: new Map(),
    lastActive: Date.now(),
  });

  return { roomId, state };
}

export function getRoom(roomId: string): ChaosGameState | null {
  const session = rooms.get(roomId.toUpperCase());
  return session ? session.state : null;
}

export function setupChaosWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws/chaos' });

  wss.on('connection', (ws: WebSocket) => {
    let currentRoomId = '';
    let currentPlayerId = '';

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        const { type, roomId, playerId } = data;

        if (type === 'JOIN_ROOM') {
          const code = (roomId || '').toUpperCase();
          let session = rooms.get(code);
          if (!session) {
            // Create on the fly if joined directly via QR code
            const created = createRoom(data.playerName || 'Player');
            session = rooms.get(created.roomId)!;
            currentRoomId = created.roomId;
          } else {
            currentRoomId = code;
          }

          currentPlayerId = playerId || `p_${Date.now()}`;
          const existing = session.state.players.find(p => p.id === currentPlayerId);

          if (!existing) {
            const newPlayer: ChaosPlayer = {
              id: currentPlayerId,
              name: data.playerName || `Player ${session.state.players.length + 1}`,
              characterId: data.characterId || 'skittle',
              tileIndex: 0,
              sugarGems: 100,
              isHost: session.state.players.length === 0,
              isAi: false,
              isConnected: true,
              score: 0,
              shieldActive: false,
            };
            session.state.players.push(newPlayer);
          } else {
            existing.isConnected = true;
          }

          session.clients.set(currentPlayerId, ws);
          session.lastActive = Date.now();
          broadcastState(session);
        }

        if (type === 'START_GAME' && currentRoomId) {
          const session = rooms.get(currentRoomId);
          if (session) {
            session.state.phase = 'ROLLING';
            session.state.lastAnnouncement = 'The game has begun! Roll the 3D dice to advance through Candy Land!';
            broadcastState(session);
          }
        }

        if (type === 'ROLL_DICE' && currentRoomId) {
          const session = rooms.get(currentRoomId);
          if (session) {
            const roll = Math.floor(Math.random() * 6) + 1;
            session.state.lastDiceRoll = roll;

            const player = session.state.players.find(p => p.id === session.state.currentTurnPlayerId);
            if (player) {
              const prevTile = player.tileIndex;
              const nextTile = Math.min(29, prevTile + roll);
              player.tileIndex = nextTile;
              player.sugarGems += roll * 5;

              if (nextTile >= 29) {
                // Victory at the Candy Castle!
                session.state.phase = 'VICTORY';
                session.state.winnerPlayerId = player.id;
                session.state.lastAnnouncement = `👑 VICTORY! ${player.name} has conquered the King's Candy Castle!`;
              } else {
                session.state.phase = 'CARD_EVENT';
                const card = ABSURD_CHAOS_CARDS[Math.floor(Math.random() * ABSURD_CHAOS_CARDS.length)];
                session.state.activeCard = card;
                session.state.lastAnnouncement = `${player.name} rolled a ${roll}! Card drawn: "${card.title}" - ${card.whatAnnouncement}`;

                // Apply card deltas
                player.tileIndex = Math.max(0, Math.min(29, player.tileIndex + card.moveDelta));
                player.sugarGems = Math.max(0, player.sugarGems + card.gemDelta);

                if (card.specialAction === 'SWAP_LEADER') {
                  const sorted = [...session.state.players].sort((a, b) => b.tileIndex - a.tileIndex);
                  const leader = sorted[0];
                  if (leader && leader.id !== player.id) {
                    const temp = player.tileIndex;
                    player.tileIndex = leader.tileIndex;
                    leader.tileIndex = temp;
                  }
                }
              }

              // Advance turn to next player
              const pIdx = session.state.players.findIndex(p => p.id === session.state.currentTurnPlayerId);
              const nextPlayer = session.state.players[(pIdx + 1) % session.state.players.length];
              session.state.currentTurnPlayerId = nextPlayer.id;
              session.state.turnNumber += 1;
            }

            broadcastState(session);
          }
        }

        if (type === 'FIRE_CANNON' && currentRoomId) {
          const session = rooms.get(currentRoomId);
          if (session) {
            const target = session.state.players.find(p => p.id === data.targetId);
            if (target) {
              target.tileIndex = Math.max(0, target.tileIndex - 3);
              session.state.lastAnnouncement = `💥 BOOM! Gummy Cannon blast knocked ${target.name} back 3 spaces!`;
              broadcastState(session);
            }
          }
        }

        if (type === 'TAUNT' && currentRoomId) {
          const session = rooms.get(currentRoomId);
          if (session) {
            broadcast(session, { type: 'AUDIO_TAUNT', soundId: data.soundId, fromName: data.fromName });
          }
        }
      } catch (err) {
        console.error('Error handling WebSocket message in Chaos room', err);
      }
    });

    ws.on('close', () => {
      if (currentRoomId && currentPlayerId) {
        const session = rooms.get(currentRoomId);
        if (session) {
          session.clients.delete(currentPlayerId);
          const p = session.state.players.find(x => x.id === currentPlayerId);
          if (p) p.isConnected = false;
          broadcastState(session);
        }
      }
    });
  });

  console.log('Candy Land Sugar Chaos 3D WebSocket server mounted on /ws/chaos');
}

function broadcastState(session: RoomSession) {
  const payload = JSON.stringify({
    type: 'STATE_UPDATE',
    state: session.state,
  });

  session.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

function broadcast(session: RoomSession, obj: any) {
  const payload = JSON.stringify(obj);
  session.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
