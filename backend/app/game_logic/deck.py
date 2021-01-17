import random
from typing import List

from app.game_logic.card import Card


class Deck():

    def __init__(self, seed: int) -> None:
        if seed:
            random.seed(seed)

        self.seed = seed

        values = ['A', 'K', 'Q', 'Ja', '10', '9',
                  '8', '7', '6', '5', '4', '3', '2']
        colors = ['clubs', 'diamonds', 'hearts', 'spades']

        self.cards: List[Card] = []

        N = 0
        for value in values:  # go through all card values except the Joker
            for color in colors:  # go through all 4 colors
                for _ in range(2):  # playing with two decks
                    self.cards.append(Card(value, color, N))
                    N += 1

        # add the 6 jokers
        for _ in range(6):
            self.cards.append(Card('Jo', 'Jo', N))
            N += 1

        random.shuffle(self.cards)  # shuffle the deck

    def give_card(self) -> Card:
        return self.cards.pop(0)

    def deck_size(self) -> Card:
        return len(self.cards)

    def reshuffle_cards(self, discarded_cards: List[Card]) -> None:
        self.cards = discarded_cards
        random.shuffle(self.cards)
    """
    Deck State:

    write and read the state of the deck as JSON
    """

    def to_json(self):
        return [card.uid for card in self.cards]

    def to_dict(self):
        return {
            "cards": [card.to_dict() for card in self.cards],
            "seed": self.seed
        }

    @classmethod
    def from_dict(cls, args):
        NewDeck = cls(args["seed"])
        NewDeck.cards = [Card.from_dict(**card) for card in args["cards"]]

        return NewDeck
