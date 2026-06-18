import asyncio
import json
import websockets

PLAYERS = {}

async def handle_client(websocket):
    player_id = f"player_{websocket.remote_address[1]}"
    print(f"[NETWORK] New player connected: {player_id}", flush=True)
    
    try:
        async for message in websocket:
            data = json.loads(message)
            
            PLAYERS[player_id] = {
                "x": data.get("x", 0.0),
                "y": data.get("y", 0.0),
                "angle": data.get("angle", 0.0)
            }
            
            others = {pid: pdata for pid, pdata in PLAYERS.items() if pid != player_id}
            
            await websocket.send(json.dumps(others))
            
    except websockets.exceptions.ConnectionClosed:
        print(f"[NETWORK] Player disconnected: {player_id}", flush=True)
    finally:
        if player_id in PLAYERS:
            del PLAYERS[player_id]

async def main():
    server = await websockets.serve(handle_client, "localhost", 8001)
    print("[NETWORK] Server started ws://localhost:8001", flush=True)
    
    await server.wait_closed()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[NETWORK] Server stopped by user.", flush=True)