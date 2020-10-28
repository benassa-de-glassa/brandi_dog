import React from 'react'

const color2unicode = {
  spades: '\u2660',
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663'
}


function Hand(props) {
  return (
    <div className="hand">
      {props.cards.map((card, index) =>
        <div
          key={card.uid}
          className={(index === props.cardBeingSwapped && props.cardSwapConfirmed && props.roundState === 2) 
            ? "card card-highlighted" 
            : (index === props.selectedCardIndex && !props.cardSwapConfirmed) 
              ? "card card-selected"
              : "card"
            }
          onClick={() => props.cardClicked(index)}
        >
          <span className="card-value">{card.value}</span>
          <span className='card-color'>{color2unicode[card.color]}</span>
        </div>
      )}
    </div>
  )
}

export default Hand;
