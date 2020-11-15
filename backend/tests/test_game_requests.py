from fastapi.testclient import TestClient

from app.main import app


class TestRequests:
    def setup_class(self):
        self.clients = [
            TestClient(app),
            TestClient(app),
            TestClient(app),
            TestClient(app),
        ]
        self.players = [
            {
                "username": "Thilo",
                "password": "AAAA",
            },
            {
                "username": "Lara",
                "password": "BBBB",
            },
            {
                "username": "Bibi",
                "password": "CCCC",
            },
            {
                "username": "Bene",
                "password": "DDDD",
            },
        ]
        self.game_ids = []
        self.cards = []

    def test_create_users(self):
        for player in self.players:
            res = self.clients[0].post("v1/create_user", json=player)
            assert res.status_code == 200
            assert "uid" in res.json()
            assert res.json()["username"] == player["username"]
            player["uid"] = res.json()["uid"]

    def test_login_users(self):
        for i, client in enumerate(self.clients):
            res = client.post("v1/token", data=self.players[i])
            assert res.status_code == 200
            assert "access_token" in res.json()
            assert "token_type" in res.json()
            assert res.json()["token_type"] == "bearer"

            token = res.json()["access_token"]
            self.clients[i].headers.update({"Authorization": f"Bearer {token}"})

    def test_request_initialize_game(self):
        res = self.clients[0].post("v1/games?seed=1", json="test_game")
        assert res.status_code == 200
        assert type(res.json()["game_token"]) == str
        self.game_token = res.json()["game_token"]
        self.game_ids += [res.json()["game_id"]]

    def test_join_game(self):
        for i, client in enumerate(self.clients[1:]):

            res = client.post(f"v1/games/{self.game_ids[0]}/join")
            assert res.status_code == 200

    def test_request_get_game_list(self):
        res = self.clients[0].get("v1/games")

        assert res.status_code == 200
        assert len(res.json()) == 1
        for idx, game_id in enumerate(self.game_ids):
            assert game_id == res.json()[idx]["game_id"]

    def test_get_individual_game_data(self):
        res = self.clients[0].get(f"v1/games/{self.game_ids[0]}", json=self.players[0])
        assert res.status_code == 200

        assert res.json()["game_id"] == self.game_ids[0]
        assert len(res.json()["players"]) == len(res.json()["order"])
        assert res.json()["active_player_index"] == 0

    def test_change_team(self):
        res = self.clients[0].post(
            f"v1/games/{self.game_ids[0]}/teams",
            json=[self.players[i] for i in [0, 2, 1, 3]],
        )
        assert res.status_code == 200
        assert res.json()["order"] == [self.players[i]["uid"] for i in [0, 2, 1, 3]]

        # reset the game order
        res = self.clients[0].post(
            f"v1/games/{self.game_ids[0]}/teams",
            json=[self.players[i] for i in [0, 1, 2, 3]],
        )

    def test_start_game_and_check_cards(self):
        res = self.clients[0].post(f"v1/games/{self.game_ids[0]}/start")

        assert res.status_code == 200

        for i in range(4):
            for j in range(4):
                assert (
                    res.json()["players"][self.players[i]["uid"]]["marbles"][j][
                        "position"
                    ]
                    == -i * 4 - j - 1
                )

        res = self.clients[0].get(
            f"v1/games/{self.game_ids[0]}/cards",
        )
        assert res.status_code == 200
        assert res.json()["uid"] == "2"
        assert res.json()["hand"][0]["uid"] == 99
        self.cards.append(res.json()["hand"])

        for i in range(1, 4):
            res = self.clients[i].get(f"v1/games/{self.game_ids[0]}/cards")
            assert res.status_code == 200

            self.cards.append(res.json()["hand"])

    def test_swap_cards(self):
        res = self.clients[0].post(
            f"v1/games/{self.game_ids[0]}/swap_cards", json=self.cards[0][0]
        )
        assert res.status_code == 200

        for i in range(1, 4):
            res = self.clients[i].post(
                f"v1/games/{self.game_ids[0]}/swap_cards", json=self.cards[i][0]
            )
            assert res.status_code == 200

        for i in range(4):
            res = self.clients[i].get(f"v1/games/{self.game_ids[0]}/cards")
            assert res.status_code == 200
            self.cards[i] = res.json()["hand"]
            assert len(self.cards[i]) == 6

        assert any([card["uid"] == 99 for card in self.cards[2]])

    """
    Cards at this point given seed 1
    [
        [ # player 0
            {'uid': 84, 'value': '4', 'color': 'hearts', 'actions': [-4, 4]}, 
            {'uid': 68, 'value': '6', 'color': 'hearts', 'actions': [6]}, 
            {'uid': 10, 'value': 'K', 'color': 'diamonds', 'actions': [0, 13]}, 
            {'uid': 105, 'value': 'Jo', 'color': 'Jo', 'actions': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 'switch', -4]}, 
            {'uid': 9, 'value': 'K', 'color': 'clubs', 'actions': [0, 13]}, 
            {'uid': 89, 'value': '3', 'color': 'clubs', 'actions': [3]}
        ], 
        [ # player 1
            {'uid': 92, 'value': '3', 'color': 'hearts', 'actions': [3]}, 
            {'uid': 88, 'value': '3', 'color': 'clubs', 'actions': [3]}, 
            {'uid': 4, 'value': 'A', 'color': 'hearts', 'actions': [0, 1, 11]}, 
            {'uid': 73, 'value': '5', 'color': 'clubs', 'actions': [5]}, 
            {'uid': 33, 'value': '10', 'color': 'clubs', 'actions': [10]}, 
            {'uid': 5, 'value': 'A', 'color': 'hearts', 'actions': [0, 1, 11]}
        ], 
        [ # player 2
            {'uid': 87, 'value': '4', 'color': 'spades', 'actions': [-4, 4]}, 
            {'uid': 52, 'value': '8', 'color': 'hearts', 'actions': [8]}, 
            {'uid': 38, 'value': '10', 'color': 'spades', 'actions': [10]}, 
            {'uid': 43, 'value': '9', 'color': 'diamonds', 'actions': [9]}, 
            {'uid': 20, 'value': 'Q', 'color': 'hearts', 'actions': [12]}, 
            {'uid': 99, 'value': '2', 'color': 'diamonds', 'actions': [2]}
        ], 
        [ # player 3
            {'uid': 74, 'value': '5', 'color': 'diamonds', 'actions': [5]}, 
            {'uid': 16, 'value': 'Q', 'color': 'clubs', 'actions': [12]}, 
            {'uid': 14, 'value': 'K', 'color': 'spades', 'actions': [0, 13]}, 
            {'uid': 36, 'value': '10', 'color': 'hearts', 'actions': [10]}, 
            {'uid': 59, 'value': '7', 'color': 'diamonds', 'actions': [7]}, 
            {'uid': 78, 'value': '5', 'color': 'spades', 'actions': [5]}
        ]
    ]
    """

    def test_0_player_0_moves_from_house(self):
        # player 0 makes a move
        res = self.clients[0].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 10,
                    "value": "K",
                    "color": "diamonds",
                    "actions": [0, 13],
                },
                "action": 0,
                "mid": 0,
            },
        )

        print(res.json())
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[0]["uid"]]["marbles"][0]["position"] == 0
        )

    def test_1_player_1_moves_from_house(self):
        # player 1 makes a move
        res = self.clients[1].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 4,
                    "value": "A",
                    "color": "hearts",
                    "actions": [0, 1, 11],
                },
                "action": 0,
                "mid": 4,
            },
        )
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[1]["uid"]]["marbles"][0]["position"]
            == 16
        )

    def test_2_player_2_folds(self):
        # player 2 has to fold
        res = self.clients[2].post(f"v1/games/{self.game_ids[0]}/fold")
        assert res.json()["hand"] == []

    def test_3_player_3_moves_from_house(self):
        # player 3 makes a move
        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 14,
                    "value": "K",
                    "color": "spades",
                    "actions": [0, 13],
                },
                "action": 0,
                "mid": 12,
            },
        )

        assert (
            res.json()["players"][self.players[3]["uid"]]["marbles"][0]["position"]
            == 48
        )

        """
        Current state of game
        [
            {
                'uid': 'AAAA', 
                'name': 'Thilo', 
                'marbles': [
                    {'mid': 0, 'position': 0, 'color': None}, 
                    {'mid': 1, 'position': -1, 'color': None}, 
                    {'mid': 2, 'position': -1, 'color': None}, 
                    {'mid': 3, 'position': -1, 'color': None}
                ]
            }, 
            {
                'uid': 'BBBB', 
                'name': 'Lara', 
                'marbles': [
                    {'mid': 4, 'position': 16, 'color': None}, 
                    {'mid': 5, 'position': -1, 'color': None}, 
                    {'mid': 6, 'position': -1, 'color': None}, 
                    {'mid': 7, 'position': -1, 'color': None}
                ]
            }, 
            {
                'uid': 'CCCC', 
                'name': 'Bibi', 
                'marbles': [
                    {'mid': 8, 'position': -1, 'color': None}, 
                    {'mid': 9, 'position': -1, 'color': None}, 
                    {'mid': 10, 'position': -1, 'color': None}, 
                    {'mid': 11, 'position': -1, 'color': None}
                ]
            }, 
            {
                'uid': 'DDDD', 
                'name': 'Bene', 
                'marbles': [
                    {'mid': 12, 'position': 48, 'color': None}, 
                    {'mid': 13, 'position': -1, 'color': None}, 
                    {'mid': 14, 'position': -1, 'color': None}, 
                    {'mid': 15, 'position': -1, 'color': None}
                ]
            }
        ]
        """

    def test_4_player_0_moves_back_four(self):
        res = self.clients[0].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 84,
                    "value": "4",
                    "color": "hearts",
                    "actions": [-4, 4],
                },
                "action": -4,
                "mid": 0,
            },
        )

        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[0]["uid"]]["marbles"][0]["position"]
            == 60
        )

    def test_5_player_1_moves_up_three(self):
        res = self.clients[1].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 92, "value": "3", "color": "hearts", "actions": [3]},
                "action": 3,
                "mid": 4,
            },
        )

        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[1]["uid"]]["marbles"][0]["position"]
            == 19
        )

        """
        {
            'game_id': 'MQLS', 
            'game_name': 'test_game', 
            'host': {
                'uid': 'AAAA', 'name': 'Thilo', 'marbles': []
                }, 
            'game_state': 2, 
            'round_state': 3, 
            'round_turn': 0, 
            'order': ['AAAA', 'BBBB', 'CCCC', 'DDDD'], 
            'active_player_index': 3, 
            'players': {
                'AAAA': {
                    'uid': 'AAAA', 'name': 'Thilo', 
                    'marbles': [
                        {'mid': 0, 'position': 60, 'color': 'red'}, 
                        {'mid': 1, 'position': -2, 'color': 'red'}, 
                        {'mid': 2, 'position': -3, 'color': 'red'}, 
                        {'mid': 3, 'position': -4, 'color': 'red'}
                    ]
                }, 
                'BBBB': {
                    'uid': 'BBBB', 'name': 'Lara', 
                    'marbles': [
                        {'mid': 4, 'position': 19, 'color': 'yellow'}, 
                        {'mid': 5, 'position': -6, 'color': 'yellow'}, 
                        {'mid': 6, 'position': -7, 'color': 'yellow'}, 
                        {'mid': 7, 'position': -8, 'color': 'yellow'}
                    ]
                }, 
                'CCCC': {
                    'uid': 'CCCC', 'name': 'Bibi', 
                    'marbles': [
                        {'mid': 8, 'position': -9, 'color': 'green'}, 
                        {'mid': 9, 'position': -10, 'color': 'green'}, 
                        {'mid': 10, 'position': -11, 'color': 'green'}, 
                        {'mid': 11, 'position': -12, 'color': 'green'}
                    ]
                }, 
                'DDDD': {
                    'uid': 'DDDD', 'name': 'Bene', 
                    'marbles': [
                        {'mid': 12, 'position': 48, 'color': 'blue'}, 
                        {'mid': 13, 'position': -14, 'color': 'blue'}, 
                        {'mid': 14, 'position': -15, 'color': 'blue'}, 
                        {'mid': 15, 'position': -16, 'color': 'blue'}
                    ]
                }
            }
        }
        """

    def test_6_player_3_moves_up_12_and_kicks_player_0(self):
        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 16, "value": "Q", "color": "clubs", "actions": [12]},
                "action": 12,
                "mid": 12,
            },
        )

        assert (
            res.json()["players"][self.players[3]["uid"]]["marbles"][0]["position"]
            == 60
        )
        assert (
            res.json()["players"][self.players[0]["uid"]]["marbles"][0]["position"]
            == -1
        )

    def test_7_player_0_moves_from_house(self):
        res = self.clients[0].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 9, "value": "K", "color": "clubs", "actions": [0, 13]},
                "action": 0,
                "mid": 1,
            },
        )

        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[0]["uid"]]["marbles"][1]["position"] == 0
        )

    def test_8_player_1_bad_request(self):
        # make bad request by trying to start a marble which is not in a starting postion
        res = self.clients[1].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 5,
                    "value": "A",
                    "color": "hearts",
                    "actions": [0, 1, 11],
                },
                "action": 0,
                "mid": 4,
            },
        )
        assert res.status_code == 400

    def test_10_player_1_moves_from_house(self):
        res = self.clients[1].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 5,
                    "value": "A",
                    "color": "hearts",
                    "actions": [0, 1, 11],
                },
                "action": 0,
                "mid": 5,
            },
        )

        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[1]["uid"]]["marbles"][0]["position"]
            == 19
        )
        assert (
            res.json()["players"][self.players[1]["uid"]]["marbles"][1]["position"]
            == 16
        )

    def test_11_player_3_marble_blocked(self):
        # bad request should fail as there is a marble blocking
        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 78, "value": "5", "color": "spades", "actions": [5]},
                "action": 5,
                "mid": 12,
            },
        )
        assert res.status_code == 400

    def test_12_player_3_folds(self):
        # player 3 has to fold as he has no viable cards
        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/fold",
            json=self.players[3],
        )
        assert res.status_code == 200
        assert res.json()["hand"] == []

    def test_13_player_0_moves_back_four(self):
        res = self.clients[0].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 105,
                    "value": "Jo",
                    "color": "Jo",
                    "actions": [
                        0,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11,
                        12,
                        13,
                        "switch",
                        -4,
                    ],
                },
                "action": -4,
                "mid": 1,
            },
        )

        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[0]["uid"]]["marbles"][1]["position"]
            == 60
        )

    def test_14_player_1_kicks_himself(self):
        # player 1 decides to kick his own marble at position 19
        res = self.clients[1].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 88, "value": "3", "color": "clubs", "actions": [3]},
                "action": 3,
                "mid": 5,
            },
        )
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[1]["uid"]]["marbles"][0]["position"]
            == -5
        )
        assert (
            res.json()["players"][self.players[1]["uid"]]["marbles"][1]["position"]
            == 19
        )

    def test_15_player_0_moves_to_home(self):
        # player 0 moves 6 steps ahead, thereby entering his own goal
        res = self.clients[0].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 68, "value": "6", "color": "hearts", "actions": [6]},
                "action": 6,
                "mid": 1,
            },
        )

        assert res.status_code == 200
        # should be 1001
        assert (
            res.json()["players"][self.players[0]["uid"]]["marbles"][1]["position"]
            == 1001
        )

        # player 0 and 1 fold. this should not be possible, but I
        # haven't implemented a check whether a player still has
        # playable cards
        #
        # also its easier this way as I don't have to write more
        # requests to finish this round

    def test_16_player_1_folds(self):
        # player 1 folds
        res = self.clients[1].post(f"v1/games/{self.game_ids[0]}/fold")
        assert res.status_code == 200

    def test_17_player_0_folds(self):
        # player 0 folds
        res = self.clients[0].post(
            f"v1/games/{self.game_ids[0]}/fold",
        )

        assert res.status_code == 200

    def test_18_player_0_view_cards(self):
        # player 0 requests to view his new cards
        res = self.clients[0].get(f"v1/games/{self.game_ids[0]}/cards")

        assert res.status_code == 200
        assert len(res.json()["hand"]) == 5
        self.cards[0] = res.json()["hand"]
        """ Player 0
        'hand': 
            [
                {'uid': 23, 'value': 'Q', 'color': 'spades', 'actions': [12]}, 
                {'uid': 50, 'value': '8', 'color': 'diamonds', 'actions': [8]}, 
                {'uid': 24, 'value': 'Ja', 'color': 'clubs', 'actions': ['switch']}, 
                {'uid': 22, 'value': 'Q', 'color': 'spades', 'actions': [12]}, 
                {'uid': 66, 'value': '6', 'color': 'diamonds', 'actions': [6]}
            ], 
        'marbles': 
            [
                {'mid': 0, 'position': -1, 'color': 'red'}, 
                {'mid': 1, 'position': 1002, 'color': 'red'}, 
                {'mid': 2, 'position': -3, 'color': 'red'}, 
                {'mid': 3, 'position': -4, 'color': 'red'}
            ]
        """

    def test_19_player_1_view_cards(self):
        # player 1 requests to view his new cards
        res = self.clients[1].get(
            f"v1/games/{self.game_ids[0]}/cards",
            json=self.players[1],
        )

        assert res.status_code == 200
        assert len(res.json()["hand"]) == 5
        self.cards[1] = res.json()["hand"]

        """ Player 1
        'hand': 
            [
                {'uid': 109, 'value': 'Jo', 'color': 'Jo', 'actions': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 'switch', -4]}, 
                {'uid': 39, 'value': '10', 'color': 'spades', 'actions': [10]}, 
                {'uid': 71, 'value': '6', 'color': 'spades', 'actions': [6]}, 
                {'uid': 94, 'value': '3', 'color': 'spades', 'actions': [3]}, 
                {'uid': 91, 'value': '3', 'color': 'diamonds', 'actions': [3]}
            ], 
        'marbles': 
            [
                {'mid': 4, 'position': -5, 'color': 'yellow'}, 
                {'mid': 5, 'position': 19, 'color': 'yellow'}, 
                {'mid': 6, 'position': -7, 'color': 'yellow'}, 
                {'mid': 7, 'position': -8, 'color': 'yellow'}
            ]
        """

    def test_20_player_2_view_cards(self):
        # player 1 requests to view his new cards
        res = self.clients[2].get(f"v1/games/{self.game_ids[0]}/cards")

        assert res.status_code == 200
        assert len(res.json()["hand"]) == 5
        self.cards[2] = res.json()["hand"]

    """ Player 2
    'hand': 
        [
            {'uid': 103, 'value': '2', 'color': 'spades', 'actions': [2]}, 
            {'uid': 30, 'value': 'Ja', 'color': 'spades', 'actions': ['switch']}, 
            {'uid': 70, 'value': '6', 'color': 'spades', 'actions': [6]}, 
            {'uid': 25, 'value': 'Ja', 'color': 'clubs', 'actions': ['switch']}, 
            {'uid': 90, 'value': '3', 'color': 'diamonds', 'actions': [3]}
        ], 
    'marbles': 
        [
            {'mid': 8, 'position': -9, 'color': 'green'}, 
            {'mid': 9, 'position': -10, 'color': 'green'}, 
            {'mid': 10, 'position': -11, 'color': 'green'}, 
            {'mid': 11, 'position': -12, 'color': 'green'}
        ]
    """

    def test_21_player_3_view_cards(self):
        # player 1 requests to view his new cards
        res = self.clients[3].get(f"v1/games/{self.game_ids[0]}/cards")

        assert res.status_code == 200
        assert len(res.json()["hand"]) == 5
        self.cards[3] = res.json()["hand"]

        """ Player 3
        'hand': 
            [
                {'uid': 31, 'value': 'Ja', 'color': 'spades', 'actions': ['switch']}, 
                {'uid': 64, 'value': '6', 'color': 'clubs', 'actions': [6]}, 
                {'uid': 61, 'value': '7', 'color': 'hearts', 'actions': [7]},
                {'uid': 19, 'value': 'Q', 'color': 'diamonds', 'actions': [12]}, 
                {'uid': 95, 'value': '3', 'color': 'spades', 'actions': [3]}
            ], 
        'marbles': 
            [
                {'mid': 12, 'position': -13, 'color': 'blue'}, 
                {'mid': 13, 'position': -14, 'color': 'blue'}, 
                {'mid': 14, 'position': -15, 'color': 'blue'}, 
                {'mid': 15, 'position': -16, 'color': 'blue'}
            ]
        """

    def test_22_swap_cards_round_2(self):
        res = self.clients[0].post(
            f"v1/games/{self.game_ids[0]}/swap_cards", json=self.cards[0][0]
        )
        assert res.status_code == 200

        for i in range(1, 4):
            res = self.clients[i].post(
                f"v1/games/{self.game_ids[0]}/swap_cards", json=self.cards[i][0]
            )
            assert res.status_code == 200

        for i in range(4):
            res = self.clients[i].get(f"v1/games/{self.game_ids[0]}/cards")
            assert res.status_code == 200
            self.cards[i] = res.json()["hand"]
            assert len(self.cards[i]) == 5

        """
        [
            {'uid': 50, 'value': '8', 'color': 'diamonds', 'actions': [8]}, 
            {'uid': 24, 'value': 'Ja', 'color': 'clubs', 'actions': ['switch']}, 
            {'uid': 22, 'value': 'Q', 'color': 'spades', 'actions': [12]}, 
            {'uid': 66, 'value': '6', 'color': 'diamonds', 'actions': [6]}, 
            {'uid': 103, 'value': '2', 'color': 'spades', 'actions': [2]}
        ], 
        [
            {'uid': 39, 'value': '10', 'color': 'spades', 'actions': [10]}, 
            {'uid': 71, 'value': '6', 'color': 'spades', 'actions': [6]}, 
            {'uid': 94, 'value': '3', 'color': 'spades', 'actions': [3]}, 
            {'uid': 91, 'value': '3', 'color': 'diamonds', 'actions': [3]}, 
            {'uid': 31, 'value': 'Ja', 'color': 'spades', 'actions': ['switch']}
        ], 
        [
            {'uid': 30, 'value': 'Ja', 'color': 'spades', 'actions': ['switch']}, 
            {'uid': 70, 'value': '6', 'color': 'spades', 'actions': [6]}, 
            {'uid': 25, 'value': 'Ja', 'color': 'clubs', 'actions': ['switch']}, 
            {'uid': 90, 'value': '3', 'color': 'diamonds', 'actions': [3]}, 
            {'uid': 23, 'value': 'Q', 'color': 'spades', 'actions': [12]}
        ], 
        [
            {'uid': 64, 'value': '6', 'color': 'clubs', 'actions': [6]}, 
            {'uid': 61, 'value': '7', 'color': 'hearts', 'actions': [7]}, 
            {'uid': 19, 'value': 'Q', 'color': 'diamonds', 'actions': [12]},
            {'uid': 95, 'value': '3', 'color': 'spades', 'actions': [3]}, 
            {'uid': 109, 'value': 'Jo', 'color': 'Jo', 'actions': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 'switch', -4]}
        ]
        """

    def test_23_player_0_1_2_folds(self):
        # player 0 folds
        res = self.clients[0].post(f"v1/games/{self.game_ids[0]}/fold")
        assert res.status_code == 200

        res = self.clients[1].post(f"v1/games/{self.game_ids[0]}/fold")
        assert res.status_code == 200

        res = self.clients[2].post(f"v1/games/{self.game_ids[0]}/fold")
        assert res.status_code == 200

    def test_24_player_3_starting_marble_13(self):
        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 109,
                    "value": "Jo",
                    "color": "Jo",
                    "actions": [
                        0,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11,
                        12,
                        13,
                        "switch",
                        -4,
                    ],
                },
                "action": 0,
                "mid": 12,
            },
        )

        assert res.status_code == 200
        # should be at position 48
        assert (
            res.json()["players"][self.players[3]["uid"]]["marbles"][0]["position"]
            == 48
        )

    def test_25_player_3_moves_5_using_7(self):
        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 61, "value": "7", "color": "hearts", "actions": [7]},
                "action": 75,
                "mid": 12,
            },
        )

        assert res.status_code == 200
        # should be at position 53
        assert (
            res.json()["players"][self.players[3]["uid"]]["marbles"][0]["position"]
            == 53
        )

    def test_26_player_3_tries_to_move_3_using_7(self):
        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 61, "value": "7", "color": "hearts", "actions": [7]},
                "action": 73,
                "mid": 12,
            },
        )

        assert res.status_code == 400

    def test_26_player_3_moves_2_left_of_7(self):
        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 61, "value": "7", "color": "hearts", "actions": [7]},
                "action": 72,
                "mid": 12,
            },
        )

        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[3]["uid"]]["marbles"][0]["position"]
            == 55
        )

    def test_27_player_3_cards(self):
        res = self.clients[3].get(
            f"v1/games/{self.game_ids[0]}/cards",
            json=self.players[3],
        )
        assert len(res.json()["hand"]) == 3

    def test_28_player_3_folds(self):
        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/fold",
            json=self.players[3],
        )
        assert res.status_code == 200
        assert len(res.json()["hand"]) == 4

    def test_29_view_all_player_cards(self):
        for i in range(4):
            res = self.clients[i].get(f"v1/games/{self.game_ids[0]}/cards")
            assert res.status_code == 200
            self.cards[i] = res.json()["hand"]
            assert len(self.cards[i]) == 4

    def test_30_swap_cards_round_2(self):

        for i in range(4):
            res = self.clients[i].post(
                f"v1/games/{self.game_ids[0]}/swap_cards", json=self.cards[i][-1]
            )
            assert res.status_code == 200
        """
        Marbles:
        [
            {'mid': 0, 'position': -1, 'color': 'red'}, 
            {'mid': 1, 'position': 1001, 'color': 'red'}, 
            {'mid': 2, 'position': -3, 'color': 'red'}, 
            {'mid': 3, 'position': -4, 'color': 'red'}
        ],
        [
            {'mid': 4, 'position': -5, 'color': 'yellow'}, 
            {'mid': 5, 'position': 19, 'color': 'yellow'}, 
            {'mid': 6, 'position': -7, 'color': 'yellow'},
            {'mid': 7, 'position': -8, 'color': 'yellow'}
        ],
        [
            {'mid': 8, 'position': -9, 'color': 'green'}, 
            {'mid': 9, 'position': -10, 'color': 'green'}, 
            {'mid': 10, 'position': -11, 'color': 'green'}, 
            {'mid': 11, 'position': -12, 'color': 'green'}
        ],
        [
            {'mid': 12, 'position': 55, 'color': 'blue'}, 
            {'mid': 13, 'position': -14, 'color': 'blue'}, 
            {'mid': 14, 'position': -15, 'color': 'blue'}, 
            {'mid': 15, 'position': -16, 'color': 'blue'}
        ]
        """

        """
        Cards
        [
            {'uid': 42, 'value': '9', 'color': 'diamonds', 'actions': [9]}, 
            {'uid': 51, 'value': '8', 'color': 'diamonds', 'actions': [8]},
            {'uid': 76, 'value': '5', 'color': 'hearts', 'actions': [5]}, 
            {'uid': 98, 'value': '2', 'color': 'diamonds', 'actions': [2]}           
        ], 
        [
            {'uid': 45, 'value': '9', 'color': 'hearts', 'actions': [9]}, 
            {'uid': 85, 'value': '4', 'color': 'hearts', 'actions': [-4, 4]}, 
            {'uid': 21, 'value': 'Q', 'color': 'hearts', 'actions': [12]}, 
            {'uid': 35, 'value': '10', 'color': 'diamonds', 'actions': [10]}
        ],
        [
            {'uid': 7, 'value': 'A', 'color': 'spades', 'actions': [0, 1, 11]}, 
            {'uid': 18, 'value': 'Q', 'color': 'diamonds', 'actions': [12]},
            {'uid': 46, 'value': '9', 'color': 'spades', 'actions': [9]}, 
            {'uid': 104, 'value': 'Jo', 'color': 'Jo', 'actions': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 'switch', -4]}
        ],
        [
            {'uid': 11, 'value': 'K', 'color': 'diamonds', 'actions': [0, 13]}, 
            {'uid': 6, 'value': 'A', 'color': 'spades', 'actions': [0, 1, 11]}, 
            {'uid': 47, 'value': '9', 'color': 'spades', 'actions': [9]}
            {'uid': 41, 'value': '9', 'color': 'clubs', 'actions': [9]}, 
        ]
        """

    def test_31_player_1_move_12(self):
        res = self.clients[1].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 21, "value": "Q", "color": "hearts", "actions": [12]},
                "action": 12,
                "mid": 5,
            },
        )

        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[1]["uid"]]["marbles"][1]["position"]
            == 31
        )

    def test_32_player_2_moves_out_of_base(self):
        """
        player 2 first needs to move out of his base
        """
        res = self.clients[2].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 7,
                    "value": "A",
                    "color": "spades",
                    "actions": [0, 1, 11],
                },
                "action": 0,
                "mid": 8,
            },
        )
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[2]["uid"]]["marbles"][0]["position"]
            == 32
        )

    def test_33_player_3_moves_out_of_base(self):
        """
        player 3 moves out of his base
        """
        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 11,
                    "value": "K",
                    "color": "diamonds",
                    "actions": [0, 13],
                },
                "action": 0,
                "mid": 13,
            },
        )
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[3]["uid"]]["marbles"][1]["position"]
            == 48
        )

    def test_34_player_0_move_two_in_base(self):
        res = self.clients[0].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 98, "value": "2", "color": "diamonds", "actions": [2]},
                "action": 2,
                "mid": 1,
            },
        )

        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[0]["uid"]]["marbles"][1]["position"]
            == 1003
        )

    def test_35_player_1_tries_to_move_10_but_is_blocked(self):
        res = self.clients[1].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 35,
                    "value": "10",
                    "color": "diamonds",
                    "actions": [10],
                },
                "action": 10,
                "mid": 5,
            },
        )

        assert res.status_code == 400

    def test_36_player_1_moves_minus_4(self):
        res = self.clients[1].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 85,
                    "value": "4",
                    "color": "hearts",
                    "actions": [-4, 4],
                },
                "action": -4,
                "mid": 5,
            },
        )

        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[1]["uid"]]["marbles"][1]["position"]
            == 27
        )

    def test_37_player_2_uses_joker_to_move_3(self):
        """
        player 2 first needs to move out of his base
        """
        res = self.clients[2].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 104,
                    "value": "Jo",
                    "color": "Jo",
                    "actions": [
                        0,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11,
                        12,
                        13,
                        "switch",
                        -4,
                    ],
                },
                "action": 73,
                "mid": 8,
            },
        )
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[2]["uid"]]["marbles"][0]["position"]
            == 35
        )

    def test_38_player_2_uses_joker_to_move_4(self):
        """
        player 2 first needs to move out of his base
        """
        res = self.clients[2].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 104,
                    "value": "Jo",
                    "color": "Jo",
                    "actions": [
                        0,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11,
                        12,
                        13,
                        "switch",
                        -4,
                    ],
                },
                "action": 74,
                "mid": 8,
            },
        )
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[2]["uid"]]["marbles"][0]["position"]
            == 39
        )

    def test_39_player_3_moves_9(self):
        """
        player 3 moves 9
        """
        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 41, "value": "9", "color": "clubs", "actions": [9]},
                "action": 9,
                "mid": 13,
            },
        )
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[3]["uid"]]["marbles"][1]["position"]
            == 57
        )

    def test_40_player_0_folds(self):
        # player 0 has to fold
        res = self.clients[0].post(f"v1/games/{self.game_ids[0]}/fold")
        assert res.json()["hand"] == []

    def test_41_player_1_moves_10(self):
        res = self.clients[1].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 35,
                    "value": "10",
                    "color": "diamonds",
                    "actions": [10],
                },
                "action": 10,
                "mid": 5,
            },
        )

        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[1]["uid"]]["marbles"][1]["position"]
            == 37
        )

    def test_42_player_2_moves_12(self):
        """
        player 2 first needs to move out of his base
        """
        res = self.clients[2].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 18, "value": "Q", "color": "diamonds", "actions": [12]},
                "action": 12,
                "mid": 8,
            },
        )
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[2]["uid"]]["marbles"][0]["position"]
            == 51
        )

    def test_43_player_3_moves_out_of_base(self):
        """
        player 3 moves out of base
        """
        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 6,
                    "value": "A",
                    "color": "spades",
                    "actions": [0, 1, 11],
                },
                "action": 0,
                "mid": 14,
            },
        )
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[3]["uid"]]["marbles"][2]["position"]
            == 48
        )

    def test_44_player_1_moves_9(self):
        res = self.clients[1].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 45, "value": "9", "color": "hearts", "actions": [9]},
                "action": 9,
                "mid": 5,
            },
        )

        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[1]["uid"]]["marbles"][1]["position"]
            == 46
        )

    def test_45_player_2_moves_12(self):
        """
        player 2 first needs to move out of his base
        """
        res = self.clients[2].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 46, "value": "9", "color": "spades", "actions": [9]},
                "action": 9,
                "mid": 8,
            },
        )
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[2]["uid"]]["marbles"][0]["position"]
            == 60
        )

    def test_46_player_3_moves_9(self):
        """
        player 3 moves 9
        """
        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 47, "value": "9", "color": "spades", "actions": [9]},
                "action": 9,
                "mid": 13,
            },
        )
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[3]["uid"]]["marbles"][1]["position"] == 2
        )

    def test_47_player_3_folds(self):
        # player 3 folds
        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/fold",
        )

        assert res.status_code == 200

    def test_48_view_all_player_cards(self):
        for i in range(4):
            res = self.clients[i].get(f"v1/games/{self.game_ids[0]}/cards")
            assert res.status_code == 200
            self.cards[i] = res.json()["hand"]
            assert len(self.cards[i]) == 3

    """
    0:[
        {'uid': 65, 'value': '6', 'color': 'clubs', 'actions': [6]}, 
        {'uid': 53, 'value': '8', 'color': 'hearts', 'actions': [8]}, 
        {'uid': 96, 'value': '2', 'color': 'clubs', 'actions': [2]}
    ]

    1:[
        {'uid': 81, 'value': '4', 'color': 'clubs', 'actions': [-4, 4]}, 
        {'uid': 37, 'value': '10', 'color': 'hearts', 'actions': [10]}, 
        {'uid': 58, 'value': '7', 'color': 'diamonds', 'actions': [71, 72, 73, 74, 75, 76, 77]}
    ]

    2: [
        {'uid': 108, 'value': 'Jo', 'color': 'Jo', 'actions': [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 'switch', -4, 71, 72, 73, 74, 75, 76, 77]}, 
        {'uid': 79, 'value': '5', 'color': 'spades', 'actions': [5]}, 
        {'uid': 44, 'value': '9', 'color': 'hearts', 'actions': [9]}
    ]

    3: [
        {'uid': 86, 'value': '4', 'color': 'spades', 'actions': [-4, 4]}, 
        {'uid': 107, 'value': 'Jo', 'color': 'Jo', 'actions': [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 'switch', -4, 71, 72, 73, 74, 75, 76, 77]}, 
        {'uid': 56, 'value': '7', 'color': 'clubs', 'actions': [71, 72, 73, 74, 75, 76, 77]}
    ]
    """

    def test_49_swap_cards_round_3(self):
        res = self.clients[0].post(
            f"v1/games/{self.game_ids[0]}/swap_cards", json=self.cards[0][0]
        )
        assert res.status_code == 200

        res = self.clients[1].post(
            f"v1/games/{self.game_ids[0]}/swap_cards", json=self.cards[1][0]
        )
        assert res.status_code == 200

        res = self.clients[2].post(
            f"v1/games/{self.game_ids[0]}/swap_cards", json=self.cards[2][0]
        )
        assert res.status_code == 200

        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/swap_cards", json=self.cards[3][0]
        )
        assert res.status_code == 200

        for i in range(4):
            res = self.clients[i].get(f"v1/games/{self.game_ids[0]}/cards")
            assert res.status_code == 200
            self.cards[i] = res.json()["hand"]
            assert len(self.cards[i]) == 3

    """
    0:[
        {'uid': 108, 'value': 'Jo', 'color': 'Jo', 'actions': [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 'switch', -4, 71, 72, 73, 74, 75, 76, 77]}, 
        {'uid': 53, 'value': '8', 'color': 'hearts', 'actions': [8]}, 
        {'uid': 96, 'value': '2', 'color': 'clubs', 'actions': [2]}
    ]

    1:[
        {'uid': 86, 'value': '4', 'color': 'spades', 'actions': [-4, 4]}, 
        {'uid': 37, 'value': '10', 'color': 'hearts', 'actions': [10]}, 
        {'uid': 58, 'value': '7', 'color': 'diamonds', 'actions': [71, 72, 73, 74, 75, 76, 77]}
    ]

    2: [
        {'uid': 65, 'value': '6', 'color': 'clubs', 'actions': [6]}, 
        {'uid': 79, 'value': '5', 'color': 'spades', 'actions': [5]}, 
        {'uid': 44, 'value': '9', 'color': 'hearts', 'actions': [9]}
    ]

    3: [
        {'uid': 81, 'value': '4', 'color': 'clubs', 'actions': [-4, 4]}, 
        {'uid': 107, 'value': 'Jo', 'color': 'Jo', 'actions': [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 'switch', -4, 71, 72, 73, 74, 75, 76, 77]}, 
        {'uid': 56, 'value': '7', 'color': 'clubs', 'actions': [71, 72, 73, 74, 75, 76, 77]}
    ]
    """

    def test_50_player_1_moves_minus_4(self):
        res = self.clients[1].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 86,
                    "value": "4",
                    "color": "spades",
                    "actions": [-4, 4],
                },
                "action": -4,
                "mid": 5,
            },
        )

        print(res.json())
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[1]["uid"]]["marbles"][1]["position"]
            == 42
        )

    def test_51_player_2_moves_5(self):
        """
        player 2 first needs to move out of his base
        """
        res = self.clients[2].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 79, "value": "5", "color": "spades", "actions": [5]},
                "action": 5,
                "mid": 8,
            },
        )
        print(res.json())
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[2]["uid"]]["marbles"][0]["position"] == 1
        )

    def test_52_player_3_moves_minus_4(self):
        """
        player 3 moves 9
        """
        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 81, "value": "4", "color": "clubs", "actions": [-4, 4]},
                "action": -4,
                "mid": 14,
            },
        )
        print(res.json())
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[3]["uid"]]["marbles"][2]["position"]
            == 44
        )

    def test_53_player_0_moves_out(self):
        res = self.clients[0].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 108,
                    "value": "Jo",
                    "color": "Jo",
                    "actions": [
                        0,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        8,
                        9,
                        10,
                        11,
                        12,
                        "switch",
                        -4,
                        71,
                        72,
                        73,
                        74,
                        75,
                        76,
                        77,
                    ],
                },
                "action": 0,
                "mid": 0,
            },
        )
        print(res.json())
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[0]["uid"]]["marbles"][0]["position"] == 0
        )

    def test_54_player_1_moves_10(self):
        res = self.clients[1].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 37, "value": "10", "color": "hearts", "actions": [10]},
                "action": 10,
                "mid": 5,
            },
        )

        print(res.json())
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[1]["uid"]]["marbles"][1]["position"]
            == 52
        )

    def test_55_player_2_moves_9(self):
        """
        player 2 first needs to move out of his base
        """
        res = self.clients[2].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 44, "value": "9", "color": "hearts", "actions": [9]},
                "action": 9,
                "mid": 8,
            },
        )
        print(res.json())
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[2]["uid"]]["marbles"][0]["position"]
            == 10
        )
        # assert False

    def test_56_player_3_moves_4_with_7(self):

        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 56,
                    "value": "7",
                    "color": "clubs",
                    "actions": [71, 72, 73, 74, 75, 76, 77],
                },
                "action": 74,
                "mid": 14,
            },
        )
        print(res.json())
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[3]["uid"]]["marbles"][2]["position"]
            == 48
        )
        # assert False

    def test_57_player_3_moves_3_with_7(self):

        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 56,
                    "value": "7",
                    "color": "clubs",
                    "actions": [71, 72, 73, 74, 75, 76, 77],
                },
                "action": 73,
                "mid": 13,
            },
        )
        print(res.json())
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[3]["uid"]]["marbles"][1]["position"] == 5
        )

    def test_58_player_0_moves_out(self):
        res = self.clients[0].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 53, "value": "8", "color": "hearts", "actions": [8]},
                "action": 8,
                "mid": 0,
            },
        )
        print(res.json())
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[0]["uid"]]["marbles"][0]["position"] == 8
        )

    def test_59_player_1_moves_7(self):
        res = self.clients[1].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {
                    "uid": 58,
                    "value": "7",
                    "color": "diamonds",
                    "actions": [71, 72, 73, 74, 75, 76, 77],
                },
                "action": 77,
                "mid": 5,
            },
        )

        print(res.json())
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[1]["uid"]]["marbles"][1]["position"]
            == 59
        )

        assert (
            res.json()["players"][self.players[3]["uid"]]["marbles"][0]["position"]
            == -13
        )

    def test_60_player_2_moves_6(self):
        res = self.clients[2].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {"uid": 65, "value": "6", "color": "clubs", "actions": [6]},
                "action": 6,
                "mid": 8,
            },
        )
        print(res.json())
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[2]["uid"]]["marbles"][0]["position"]
            == 16
        )

    def test_61_player_3_moves_4_with_Jo(self):

        res = self.clients[3].post(
            f"v1/games/{self.game_ids[0]}/action",
            json={
                "card": {'uid': 107, 'value': 'Jo', 'color': 'Jo', 'actions': [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 'switch', -4, 71, 72, 73, 74, 75, 76, 77]},
                "action": 4,
                "mid": 14,
            },
        )
        print(res.json())
        assert res.status_code == 200
        assert (
            res.json()["players"][self.players[3]["uid"]]["marbles"][2]["position"]
            == 48
        )