from typing import Dict, List, Union

from itertools import count, filterfalse

import logging

from app.game_logic.deck import Deck
from app.game_logic.field import Field, GameNode
from app.game_logic.player import Player
from app.game_logic.marble import Marble
from app.game_logic.card import Card

from app.models.action import Action as ActionModel
from app.models.user import User as UserModel


class Brandi:
    """
    Brandi Dog game instance handling the game logic.

    Brandi.game_state can take values between 0 and 3, indicating one of the
    following game states:
        - 0: initialized, waiting for players
        - 1: ready to be started TODO: game_state can never take value 1?
        - 2: running
        - 3: finished
    Brandi.round_state can take values between 0 and 2 indicating one of the
    following round states:
        - 0: round has not yet started (only possible for the very first round of a game)
        - 1: round has started and cards have not yet been dealt
        - 2: round has started and cards have been dealt but not yet
            exchanged within the team
        - 3: round has started and cards to be exchanged have been dealt but
            not yet been shown to the teammate
        - 4: round has started and cards have been exchanged between
            teammates
        - 5: round has finished


    Brandi.deck is an instance of a Deck object containing shuffled cards.

    Brandi.players is a list of Player instances

    Brandi.order:
        - is a list of player uids to keep track of the order and the teams
            player at position 0 and at position 2 always play together
    Brandi.active_player_index: keeps track of who's turn it is to play a card and
        move a marble

    Brandi.round_turn: keeps track of which turn is reached
    Brandi.round_cards: list of how many cards are to be dealt at the
        beginning of each round

    Brandi.field: field instance to keep track of the marbles
    """

    # Initialization - Stage 0
    def __init__(
        self,
        game_id: str,
        host: UserModel,
        n_players: int = 4,
        seed: int = None,
        game_name: str = None,
        debug: bool = False,
    ):
        self.game_id: str = game_id
        self.game_name: str = game_name
        self.n_players: int = n_players

        # store players as a dictionary { uid(str) : Player }
        self.players: Dict[str, Player] = {}
        self.order: List[int] = []

        self.field: Field = None

        # add the host to the game
        self.host: Player = Player(host.uid, host.username, host.avatar)
        self.player_join(self.host)  # add the host as the first player

        self.game_state: int = 0  # start in the initialized state
        self.round_state: int = 0

        self.deck: Deck = Deck(seed)  # initialize a deck instance
        # keep track of whose players turn it is to make a move
        self.active_player_index: int = 0

        # number of cards dealt at the beginning of a round
        self.round_cards: List[int] = [6, 5, 4, 3, 2]
        # beginning of each round
        self.round_turn = 0  # count which turn is reached

        # keep track of how many cards have been swapped so that cards are revealed to the players correctly
        self.card_swap_count = 0

        self.top_card = None

        self.discarded_cards = []

    def get_player_by_position(self, position: int) -> Union[Player, None]:
        for player in self.players.values():
            if player.position == position:
                return player
        return None

    def get_player_by_marble_id(self, marbleid: int) -> Player:
        return self.get_player_by_position(marbleid // 4)

    def player_join(self, user: UserModel):
        # have a player join the game
        if user.uid in self.players:
            return {
                "requestValid": False,
                "note": f"Player {user.username} has already joined the game.",
            }
        player_positions: List[int] = [
            player.position for player in self.players.values()
        ]
        # assign the lowest non taken position
        position: int = next(filterfalse(
            set(player_positions).__contains__, count(0)))
        self.players[user.uid] = Player(
            user.uid, user.username, user.avatar, position)

        self.calculate_order()
        return {
            "requestValid": True,
            "note": f"Player {user.username} succesfully joined the game.",
        }

    def remove_player(self, user_id):
        """
        remove a player from the game
        """
        user: Player = self.players.get(user_id)
        if not user.uid in self.players:
            return {
                "requestValid": False,
                "note": f"Player #{user.username} is not in this game.",
            }

        # TODO add possibility to replace players
        if self.game_state > 1:
            return {"requestValid": False, "note": f"Game is currently in progress."}

        del self.players[user.uid]

        return {
            "requestValid": True,
            "note": f"Player {user.username} succesfully removed from game",
        }

    def calculate_order(self) -> None:
        self.order = [self.get_player_by_position(
            position).uid for position in range(len(self.players.keys()))]

    def change_position(self, user: UserModel, position: int):
        """
        allow for the teams to be chosen by the players before the game has
        started

        Parameters:

        position int: List of player_ids, players with index 0 and 2 play
            together
        """

        if not (self.game_state < 2):  # assert the game is not yet running
            return {
                "requestValid": False,
                "note": "game has already started, you can no longer switch teams",
            }

        if user.uid not in self.players:
            return {
                "requestValid": False,
                "note": f"Player {user.username} is not part of this game",
            }

        if position >= self.n_players:
            return {
                "requestValid": False,
                "note": f"Please select a position between 0 and {self.n_players - 1}",
            }

        player_requesting_new_position: Player = self.players.get(user.uid)

        if player_requesting_new_position == None:
            return {
                "requestValid": False,
                "note": f"Player {user.username} with id {user.uid} could not be found",
            }

        # search if a player already is in that position, in which case we need to swap both
        player_to_be_swapped: Player = self.get_player_by_position(position)

        if player_to_be_swapped is not None:
            self.players[player_to_be_swapped.uid].set_position(
                player_requesting_new_position.position
            )
        self.players[player_requesting_new_position.uid].set_position(position)

        self.calculate_order()
        return {
            "requestValid": True,
            "note": f"Successfully moved player {user.username} to postion {position}",
        }

    def start_game(self):
        """
        start the game:
            - check that all players are present
            - players are assigned their starting position based on self.order
            - first round is started
        """
        if len(self.players.values()) != self.n_players:
            return {"requestValid": False, "note": "Not all players are present."}
        if not self.game_state == 0:
            return {"requestValid": False, "note": "Game has already started."}

        # create a new field instance for the game
        self.field: Field = Field(self.n_players)  # field of players

        self.assign_starting_positions()
        self.start_round()
        return {"requestValid": True, "note": "Game is started."}

    def assign_starting_positions(self):
        """
        assign starting positions for the game based on self.order

        """
        for player_id in self.players.keys():
            self.players[player_id].set_starting_node(self.field)

        self.calculate_order()

    def start_round(self):
        """
        start a round:
            - check and set the correct game state
            - deal cards
        """
        if not self.round_state in [0, 5]:
            return {"requestValid": False, "note": "The round has already started."}
        self.game_state = 2
        self.round_state = 1
        self.deal_cards()

        # update the players order
        self.active_player_index = self.round_turn % self.n_players
        for uid in self.order:
            self.players[uid].has_folded = False

        self.round_turn += 1
        return {"requestValid": True, "note": "Round is started."}

    def deal_cards(self):
        """
        deal the correct number of cards to all players depending on the current
        round turn
        """
        # check that the game is in the correct state
        if not (self.game_state == 2 and self.round_state == 1):
            return {
                "requestValid": False,
                "note": f"The game is not in the correct state to deal cards.",
            }

        # shift the order to start dealing cards to the correct player
        shifted_order: List[str] = self.order.copy()
        for _ in range(self.round_turn):
            shifted_order.append(shifted_order.pop(0))

        for uid in shifted_order:
            for _ in range(self.round_cards[self.round_turn % len(self.round_cards)]):
                if self.deck.deck_size() == 0:
                    self.deck.reshuffle_cards(self.discarded_cards)
                    self.discarded_cards = []
                self.players[uid].set_card(self.deck.give_card())

        self.round_state = 2

    def swap_card(self, user: UserModel, card: Card):
        if not self.round_state == 2:
            return {
                "requestValid": False,
                "note": f"The round is not in the card swapping state.",
            }
        if not self.players[user.uid].may_swap_cards:
            return {
                "requestValid": False,
                "note": f"You have already swapped a card."
            }

        player = self.players.get(user.uid)
        team_member = self.get_player_by_position(
            (player.position + self.n_players // 2) % self.n_players
        )

        swapped_card = self.players[user.uid].hand.play_card(card)
        self.players[team_member.uid].hand.set_card(swapped_card)

        self.card_swap_count += 1

        # make sure the players only swap one card
        self.players[user.uid].may_swap_cards = False
        # when all players have sent their card to swap
        if self.card_swap_count % self.n_players == 0:
            self.round_state += 1

            # reset swapping ability for next round
            for player in self.players.values():
                player.may_swap_cards = True
            self.round_state += 1
            return {
                "requestValid": True,
                "taskFinished": True,
                "note": "Cards have been swapped.",
            }
        return {
            "requestValid": True,
            "taskFinished": False,
            "note": "Card has been swapped.",
        }

    def increment_active_player_index(self):
        """
        Move to the next player that still has cards. If no player has any
        cards left, start the next round. 
        """

        """ check if a team won """

        # iterate through teams
        for i in range(self.n_players // 2):
            # define the two team members
            member_1 = self.get_player_by_position(i)
            member_2 = self.get_player_by_position(i + self.n_players // 2)

            if member_1.has_finished_marbles() and member_2.has_finished_marbles():
                self.game_state = 3  # game is finished 🏁
                return {
                    "note": f"Players {member_1.username} and {member_2.username} have won.",
                    "gameOver": True,
                }

        # increase the active player index
        self.active_player_index = (
            self.active_player_index + 1) % self.n_players

        """ check if all players have no cards left """

        if all([player.has_finished_cards() for player in self.players.values()]):
            self.round_state = 5
            self.start_round()
            return {
                "note": f"Round #{self.round_turn} has started due to all players having no cards left.",
                "new_round": True,
            }

        """ move to the next player until a player that still has cards is reached """

        while get_active_player().has_finished_cards():
            self.active_player_index = (
                self.active_player_index + 1) % self.n_players

    """
    Game play events: 

    """

    def event_player_fold(self, user: UserModel):
        """"""

        # for self.check_card_marble_action
        # check whether the player can at this point play one of his cards and perform an action of those on one of his marbles
        """
        can_play = True
        for card in self.players[player.uid].hand.cards.values():
            for possible_action in card.action_options:
                for marble in self.players[player.uid].marbles:
                    pass
        """

        self.players[user.uid].fold()

        response = self.increment_active_player_index()

        if response:
            response["requestValid"] = True
            return response

        # default response
        return {
            "requestValid": True,
            "note": f"Player {user.username} has folded for this round.",
        }

    def event_move_marble(self, user: UserModel, action: ActionModel):

        current_player: Player = self.players[self.order[self.active_player_index]]

        if self.round_state != 4:
            return {
                "requestValid": False,
                "note": f"You have to finish swapping cards first.",
            }
        if user.uid != current_player.uid:
            return {
                "requestValid": False,
                "note": f"It is not player {user.username}s turn.",
            }
        if action.card.uid not in self.players[user.uid].hand.cards:
            return {"requestValid": False, "note": "You do not have this card."}

        if (
            action.card.value not in ["7", "Jo"]
            and action.action
            not in self.players[user.uid].hand.cards[action.card.uid].action_options
        ):
            return {
                "requestValid": False,
                "note": "Desired action does not match the card.",
            }

        if (
            current_player.steps_of_seven_remaining != -1
            and 7 not in action.card.actions
            and current_player.uid != user.uid
        ):
            return {
                "requestValid": False,
                "note": f"Player {user.username} has to finish using his seven moves.",
            }

        marble: Marble = self.players[user.uid].marbles.get(action.mid, None)

        if self.players[user.uid].has_finished_marbles():
            team_member: Player = self.get_player_by_position(
                (current_player.position + self.n_players // 2) % self.n_players
            )
            marble: Marble = self.players[team_member.uid].marbles.get(
                action.mid)
            current_player = team_member

        if not marble:
            return {
                "requestValid": False,
                "note": "Marble does not seem to belong to you.",
            }

        pointer_to_node: GameNode = marble.currentNode

        #  get out of the start
        if action.action == 0:
            if pointer_to_node is not None:
                return {"requestValid": False, "note": "Not in the starting position."}
            # check that the marble goes to an entry node
            # and
            # check whether the entrynode is blocked
            elif marble.starting_node.is_blocking():
                return {"requestValid": False, "note": "Blocked by a marble."}
            # marble is allowed to move
            else:
                # check whether there already is a marble
                if marble.starting_node.has_marble():
                    # kick the exiting marble
                    marble.starting_node.marble.reset_to_starting_position()

                # move the marble to the entry node
                marble.set_new_position(marble.starting_node)
                marble.is_blocking = True  # make the marble blocking other marbles

                self.increment_active_player_index()
                self.top_card = self.players[user.uid].hand.play_card(
                    action.card)

                self.discarded_cards.append(self.top_card)
                return {
                    "requestValid": True,
                    "note": f"Marble {action.mid} moved to {marble.currentNode.position}.",
                    # "positions": {"old": old_position, "new": marble.currentNode.position}
                }

        # normal actions
        elif action.action in [
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
            13,
        ]:
            # try to move action.action nodes ahead

            # use pnt variable to check the path along the action of the marble i.e. whether it
            # is blocked or it may enter its goal
            if pointer_to_node is None:
                return {"requestValid": False, "note": "In the starting position."}

            for i in range(action.action):
                if not action.go_past_base and marble.can_enter_goal and pointer_to_node.get_is_entry_node_for_player_at_position(current_player.position):
                    flag_home_is_not_allowed: bool = False
                    pointer_copy: GameNode = pointer_to_node.curr
                    pointer_copy = pointer_copy.exit

                    for _ in range(i, action.action - 1):
                        flag_home_is_not_allowed = flag_home_is_not_allowed or pointer_copy.is_blocking()
                        pointer_copy = pointer_copy.next
                        if pointer_copy is None or flag_home_is_not_allowed:
                            flag_home_is_not_allowed = True
                            pointer_to_node = pointer_to_node.next
                            break

                    # if we are allowed to enter the house, we will do so by setting the actual pointer to the node of the pointer copy
                    if not flag_home_is_not_allowed:
                        pointer_to_node = pointer_copy
                        break

                else:
                    pointer_to_node = pointer_to_node.next
                    if pointer_to_node is None:
                        return {
                            "requestValid": False,
                            "note": f"You would go to far.",
                        }
                    if pointer_to_node.is_blocking():
                        return {
                            "requestValid": False,
                            "note": f"Blocked by a marble at position {pointer_to_node.position}.",
                        }

            if pointer_to_node.has_marble():
                # kick the marble
                pointer_to_node.marble.reset_to_starting_position()

            # performing any motion with a marble on the field removes the blocking capability
            # however entering the goals makes the marble blocking again
            # if the pointers position is >= 1000 then the marble is at home and therefor blocking
            marble.is_blocking = False + (pointer_to_node.position >= 1000)
            marble.can_enter_goal = True
            marble.set_new_position(pointer_to_node)
            self.increment_active_player_index()
            self.top_card = self.players[user.uid].hand.play_card(action.card)
            self.discarded_cards.append(self.top_card)

            return {
                "requestValid": True,
                "note": f"Marble {action.mid} moved to {marble.currentNode.position}.",
                # "positions": {"old": old_position, "new": marble.currentNode.position}
            }

        elif action.action == -4:  # go backwards 4
            # try to move action.action nodes ahead

            # use pnt variable to check the path along the action of the marble i.e. whether it
            # is blocked or it may enter its goal
            pointer_to_node = marble.currentNode
            for i in range(abs(action.action)):
                pointer_to_node = pointer_to_node.prev
                # check whether a marble is blocking along the way
                if pointer_to_node is None:
                    return {
                        "requestValid": False,
                        "note": f"You cannot enter your goal without going to far.",
                    }
                if pointer_to_node.is_blocking():
                    return {
                        "requestValid": False,
                        "note": f"Blocked by a marble at position {pointer_to_node.position}.",
                    }

            if pointer_to_node.has_marble():
                # kick the marble
                pointer_to_node.marble.reset_to_starting_position()

            # performing any motion with a marble on the field removes the blocking capability
            # it also allows the marble to enter the goal
            marble.is_blocking = False
            marble.can_enter_goal = True

            # move the marble to the entry node
            marble.set_new_position(pointer_to_node)

            self.increment_active_player_index()
            self.top_card = self.players[user.uid].hand.play_card(action.card)
            self.discarded_cards.append(self.top_card)

            return {
                "requestValid": True,
                "note": f"Marble {action.mid} moved to {marble.currentNode.position}.",
                # "positions": {"old": old_position, "new": marble.currentNode.position}
            }

        elif action.action == "switch":
            if action.mid_2 is None:
                return {
                    "requestValid": False,
                    "note": f"No marble to switch was selected.",
                }
            if not action.pid_2:
                # if the player id is not sent, get the pid_2 from the marble id which is in range of 4*pid, 4*pid+4
                action.pid_2 = self.get_player_by_marble_id(action.mid_2).uid

            if user.uid == action.pid_2:
                return {
                    "requestValid": False,
                    "note": f"You can not swap two of your own marbles.",
                }

            marble_1_node = self.players[user.uid].marbles[action.mid].currentNode
            marble_2_node = self.players[action.pid_2].marbles[action.mid_2].currentNode

            if marble_1_node.curr.is_blocking():
                return {
                    "requestValid": False,
                    "note": f"Marble {action.mid} is blocking.",
                }
            if marble_2_node.curr.is_blocking():
                return {
                    "requestValid": False,
                    "note": f"Marble {action.mid_2} is blocking.",
                }
            self.players[user.uid].marbles[action.mid].set_new_position(
                marble_2_node)
            self.players[action.pid_2].marbles[action.mid_2].set_new_position(
                marble_1_node
            )
            self.increment_active_player_index()
            self.top_card = self.players[user.uid].hand.play_card(action.card)

            self.discarded_cards.append(self.top_card)
            return {
                "requestValid": True,
                "note": f"switched {action.mid} and {action.mid_2} successfully",
                # "positions": {
                #     "old": old_position,
                #     "new": marble.currentNode.position,
                # }
            }

        # in case either a joker or a seven is played. all other cases are covered by the options above
        # assume you want to play a 7 as the other options have been exausted
        elif action.action in list(range(71, 78)):
            steps = action.action - 70
            if pointer_to_node is None:
                return {"requestValid": False, "note": "In the starting position."}

            if self.players[user.uid].steps_of_seven_remaining == -1:
                """
                this is the first step of the seven the player is attempting to take.
                we need to take a snapshot of the game, so that we can come back to it later
                if the player was to not be able to finish his moves
                """
                is_seven_playable = self.check_card_marble_action(
                    self.players[user.uid],
                    7,
                    list(self.players[user.uid].marbles.values()),
                )
                if not is_seven_playable:
                    return {
                        "requestValid": False,
                        "note": "The seven steps can not be fully executed.",
                    }

                self.players[user.uid].steps_of_seven_remaining = 7

            elif self.players[user.uid].steps_of_seven_remaining - steps < 0:
                """
                this is the case when a player wants to take more steps then he has left remaining
                """
                return {
                    "requestValid": False,
                    "note": f"You attempted to take {steps} steps, however you only have \
                        {self.players[user.uid].steps_of_seven_remaining} steps left of your seven.",
                }

            for i in range(steps):
                # check whether pnt is looking at the own exit node and if it can enter
                if marble.can_enter_goal and pointer_to_node.get_is_entry_node_for_player_at_position(current_player.position):
                    flag_home_is_blocking = False
                    # make a copy of the pointer to check whether or not the home fields are blocking
                    pnt_copy = pointer_to_node.curr
                    pnt_copy = pnt_copy.exit
                    # pnt_copy.next = pnt_copy.exit
                    # check the remaining steps in goal for blockage
                    # one less step as the pointer has moved one through pnt_copy.exit
                    for _ in range(i, steps - 1):
                        flag_home_is_blocking = pnt_copy.is_blocking()
                        pnt_copy = pnt_copy.next
                        if pnt_copy is None:
                            # pnt can only be None when the last node of the home fields has been reached
                            return {
                                "requestValid": False,
                                "note": f"You cannot enter your goal without going to far.",
                            }

                    # if the the pointer was not blocked on its way in the home, then it is a valid action
                    if not flag_home_is_blocking:
                        pointer_to_node = pnt_copy
                        flag_has_entered_home = True
                        break  # break out ouf the for loop taking all action steps, as they were taken by the pnt_copy pointer
                    # if the pointer was blocked along its steps, then the marble couldn't enter the home
                    else:
                        pointer_to_node = pointer_to_node.next
                else:
                    pointer_to_node = pointer_to_node.next

                # check whether a marble is blocking along the way
                if pointer_to_node.is_blocking():
                    return {
                        "requestValid": False,
                        "note": f"Blocked by a marble at position {pointer_to_node.position}.",
                    }

                # this needs to be inside of the for loop as the 7 card kicks every marble along its path
                # not just the one it lands on
                # is the is_blocking() redundant? i think it breaks before anyway
                if pointer_to_node.has_marble() and not pointer_to_node.is_blocking():
                    # kick the marble
                    pointer_to_node.marble.reset_to_starting_position()

            # performing any motion with a marble on the field removes the blocking capability
            # however entering the goals makes the marble blocking again
            # if the marble position is >= 1000 then the marble is at home and therefore blocking
            marble.is_blocking = False + (pointer_to_node.position >= 1000)
            marble.can_enter_goal = True
            marble.set_new_position(pointer_to_node)
            self.players[user.uid].steps_of_seven_remaining -= steps

            if self.players[user.uid].steps_of_seven_remaining == 0:
                self.increment_active_player_index()

                self.top_card = self.players[user.uid].hand.play_card(
                    action.card)
                self.players[user.uid].steps_of_seven_remaining = -1

                self.discarded_cards.append(self.top_card)

            return {
                "requestValid": True,
                "note": f"Marble {action.mid} moved to {marble.currentNode.position}.",
                # "positions": {"old": old_position, "new": marble.currentNode.position}
            }

    """
    Event Assertions
    """
    """
    TODO: 
    def check_player_can_move(self, player):
        cards = self.players[player.uid].hand.cards
        marbles = self.players[player.uid].marbles
    """

    def check_card_marble_action(self, user: UserModel, action: ActionModel, marble: Marble):
        """
        function to test if a marble can perform a certain action
        should be executed on a copy of marbles such that the marble positions are not
        overridden
        """
        print(marble)
        if action == 0:
            pnt = marble.currentNode
            if pnt is not None:
                return False
            if pnt.next.is_blocking():
                return False
            return True
        elif action in [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13]:
            # check you are not in the starting position
            pnt = marble.currentNode
            if pnt is None:
                return False

            for _ in range(action.action):

                # check whether pnt is looking at the own exit node and if it can enter
                if marble.can_enter_goal and pnt.get_entry_node() == user.uid:
                    pnt = pnt.exit
                else:
                    pnt = pnt.next
                # check whether a marble is blocking along the way
                if pnt.is_blocking():
                    return False
            return True
        elif action == "switch":
            pnt = marble.currentNode
            if pnt is None:
                return False
            if pnt.is_blocking():
                return False
            if self.players[action.pid_2].marbles[action.mid_2].curr.is_blocking():
                return False
            if self.players[action.pid_2].marbles[action.mid_2].curr is None:
                return False
            return True
        elif action == 7:

            logging.info("marble = " + str(marble))
            assert isinstance(marble, list)
            total_distance_to_blockade = 0
            for m in marble:  # for all the players marbles check how far they can be moved to the next blocking marble
                pnt = m.currentNode
                # move until the current marble m is blocked
                while (
                    pnt is not None
                    and pnt.next is not None
                    and not pnt.next.is_blocking()
                ):
                    pnt = pnt.next
                    # count the steps the marble m can take without being blocked
                    total_distance_to_blockade += 1
                    if total_distance_to_blockade > 7:
                        break

            if total_distance_to_blockade < 7:
                return False
            return True

    """
    GAMESTATE:

    write and read the full game state as JSON
    """

    def get_cards(self, player):
        return self.players[player.uid].private_state()

    def public_state(self):
        return {
            "game_id": self.game_id,
            "game_name": self.game_name,
            "n_players": self.n_players,
            "host": self.host.to_json(),
            "game_state": self.game_state,
            "round_state": self.round_state,
            "round_turn": self.round_turn,
            "order": self.order,
            "active_player_index": self.active_player_index,
            "players": {uid: self.players[uid].to_json() for uid in self.order},
            "player_list": [self.players[uid].to_json() for uid in self.order],
            "top_card": self.top_card.to_json() if self.top_card is not None else None,
        }

    def to_dict(self):
        """
        Return game state as a JSON object
        """
        return {
            "game_id": self.game_id,
            "game_name": self.game_name,
            "host": self.host.to_json(),
            "game_state": self.game_state,
            "round_state": self.round_state,
            "round_turn": self.round_turn,
            "deck": self.deck.to_json(),
            "players": [self.players[uid].to_json() for uid in self.order],
            "order": self.order,
            "active_player_index": self.active_player_index,
            "top_card": self.top_card.to_json() if self.top_card is not None else None,
        }

    def to_json(self, filename):
        """ TODO: dump dict into json file """
        pass

#==============================================================================
# Alternative constructors

    @classmethod
    def from_dict(cls, args):
        """
        Create a brandi instance from a dictionary. 
        """
        init_args = args["init_args"]

        # make the host argument a valid User model
        host = UserModel(**init_args["host"])
        init_args["host"] = host
        
        Game = cls(**init_args)

        players = args.get("players")
        if players:
            for player in players:
                # skip host as he is already part of the game
                if not player["uid"] == host.uid:
                    Game.player_join(UserModel(**player))
        
        # TODO:
        marbles = args.get("marbles")
        if marbles:
            for marble in marbles:
                pass

        cards = args.get("cards")
        if cards:
            for card in cards:
                pass

        return Game

    @classmethod
    def from_json(cls, filename):
        """ TODO: parse json and construct the class from the resulting dict """
        pass

