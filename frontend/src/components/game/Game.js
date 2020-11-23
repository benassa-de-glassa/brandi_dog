import React, { Component } from "react";

import Chat from "../chat/Chat";
import Board from "../board/Board";
import Board6 from "../board/Board6";
import Controls from "../controls/Controls";

import { socket } from '../../api/socket'
import { postToBackend } from '../../api/fetch_backend'

import { possibleActions } from '../../constants/game_config'

const colors = ["red", "yellow", "green", "blue"];

class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 
            numberOfPlayers: 4, // default to 4 players

            // updated by socket.io
            players: [],
            activePlayerIndex: null,
            playerIsActive: false,
            cards: [], // player cards
            allMarbles: [],
            marbles: [], // player marbles
            gameState: null, // see backend for numbers
            roundState: null, // see backend for numbers
            topCard: null,

            // updated by front-end
            switchingSeats: false,
            selectedCardIndex: null, // card that is selected by the user
            selectedMarble: null,
            tooltipActions: [],
            marbleToSwitch: null,
            cardSwapConfirmed: false,
            cardBeingSwapped: 0, // index of the card that is being swapped to highlight it
            jokerCard: "A", // default, selects which card is imitated by the joker
            remainingStepsOf7: 7, // only allow choosing that many steps in the tooltip

            errorMessage: "", // display errors related to the game
        };

        this.resetState = this.resetState.bind(this);
        this.handleNewGameState = this.handleNewGameState.bind(this);
        this.handleNewPlayerState = this.handleNewPlayerState.bind(this);
        this.switchSeats = this.switchSeats.bind(this);
        this.setNewPosition = this.setNewPosition.bind(this);

        this.startGame = this.startGame.bind(this);
        this.swapCard = this.swapCard.bind(this);

        this.cardClicked = this.cardClicked.bind(this);
        this.marbleClicked = this.marbleClicked.bind(this);
        this.tooltipClicked = this.tooltipClicked.bind(this);
        this.fold = this.fold.bind(this);
        this.setJokerCard = this.setJokerCard.bind(this);
    }

    componentDidMount() {
        socket.on("game-state", (data) => {
            this.handleNewGameState(data);
        });
        socket.on("player-state", (data) => {
            this.handleNewPlayerState(data);
        });
    }

    componentWillUnmount() {
        socket.off("game-state");
        socket.off("player-state");
    }

    resetState() {
        // reset the state on the front-end specific keys
        this.setState({
            selectedCardIndex: null,
            selectedMarble: null,
            tooltipActions: [],
            marbleToSwitch: null,
            cardSwapConfirmed: false,
            jokerCard: "A",
            remainingStepsOf7: 7,
            errorMessage: "",
        });
    }

    handleNewGameState(data) {
        if (data.round_state === 4) {
            this.setState({ cardSwapConfirmed: false });
        }
        const players = data.order.map((uid) => data.players[uid]);
        let marbles = [];
        data.order.forEach((uid) => {
            marbles.push(...data.players[uid].marbles);
        });
        marbles = marbles.map((marble) => {
            return { ...marble, color: colors[parseInt(Math.floor(marble.mid / 4))] };
        });
        data.number_of_players = 4;

        this.setState((prevState) => ({
            ...prevState,
            players: players,
            allMarbles: marbles,
            gameState: data.game_state,
            roundState: data.round_state,
            activePlayerIndex: data.active_player_index,
            topCard: data.top_card,
            playerIsActive:
                players[data.active_player_index]?.uid === this.props.player.uid,
            cardSwapConfirmed: data.round_state < 2,
            numberOfPlayers: data.number_of_players,
        }));
    }

    handleNewPlayerState(data) {
        const marbles = data.marbles.map((marble) => {
            return { ...marble, color: colors[parseInt(Math.floor(marble.mid / 4))] };
        });
        this.setState({
            cards: data.hand,
            marbles: marbles,
            remainingStepsOf7: data.steps_of_seven,
        });
    }

    switchSeats() {
        // called by Controls component upon click
        this.setState({ switchingSeats: true });
    }

    async setNewPosition(index) {
        const response = await postToBackend(
            `games/${this.props.gameID}/player_position`,
            index
        );
        if (response.code) {
            // something went wrong
            console.warn(`[${response.code}] ${response.message}`)
            this.setState({ errorMessage: response.message })
        } else {
            this.setState({ switchingSeats: false })
        }
    }

    cardClicked(index) {
        // deselect selected step & reset error message
        this.setState({
            selectedMarble: null,
            errorMessage: "",
        });
        if (index === this.state.selectedCardIndex) {
            // deselect the card if it is clicked again
            this.setState({
                selectedCardIndex: null,
                marblesToSelect: 0,
                selectedCardRequiresTooltip: false,
            });
        } else {
            const selectedCard = this.state.cards[index];
            this.setState({
                selectedCardIndex: index,
                marblesToSelect: selectedCard.value === "switch" ? 2 : 1,
            });
            console.log("select" + this.state.marblesToSelect + "marbles");
        }
    }

    async swapCard() {
        const index = this.state.selectedCardIndex
        const selectedCard = this.state.cards[index]

        const response = await postToBackend(
            `games/${this.props.gameID}/swap_cards`,
            { uid: selectedCard.uid }
        )

        if (response.code) {
            // something went wrong
            console.warn(`[${response.code}] ${response.message}`)
        } else {
            this.setState({
                cardSwapConfirmed: true,
                cardBeingSwapped: index,
            });
        }
    }

    async fold() {
        const response = await postToBackend(
            `games/${this.props.gameID}/fold`,
            this.props.player
        )

        if (response.code) {
            console.warn(`[${response.code}] ${response.message}`)
            this.setState({ errorMessage: response.message })
        } else {
            this.resetState()
        }
    }

    setJokerCard(val) {
        this.setState({ jokerCard: val });
    }

    tooltipClicked(action) {
        let selectedCard = this.state.cards[this.state.selectedCardIndex];
        let successCallback = () => { };

        this.performAction(
            this.state.selectedMarble,
            selectedCard,
            action,
            successCallback,
            () => { }
        ); // error callback
    }

    async performAction(
        marble,
        card,
        action,
        success = () => { },
        error = () => { }
    ) {
        // performs an action selected marble
        const response = await postToBackend(
            `games/${this.props.gameID}/action`,
            {
                card: {
                    uid: card.uid,
                    value: card.value,
                    color: card.color,
                    actions: card.actions
                },
                action: action,
                mid: marble.mid
            }
        )

        if (response.code) {
            // something went wrong
            error(response.message)
            this.setState({ errorMessage: response.message })
            console.warn(`[${response.code}] ${response.message}`)
        } else {
            success()
            this.setState({ tooltipActions: [] })

            // don't deselect the selected card if there are still sevens to be played
            if (this.state.remainingStepsOf7 === -1) {
                this.setState({ selectedCardIndex: null });
            }
        }
    }

    async performSwitch(card, ownMarble, otherMarble) {
        // reset stored marble in case of errors
        this.setState({ marbleToSwitch: null })

        const response = await postToBackend(
            `games/${this.props.gameID}/action`,
            {
                card: {
                    uid: card.uid,
                    value: card.value,
                    color: card.color,
                    actions: card.actions
                },
                action: 'switch',
                mid: ownMarble.mid,
                mid_2: otherMarble.mid
            }
        )
        if (response.code) {
            this.setState({ errorMessage: response.message })
            console.warn(`[${response.code}] ${response.message}`)
        }
    }

    marbleClicked(marble, homeClicked = false) {
        if (this.state.selectedCardIndex !== null) {
            let selectedCard = this.state.cards[this.state.selectedCardIndex];

            if (!selectedCard) {
                console.error("Selected card is", selectedCard);
                return;
            }
            // define variables that are overwritten in case a joker is played
            let selectedCardValue = selectedCard.value;
            let selectedCardActions = selectedCard.actions;

            if (selectedCardValue === "Jo") {
                selectedCardValue = this.state.jokerCard;
                selectedCardActions = possibleActions[this.state.jokerCard];
            }

            if (selectedCardActions.includes(0) && homeClicked) {
                // (try) to go out
                this.performAction(marble, selectedCard, 0);
                return;
            }
            // home is not clicked
            // remove the 0 from the options to see if a tooltip is needed
            // this is the case for the cards '4', 'A', and '7'
            let playableActions = selectedCardActions.filter(
                (action) => action !== 0
            );

            // if the card is a 7 only show the remaining steps as playable (e.g. [71, 72, 73] if 4 steps were already completed)
            if (selectedCardValue === "7" && this.state.remainingStepsOf7 !== -1) {
                playableActions = playableActions.filter(
                    (action) => action <= 70 + this.state.remainingStepsOf7
                );
            }

            if (selectedCardValue === "Ja") {
                let myColor = this.state.marbles[0].color;
                if (this.state.marbleToSwitch === null) {
                    // no other marble has been selected
                    this.setState({ marbleToSwitch: marble });

                    // check that one of my own and one not of my own is selected
                } else if (
                    marble.color === myColor &&
                    this.state.marbleToSwitch.color !== myColor
                ) {
                    // my own marble clicked second
                    this.performSwitch(selectedCard, marble, this.state.marbleToSwitch);
                } else if (
                    marble.color !== myColor &&
                    this.state.marbleToSwitch.color === myColor
                ) {
                    // other marble clicked second
                    this.performSwitch(selectedCard, this.state.marbleToSwitch, marble);
                } else {
                    console.debug("couldnt swap", marble, this.state.marbleToSwitch);
                    this.setState({
                        marbleToSwitch: null,
                        // the line below would otherwise take precedence over backend errors
                        //errorMessage: 'Choose one of your marbles, and one from another player.'
                    });
                }
            } else if (playableActions.length === 1) {
                // clicked on a marble on the field while a card with only one
                // possible action
                this.performAction(marble, selectedCard, playableActions[0]);
            } else {
                // clicked on a marble on the field for which multiple actions
                // are possible
                this.setState({
                    tooltipActions: playableActions,
                    selectedMarble: marble,
                });
            }
        }
    }

    async startGame(successCallback, errorCallback) {
        const response = await postToBackend(
            `games/${this.props.gameID}/start`,
            this.props.player
        )

        if (response.code) {
            // something went wrong
            errorCallback(response.message)
            console.warn(`[${response.code}] ${response.message}`)
        } else {
            successCallback()
        }
    }

    render() {
        return (
            <div className="game-container">
                {this.state.numberOfPlayers === 4 ?
                    (
                        <Board
                            numberOfPlayers={this.state.numberOfPlayers}
                            player={this.props.player}
                            playerList={this.state.players}
                            activePlayerIndex={this.state.activePlayerIndex}
                            marbleList={this.state.allMarbles}
                            selectedMarble={this.state.selectedMarble}
                            tooltipActions={this.state.tooltipActions}
                            tooltipClicked={this.tooltipClicked}
                            marbleClicked={this.marbleClicked}
                            selectedCard={this.state.cards[this.state.selectedCardIndex]}
                            topCard={this.state.topCard}
                            switchingSeats={this.state.switchingSeats}
                            submitNewTeams={this.submitNewTeams}
                            setNewPosition={this.setNewPosition}
                        />
                    ) : (
                        <Board6
                            numberOfPlayers={this.state.numberOfPlayers}
                            player={this.props.player}
                            playerList={this.state.players}
                            activePlayerIndex={this.state.activePlayerIndex}
                            marbleList={this.state.allMarbles}
                            selectedMarble={this.state.selectedMarble}
                            tooltipActions={this.state.tooltipActions}
                            tooltipClicked={this.tooltipClicked}
                            marbleClicked={this.marbleClicked}
                            selectedCard={this.state.cards[this.state.selectedCardIndex]}
                            topCard={this.state.topCard}
                            switchingSeats={this.state.switchingSeats}
                            submitNewTeams={this.submitNewTeams}
                            setNewPosition={this.setNewPosition}
                        />
                    )}
                <div className="right-container">
                    <Controls
                        players={this.state.players}
                        playerIsActive={this.state.playerIsActive}
                        gameState={this.state.gameState}
                        roundState={this.state.roundState}
                        cards={this.state.cards}
                        cardClicked={this.cardClicked}
                        selectedCardIndex={this.state.selectedCardIndex}
                        selectedCard={this.state.cards[this.state.selectedCardIndex]}
                        startGame={this.startGame}
                        possibleMoves={this.state.possibleMoves}
                        setJokerCard={this.setJokerCard}
                        jokerCard={this.state.jokerCard}
                        swapCard={this.swapCard}
                        fold={this.fold}
                        cardSwapConfirmed={this.state.cardSwapConfirmed}
                        cardBeingSwapped={this.state.cardBeingSwapped}
                        errorMessage={this.state.errorMessage}
                        switchSeats={this.switchSeats}
                        switchingSeats={this.state.switchingSeats}
                    />
                    <Chat player={this.props.player} gameID={this.props.gameID} />
                </div>
            </div>
        );
    }
}

export default Game;
