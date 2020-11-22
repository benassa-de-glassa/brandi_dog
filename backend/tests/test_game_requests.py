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
            self.clients[i].headers.update(
                {"Authorization": f"Bearer {token}"})

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
        res = self.clients[0].get(
            f"v1/games/{self.game_ids[0]}", json=self.players[0])
        assert res.status_code == 200

        assert res.json()["game_id"] == self.game_ids[0]
        assert len(res.json()["players"]) == len(res.json()["order"])
        assert res.json()["active_player_index"] == 0

    def test_change_team(self):
        res = self.clients[2].post(
            f"v1/games/{self.game_ids[0]}/player_position",
            json=1,
        )
        print(res.json())
        assert res.status_code == 200
        assert res.json()["order"] == [self.players[i]["uid"]
                                       for i in [0, 2, 1, 3]]

        # reset the game order
        res = self.clients[1].post(
            f"v1/games/{self.game_ids[0]}/player_position",
            json=1,
        )

        assert res.status_code == 200
        assert res.json()["order"] == [self.players[i]["uid"]
                                       for i in [0, 1, 2, 3]]

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
