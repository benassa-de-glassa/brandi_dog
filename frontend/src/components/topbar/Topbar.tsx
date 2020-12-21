import React, { useState } from "react";

import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { TopBarProps } from "../../models/topbar.model";

import { ConnectionIndicator } from "./ConnectionIndicator";

const TopBar: React.FunctionComponent<TopBarProps & RouteComponentProps> = (
  props: TopBarProps
) => {
  let [collapseNav, setCollapseNav] = useState(true);

  return (
    <header>
      <div id="topbar">
        <span>
          <ConnectionIndicator socketConnected={props.socketConnected} />
          <Link id="title" className="nav-btn" to="/">
            Boomer Dog{"\u2122"}
          </Link>
        </span>

        <nav id="nav-menu" className={collapseNav ? "" : "open"}>
          <span className="subnav">
            {props.location.pathname === "/" ? (
              <button className="nav-btn" onClick={props.toggleMenu}>
                Menu
              </button>
            ) : (
              <Link className="nav-btn" to="/">
                Home
              </Link>
            )}

            <Link className="nav-btn" to="/about">
              About
            </Link>
          </span>
          {props.playerLoggedIn ? (
            <span id="player-logout" className="subnav">
              <button id="player-btn" className="nav-btn">
                <img src="/player-icon.svg" id="player-icon" alt="p-icon" />
                {props.player.username}
              </button>
              <button className="nav-btn" onClick={props.logout}>
                Logout
              </button>
            </span>
          ) : (
            <span id="login-signup" className="subnav">
              <Link className="nav-btn" to="/users/login">
                Login
              </Link>
              <Link className="nav-btn" to="/users/create">
                Create user
              </Link>
            </span>
          )}
        </nav>
        <img
          src="/hamburger.svg"
          className="menu-btn"
          id="open-menu"
          alt="menu"
          onClick={() => setCollapseNav(!collapseNav)}
        />
      </div>
      {!props.socketConnected && props.playerLoggedIn && (
        <div id="connection-lost">
          Connection lost...{" "}
          <button id="reconnect-btn" onClick={props.clearSocket}>
            Try to reconnect
          </button>
        </div>
      )}
    </header>
  );
};

export default withRouter(TopBar);
