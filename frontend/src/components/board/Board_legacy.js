import React from 'react'


function Board(props) {
  var onClickHandler = function (d) {
    console.log(d)
  }

  return (
    <svg id="board">
      {/* <!-- build the board components clock-wise, but the steps are
            counted counter-clockwise!! --> */}

      {/* <!-- top horizontal five --> */}
      <circle onClick={onClickHandler(this.id)} id="step-08" className="step" cx="38.6%" cy="22.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-07" className="step" cx="44.3%" cy="22.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-06" className="step" cx="50.0%" cy="22.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-05" className="step" cx="55.7%" cy="22.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-04" className="step" cx="61.4%" cy="22.6%" r="12" />

      {/* <!-- top right ascending  outwards --> */}
      <circle onClick={onClickHandler(this.id)} id="step-3" className="step" cx="65.4%" cy="18.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-2" className="step" cx="69.4%" cy="14.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-1" className="step" cx="73.4%" cy="10.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-0" className="step" cx="77.4%" cy="06.6%" r="12" />

      <circle onClick={onClickHandler(this.id)} className="step out out-red" cx="77.4%" cy="06.6%" r="18" /> 

      {/* <!-- top right descending outwards --> */}
      <circle onClick={onClickHandler(this.id)} id="step-63" className="step" cx="81.4%" cy="10.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-62" className="step" cx="85.4%" cy="14.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-61" className="step" cx="89.4%" cy="18.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-60" className="step" cx="93.4%" cy="22.6%" r="12" />

      {/* <!-- right descending towards middle --> */}
      <circle onClick={onClickHandler(this.id)} id="step-59" className="step" cx="89.4%" cy="26.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-58" className="step" cx="85.4%" cy="30.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-57" className="step" cx="81.4%" cy="34.6%" r="12" />

      {/* <!-- right vertical five--> */}
      <circle onClick={onClickHandler(this.id)} id="step-56" className="step" cx="77.4%" cy="38.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-55" className="step" cx="77.4%" cy="44.3%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-54" className="step" cx="77.4%" cy="50.0%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-53" className="step" cx="77.4%" cy="55.7%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-52" className="step" cx="77.4%" cy="61.4%" r="12" />

      {/* <!-- right bottom descending outwards --> */}
      <circle onClick={onClickHandler(this.id)} id="step-51" className="step" cx="81.4%" cy="65.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-50" className="step" cx="85.4%" cy="69.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-49" className="step" cx="89.4%" cy="73.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-48" className="step" cx="93.4%" cy="77.4%" r="12" />

      <circle onClick={onClickHandler(this.id)} className="step out out-yellow" cx="93.4%" cy="77.4%" r="18" />

      {/* <!-- right bottom descending towards middle --> */}
      <circle onClick={onClickHandler(this.id)} id="step-47" className="step" cx="89.4%" cy="81.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-46" className="step" cx="85.4%" cy="85.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-45" className="step" cx="81.4%" cy="89.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-44" className="step" cx="77.4%" cy="93.4%" r="12" />

      {/* <!-- right bottom ascending towards middle --> */}
      <circle onClick={onClickHandler(this.id)} id="step-43" className="step" cx="73.4%" cy="89.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-42" className="step" cx="69.4%" cy="85.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-41" className="step" cx="65.4%" cy="81.4%" r="12" />

      {/* <!-- bottom horizontal five --> */}
      <circle onClick={onClickHandler(this.id)} id="step-40" className="step" cx="61.4%" cy="77.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-39" className="step" cx="55.7%" cy="77.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-38" className="step" cx="50.0%" cy="77.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-37" className="step" cx="44.3%" cy="77.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-36" className="step" cx="38.6%" cy="77.4%" r="12" />

      {/* <!-- bottom left descending outwards --> */}
      <circle onClick={onClickHandler(this.id)} id="step-35" className="step" cx="34.6%" cy="81.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-34" className="step" cx="30.6%" cy="85.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-33" className="step" cx="26.6%" cy="89.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-32" className="step" cx="22.6%" cy="93.4%" r="12" />

      <circle onClick={onClickHandler(this.id)} className="step out out-green" cx="22.6%" cy="93.4%" r="18" />

      {/* <!-- bottom left ascending outwards --> */}
      <circle onClick={onClickHandler(this.id)} id="step-31" className="step" cx="18.6%" cy="89.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-30" className="step" cx="14.6%" cy="85.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-29" className="step" cx="10.6%" cy="81.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-28" className="step" cx="06.6%" cy="77.4%" r="12" />

      {/* <!-- bottom left ascending towards middle --> */}
      <circle onClick={onClickHandler(this.id)} id="step-27" className="step" cx="10.6%" cy="73.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-26" className="step" cx="14.6%" cy="69.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-25" className="step" cx="18.6%" cy="65.4%" r="12" />

      {/* <!-- left vertical five--> */}
      <circle onClick={onClickHandler(this.id)} id="step-24" className="step" cx="22.6%" cy="61.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-23" className="step" cx="22.6%" cy="55.7%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-22" className="step" cx="22.6%" cy="50.0%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-21" className="step" cx="22.6%" cy="44.3%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-20" className="step" cx="22.6%" cy="38.6%" r="12" />

      {/* <!-- top left ascending outwards --> */}
      <circle onClick={onClickHandler(this.id)} id="step-19" className="step" cx="18.6%" cy="34.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-18" className="step" cx="14.6%" cy="30.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-17" className="step" cx="10.6%" cy="26.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-16" className="step" cx="06.6%" cy="22.6%" r="12" />

      <circle onClick={onClickHandler(this.id)} className="step out out-blue" cx="06.6%" cy="22.6%" r="18" />

      {/* <!-- top left ascending towards middle --> */}
      <circle onClick={onClickHandler(this.id)} id="step-15"className="step" cx="10.6%" cy="18.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-14"className="step" cx="14.6%" cy="14.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-13"className="step" cx="18.6%" cy="10.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-12"className="step" cx="22.6%" cy="06.6% "r="12 "/>
      
      {/* <!-- top left descending towards middle --> */}
      <circle onClick={onClickHandler(this.id)} id="step-11" className="step" cx="26.6%" cy="10.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-10" className="step" cx="30.6%" cy="14.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="step-09" className="step" cx="34.6%" cy="18.6%" r="12" />

      {/* <!-- red home base --> */}
      <circle onClick={onClickHandler(this.id)} id="red-home-0" className="step" cx="69.4%" cy="6.6%" r="12"/>
      <circle onClick={onClickHandler(this.id)} id="red-home-1" className="step" cx="63.7%" cy="6.6%" r="12"/>
      <circle onClick={onClickHandler(this.id)} id="red-home-2" className="step" cx="58.0%" cy="6.6%" r="12"/>"
      <circle onClick={onClickHandler(this.id)} id="red-home-3" className="step" cx="52.3%" cy="6.6%" r="12"/>
      <circle onClick={onClickHandler(this.id)} className="step out out-red" cx="69.4%" cy="06.6%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-red" cx="63.7%" cy="06.6%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-red" cx="58.0%" cy="06.6%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-red" cx="52.3%" cy="06.6%" r="18" />

      {/* <!-- red house --> */}
      <circle onClick={onClickHandler(this.id)} id="red-house-0" className="step" cx="77.4%" cy="14.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="red-house-1" className="step" cx="77.4%" cy="20.3%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="red-house-2" className="step" cx="73.4%" cy="24.3%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="red-house-3" className="step" cx="69.4%" cy="28.3%" r="12" />
      <circle onClick={onClickHandler(this.id)} className="step out out-red" cx="77.4%" cy="14.6%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-red" cx="77.4%" cy="20.3%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-red" cx="73.4%" cy="24.3%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-red" cx="69.4%" cy="28.3%" r="18" />

      {/* <!-- yellow home base --> */}
      <circle onClick={onClickHandler(this.id)} id="yellow-home-0" className="step" cx="93.4%" cy="69.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="yellow-home-1" className="step" cx="93.4%" cy="63.7%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="yellow-home-2" className="step" cx="93.4%" cy="58.0%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="yellow-home-3" className="step" cx="93.4%" cy="52.3%" r="12" />
      <circle onClick={onClickHandler(this.id)} className="step out out-yellow" cx="93.4%" cy="69.4%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-yellow" cx="93.4%" cy="63.7%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-yellow" cx="93.4%" cy="58.0%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-yellow" cx="93.4%" cy="52.3%" r="18" />

      {/* <!-- yellow house --> */}
      <circle onClick={onClickHandler(this.id)} id="yellow-house-0" className="step" cx="85.4%" cy="77.3%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="yellow-house-1" className="step" cx="79.7%" cy="77.3%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="yellow-house-2" className="step" cx="75.7%" cy="73.3%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="yellow-house-3" className="step" cx="71.7%" cy="69.3%" r="12" />
      <circle onClick={onClickHandler(this.id)} className="step out out-yellow" cx="85.4%" cy="77.3%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-yellow" cx="79.7%" cy="77.3%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-yellow" cx="75.7%" cy="73.3%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-yellow" cx="71.7%" cy="69.3%" r="18" />

      {/* <!-- green home base --> */}
      <circle onClick={onClickHandler(this.id)} id="green-home-0" className="step" cx="30.6%" cy="93.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="green-home-1" className="step" cx="36.3%" cy="93.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="green-home-2" className="step" cx="42.0%" cy="93.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="green-home-3" className="step" cx="47.7%" cy="93.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} className="step out out-green" cx="30.6%" cy="93.4%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-green" cx="36.3%" cy="93.4%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-green" cx="42.0%" cy="93.4%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-green" cx="47.7%" cy="93.4%" r="18" />

      {/* <!-- green house --> */}
      <circle onClick={onClickHandler(this.id)} id="green-house-0" className="step" cx="22.6%" cy="85.4%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="green-house-1" className="step" cx="22.6%" cy="79.7%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="green-house-2" className="step" cx="26.6%" cy="75.7%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="green-house-3" className="step" cx="30.6%" cy="71.7%" r="12" />
      <circle onClick={onClickHandler(this.id)} className="step out out-green" cx="22.6%" cy="85.4%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-green" cx="22.6%" cy="79.7%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-green" cx="26.6%" cy="75.7%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-green" cx="30.6%" cy="71.7%" r="18" />

      {/* <!-- blue home base --> */}
      <circle onClick={onClickHandler(this.id)} id="blue-home-0" className="step" cx="06.6%" cy="30.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="blue-home-1" className="step" cx="06.6%" cy="36.3%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="blue-home-2" className="step" cx="06.6%" cy="42.0%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="blue-home-3" className="step" cx="06.6%" cy="47.7%" r="12" />
      <circle onClick={onClickHandler(this.id)} className="step out out-blue" cx="06.6%" cy="30.6%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-blue" cx="06.6%" cy="36.3%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-blue" cx="06.6%" cy="42.0%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-blue" cx="06.6%" cy="47.7%" r="18" />

      {/* <!-- blue house --> */}
      <circle onClick={onClickHandler(this.id)} id="blue-house-0" className="step" cx="14.6%" cy="22.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="blue-house-1" className="step" cx="20.3%" cy="22.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="blue-house-2" className="step" cx="24.3%" cy="26.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} id="blue-house-3" className="step" cx="28.3%" cy="30.6%" r="12" />
      <circle onClick={onClickHandler(this.id)} className="step out out-blue" cx="14.6%" cy="22.6%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-blue" cx="20.3%" cy="22.6%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-blue" cx="24.3%" cy="26.6%" r="18" />
      <circle onClick={onClickHandler(this.id)} className="step out out-blue" cx="28.3%" cy="30.6%" r="18" />
  </svg>
  )
}
  
export default Board;
  