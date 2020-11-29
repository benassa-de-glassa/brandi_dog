import React from 'react'

import Card from '../card/Card'


export default function Hand(props) {
    return (
        <div className="hand">
            {props.cards.map((card, index) =>
                <Card
                    key={card.uid}
                    value={card.value}
                    color={card.color}
                    highlighted={(index === props.cardBeingSwapped && props.cardSwapConfirmed && props.roundState === 2)}
                    selected={index === props.selectedCardIndex && !props.cardSwapConfirmed}
                    clickHandler={() => props.cardClicked(index)}
                />
            )}
        </div>
    )
}