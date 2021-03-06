from .card import Card


class Hand():
    def __init__(self) -> None:
        self.cards = {}

    def play_card(self, card: Card) -> Card:
        assert card.uid in self.cards
        return self.cards.pop(card.uid)

    def set_card(self, card: Card) -> None:
        assert card.uid not in self.cards
        self.cards[card.uid] = card

    def fold(self) -> None:
        self.cards = {}

    def to_json(self):
        return [card.to_json() for card in self.cards.values()]

    def to_dict(self):
        return {
            "cards": {card_id: card.to_dict() for card_id, card in self.cards.items()}
        }

    @classmethod
    def from_dict(cls, args):
        NewHand = cls()
        NewHand.cards = {card_id: Card.from_dict(
            card) for card_id, card in args["cards"].items()}

        return NewHand
