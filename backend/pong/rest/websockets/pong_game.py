import json
from channels.generic.websocket import AsyncWebsocketConsumer
from collections import deque
import asyncio
import time
import random
import math
from ..serializers.game_seralizers import GameSerializer, Game
import sys
#TODO: maybe just retrieve game and modify it?
#TODO: right now I wait for both players to connect to start the game...

games = {}

#import pygame

# Constants
INPUT_MOVE_NONE = 0
INPUT_MOVE_UP = 1
INPUT_MOVE_DOWN = 2

GAME_WIDTH = 4 * 5
GAME_HEIGHT = 3 * 4
BALL_RADIUS = 0.3
PADDLE_XRADIUS = 0.2
PADDLE_YRADIUS = 1
PADDLE_XOFFSET = 0.2
PADDLE_SPEED = 15
BALL_SPEED = 8

from channels.db import database_sync_to_async

@database_sync_to_async
def fetch_game_async(game_id):
    game_db = Game.fetch_games_by_id([game_id])
    if len(game_db) != 1:
        return None
    game_db = GameSerializer(game_db[0])
    return [game_db, game_db.data['team_a'], game_db.data['team_b']]

@database_sync_to_async
def end_game_async(game_id, team_a_score, team_b_score):
    game_db = Game.fetch_games_by_id([game_id])
    if len(game_db) != 1:
        return None
    game_db = GameSerializer(game_db[0])
    game_db.end_game(team_a_score, team_b_score)

class Pong:
    def __init__(self):
        #print("Pong game init")
        self.p1_y = 0
        self.p2_y = 0
        self.p1_x = -GAME_WIDTH / 2 + PADDLE_XOFFSET + PADDLE_XRADIUS
        self.p2_x = GAME_WIDTH / 2 - PADDLE_XOFFSET - PADDLE_XRADIUS
        self.ball_x = self.ball_y = self.ball_vx = self.ball_vy = 0
        self.reset_ball()
        self.score1 = self.score2 = 0

    def reset_ball(self):
        self.ball_x = self.ball_y = 0
        self.ball_vx = 1 if random.random() > 0.5 else -1
        self.ball_vy = (random.random() - 0.5) * 2
        norm = math.sqrt(self.ball_vx ** 2 + self.ball_vy ** 2)
        self.ball_vx /= norm
        self.ball_vy /= norm

    def update(self, p1_input, p2_input, dt):
        # Update paddles
        if p1_input == INPUT_MOVE_UP:
            self.p1_y = min(self.p1_y + PADDLE_SPEED * dt, GAME_HEIGHT / 2 - PADDLE_YRADIUS)
        elif p1_input == INPUT_MOVE_DOWN:
            self.p1_y = max(self.p1_y - PADDLE_SPEED * dt, -GAME_HEIGHT / 2 + PADDLE_YRADIUS)

        if p2_input == INPUT_MOVE_UP:
            self.p2_y = min(self.p2_y + PADDLE_SPEED * dt, GAME_HEIGHT / 2 - PADDLE_YRADIUS)
        elif p2_input == INPUT_MOVE_DOWN:
            self.p2_y = max(self.p2_y - PADDLE_SPEED * dt, -GAME_HEIGHT / 2 + PADDLE_YRADIUS)

        # Update ball position
        self.ball_x += BALL_SPEED * self.ball_vx * dt
        self.ball_y += BALL_SPEED * self.ball_vy * dt

        # Ball collision with top and bottom walls
        if self.ball_y + BALL_RADIUS > GAME_HEIGHT / 2 or self.ball_y - BALL_RADIUS < -GAME_HEIGHT / 2:
            self.ball_vy = -self.ball_vy

        # Ball collision with paddles
        if (self.ball_x - BALL_RADIUS < self.p1_x + PADDLE_XRADIUS and
            self.ball_x + BALL_RADIUS > self.p1_x - PADDLE_XRADIUS and
            self.ball_y > self.p1_y - PADDLE_YRADIUS and
            self.ball_y < self.p1_y + PADDLE_YRADIUS):
            self.ball_vx = abs(self.ball_vx)
        elif (self.ball_x + BALL_RADIUS > self.p2_x - PADDLE_XRADIUS and
              self.ball_x - BALL_RADIUS < self.p2_x + PADDLE_XRADIUS and
              self.ball_y > self.p2_y - PADDLE_YRADIUS and
              self.ball_y < self.p2_y + PADDLE_YRADIUS):
            self.ball_vx = -abs(self.ball_vx)

        # Check for game over
        if self.ball_x + BALL_RADIUS > GAME_WIDTH / 2 or self.ball_x - BALL_RADIUS < -GAME_WIDTH / 2:
            if self.ball_x < 0:
                self.score2 += 1
            else:
                self.score1 += 1
            self.reset_ball()

class PongSocket(AsyncWebsocketConsumer):
    async def connect(self):
        #TODO: do a try over here...
        #TODO: if one of the users didn't connect correctly then cancel the game?

        game_id = self.scope['url_route']['kwargs']['game_id']
        
        [game_db, team_a, team_b] = await fetch_game_async(game_id)
        if game_db == None:
            await self.close(79, "Game Not Found")
            return 
        
        if not self.scope['user']:
            await self.close(code=79, reason="No User Given in Cookie")
            return

        if self.scope['user'].data['id'] != team_a[0]['id'] and self.scope['user'].data['id'] != team_b[0]['id']:
            await self.close(79, "Invalid User for Game")
            return
        
        await self.accept()
        self.input = 0
        if game_id not in games:
            games[game_id] = {'players': [], 'game': Pong()}
        if self not in games[game_id]['players']:
            games[game_id]['players'].append(self)

        if len(games[game_id]['players']) == 2:
            message = {'message': 'game_starting'}
            await games[game_id]['players'][0].send(json.dumps(message))
            await games[game_id]['players'][1].send(json.dumps(message))
            asyncio.create_task(game_loop(game_id))

    async def receive(self, text_data):
        data = json.loads(text_data)
        if 'message' in data:
            if data['message'] == "game_input":
                if 'input' in data:
                    self.input = data['input']
            elif data['message'] == "game_ping":
                if 'id' in data:
                    await self.send(json.dumps({'message': 'game_pong', 'id': data['id']}))
                    
    async def disconnect(self, close_code):
        pass

async def game_loop(game_id):
    try:
        [game_db, team_a, team_b] = await fetch_game_async(game_id)

        if game_db == None:
            #this should never happen
            #TODO: close connection with players...
            return 

        game = games[game_id]['game']
        player1 = games[game_id]['players'][0]
        player2 = games[game_id]['players'][1]
        
        game_time = 0
        
        while True:
            start_time = time.time()
            dt = 1.0 / 60

            game.update(player1.input, player2.input, dt)
            if (game.score1 >= 1 or game.score2 >= 1):
                break 
            game_time += dt
            
            state = {
                'message': 'game_state',
                'ball': {'x': game.ball_x, 'y': game.ball_y, 'vx': game.ball_vx, 'vy': game.ball_vy},
                'p1': game.p1_y,
                'p2': game.p2_y,
                'score1': game.score1,
                'score2': game.score2,
                'time': time.time()
            }
            await player1.send(text_data=json.dumps(state))
            state['p1'] = game.p2_y
            state['p2'] = game.p1_y
            state['ball']['x'] *= -1
            state['ball']['vx'] *= -1

            state['score1'] = game.score2
            state['score2'] = game.score1

            await player2.send(text_data=json.dumps(state))

            elapsed_time = time.time() - start_time
            time_to_sleep = dt - elapsed_time
            if time_to_sleep > 0:
                await asyncio.sleep(time_to_sleep)

        team_a_score = team_b_score = 0
        if team_a[0]['id'] == player1.scope['user'].data['id']:
            team_a_score = game.score1
            team_b_score = game.score2
        else:
            team_a_score = game.score2
            team_b_score = game.score1

        #game_db.end_game(game_id, team_a_score, team_b_score)
        await end_game_async(game_id, team_a_score, team_b_score)

        msg = {'message': 'game_end'}
        await player1.send(text_data=json.dumps(msg))
        await player2.send(text_data=json.dumps(msg))
        
        #TODO: check these codes
        await player1.close(code=1000)
        await player2.close(code=1000)

        if game_id in games:
            del games[game_id]
            
    except Exception as e:
        print("GAME LOOP EXCEPTION:")
        print(e)
        sys.stdout.flush()

        #TODO: cancel game? also send game_end message to players...
        if game_id in games:
            for player in games[game_id]['players']:
                await player.close(code=1000)
            del games[game_id]