import React, { Component } from 'react'

import Chat from '../chat/Chat'
import Board from '../board/Board'
import Controls from '../controls/Controls'

import { socket } from '../../socket'
import { postData } from '../../paths'

import {possibleActions} from '../../config'

class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // updated by socket.io
            players: [],
            activePlayerIndex: null,
            playerIsActive: false,
            cards: [],          // player cards
            allMarbles: [],
            marbles: [],        // player marbles
            gameState: null,    // see backend for numbers
            roundState: null,   // see backend for numbers
            topCard: null,

            // updated by front-end
            switchingSeats: false,
            selectedCardIndex: null,
            selectedAction: null,
            selectedMarble: null,
            tooltipActions: [],
            marbleToSwitch: null,
            cardSwapConfirmed: false,
            cardBeingSwapped: 0,    // index of the card that is being swapped to highlight it
            jokerCard: 'A',         // default, selects which card is imitated by the joker
            remainingStepsOf7: 7,   // only allow choosing that many steps in the tooltip

            errorMessage: '',       // display errors related to the game
        }

        this.resetState = this.resetState.bind(this)
        this.handleNewGameState = this.handleNewGameState.bind(this)
        this.handleNewPlayerState = this.handleNewPlayerState.bind(this)
        this.switchSeats = this.switchSeats.bind(this)
        this.submitNewTeams = this.submitNewTeams.bind(this)

        this.startGame = this.startGame.bind(this)
        this.swapCard = this.swapCard.bind(this)

        this.cardClicked = this.cardClicked.bind(this)
        this.marbleClicked = this.marbleClicked.bind(this)
        this.tooltipClicked = this.tooltipClicked.bind(this)
        this.fold = this.fold.bind(this)
        this.setJokerCard = this.setJokerCard.bind(this)
    }

    componentDidMount() {
        socket.on('game-state', data => {
            console.log('received game state', data)
            this.handleNewGameState(data)
        })
        socket.on('player-state', data => {
            console.log('received player state', data)
            this.handleNewPlayerState(data)
        })
    }

    componentWillUnmount() {
        socket.off('game-state')
        socket.off('player-state')
    }

    resetState() {
        // reset the state on the front-end specific keys
        this.setState({
            selectedCardIndex: null,
            selectedAction: null,
            selectedMarble: null,
            tooltipActions: [],
            marbleToSwitch: null,
            cardSwapConfirmed: false,
            jokerCard: 'A',     
            remainingStepsOf7: 7,
            errorMessage: '',
        })
    }

    handleNewGameState(data) {
        if (data.round_state === 4) {
            this.setState({ cardSwapConfirmed: false })
        }
        const players = data.order.map(uid => data.players[uid])
        var marbles = []
        data.order.forEach(uid => {
            marbles.push(...data.players[uid].marbles)
        })
        this.setState(prevState =>
            ({
                ...prevState,
                players: players,
                allMarbles: marbles,
                gameState: data.game_state,
                roundState: data.round_state,
                activePlayerIndex: data.active_player_index,
                topCard: data.top_card,
                playerIsActive: players[data.active_player_index].uid === this.props.player.uid,
                cardSwapConfirmed: data.round_state < 2
            })
        )
    }

    handleNewPlayerState(data) {
        this.setState({
            cards: data.hand,
            marbles: data.marbles
        })
    }

    switchSeats() {
        // called by Controls component upon click
        this.setState({ switchingSeats: true })
    }

    async submitNewTeams(newTeams) {
        // called by Board component when another player's seat is clicked
        const relURL = 'games/' + this.props.gameID + '/teams'
        const response = await postData(relURL,
            newTeams
        )
        const responseJson = await response.json()
        if (response.status === 200) {
            this.setState({ switchingSeats: false })
        } else {
            this.setState({ errorMessage: responseJson.detail })
            console.log(responseJson)
        }
    }

    cardClicked(index) {
        // deselect selected step & reset error message
        this.setState({ 
            selectedMarble: null,
            errorMessage: ''
        })
        if (index === this.state.selectedCardIndex) {
            // deselect the card if it is clicked again
            this.setState({
                selectedCardIndex: null,
                marblesToSelect: 0,
                selectedCardRequiresTooltip: false,
            })
        } else {
            const selectedCard = this.state.cards[index]
            this.setState({
                selectedCardIndex: index,
                marblesToSelect: selectedCard.value === 'switch' ? 2 : 1,
            })
            console.log('select' + this.state.marblesToSelect + 'marbles')
        }
    }

    async swapCard() {
        const index = this.state.selectedCardIndex
        const selectedCard = this.state.cards[index]
        console.debug('try to swap', selectedCard)
        const relURL = 'games/' + this.props.gameID + '/swap_cards '
        const response = await postData(relURL, {uid: selectedCard.uid} )
        const responseJson = await response.json()
        console.log(responseJson)
        if (response.status === 200) {
            this.setState({ 
                cardSwapConfirmed: true,
                cardBeingSwapped: index
            })
        }
    }

    async fold() {
        const relURL = 'games/' + this.props.gameID + '/fold'
        const response = await postData(relURL, this.props.player)
        const responseJson = await response.json()
        if (response.status === 200) {
            this.resetState()
        } else {
            this.setState({ errorMessage: responseJson.detail })
        }
    }

    setJokerCard(val) {
        this.setState({ jokerCard: val })
    }

    marbleClicked(marble, homeClicked = false) {
        if (this.state.selectedCardIndex !== null) {
            let selectedCard = this.state.cards[this.state.selectedCardIndex]

            if (!selectedCard) { 
                console.error('Selected card is', selectedCard)
                return 
            }
            // define variables that are overwritten in case a joker is played
            let selectedCardValue = selectedCard.value
            let selectedCardActions = selectedCard.actions

            if (selectedCardValue === 'Jo') {
                selectedCardValue = this.state.jokerCard
                selectedCardActions = possibleActions[this.state.jokerCard]
            }

            if (selectedCardActions.includes(0) && homeClicked) {
                // (try) to go out
                this.performAction(marble, selectedCard, 0)
                return
            }
            // home is not clicked
            // remove the 0 from the options to see if a tooltip is needed
            // this is the case for the cards '4', 'A', and '7'
            let playableActions = selectedCardActions.filter(action => action !== 0)
            console.log(playableActions)
            
            if (selectedCardValue === 'Ja') {
                let myColor = this.state.marbles[0].color
                if (this.state.marbleToSwitch === null) {
                    // no other marble has been selected
                    this.setState({ marbleToSwitch: marble })

                    // check that one of my own and one not of my own is selected
                } else if (marble.color === myColor && this.state.marbleToSwitch.color !== myColor) {
                    // my own marble clicked second
                    this.performSwitch(selectedCard, marble, this.state.marbleToSwitch)
                } else if (marble.color !== myColor && this.state.marbleToSwitch.color === myColor) {
                    // other marble clicked second
                    this.performSwitch(selectedCard, this.state.marbleToSwitch, marble)
                } else {
                    console.debug('couldnt swap', marble, this.state.marbleToSwitch)
                    this.setState({
                        marbleToSwitch: null,
                        // the line below would otherwise take precedence over backend errors
                        //errorMessage: 'Choose one of your marbles, and one from another player.'
                    })
                }
            } else if (playableActions.length === 1) {
                // clicked on a marble on the field while a card with only one 
                // possible action
                this.performAction(marble, selectedCard, playableActions[0])
                // this.setState({ selectedAction: selectedCardActions[0] })
            } else {
                // clicked on a marble on the field for which multiple actions
                // are possible
                this.setState({
                    tooltipActions: playableActions,
                    selectedMarble: marble
                })
            }
        } 
    }

    tooltipClicked(action) {
        let selectedCard = this.state.cards[this.state.selectedCardIndex]
        let successCallback
        selectedCard.value === '7'
            ? successCallback = () => {
                this.setState(prevState => {
                    return { remainingStepsOf7: prevState.remainingStepsOf7 - action }
                }, () => { // callback after state is updated
                    if (this.state.remainingStepsOf7 === 0) {
                        this.setState({ remainingStepsOf7: 7 })
                    }
                })
            }
            : successCallback = () => { }

        this.performAction(
            this.state.selectedMarble,
            selectedCard,
            action,
            successCallback,
            () => { }) // error callback
    }

    async performAction(marble, card, action, success = () => { }, error = () => { }) {
        // performs an action selected marble
        const relURL = 'games/' + this.props.gameID + '/action'
        const response = await postData(relURL,
            {
                card: {
                    uid: card.uid,
                    value: card.value,
                    color: card.color,
                    actions: card.actions
                },
                action: action,
                mid: marble.mid
            })
        const responseJson = await response.json()
        if (response.status === 200) {
            success()
            this.setState({
                selectedCardIndex: null,
                selectedAction: null,
                tooltipActions: [],
            })
        } else {
            error(responseJson.detail)
            this.setState({ errorMessage: responseJson.detail })
            console.log(responseJson)
        }
    }

    async performSwitch(card, ownMarble, otherMarble) {
        // reset stored marble in case of errors
        this.setState({ marbleToSwitch: null })

        const relURL = 'games/' + this.props.gameID + '/action'
        const response = await postData(relURL,
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
            })
        const responseJson = await response.json()
        if (response.status === 200) {
        } else {
            this.setState({ errorMessage: responseJson.detail })
            console.log(responseJson)
        }
    }

    async startGame(successCallback, errorCallback) {
        const relURL = 'games/' + this.props.gameID + '/start'
        const response = await postData(relURL,
            this.props.player,
        )
        const responseJson = await response.json()
        if (response.status === 200) {
            successCallback()
        } else {
            errorCallback(responseJson.detail)
            console.log(responseJson)
        }
    }

    render() {
        return (
            <div className="game-container">
                <Board
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
                />
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
                    />
                    <Chat 
                        player={this.props.player}
                        gameID={this.props.gameID} />
                </div>

            </div>
        )
    }
}

export default Game;