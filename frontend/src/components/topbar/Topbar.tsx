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
          {props.player && (
            <ConnectionIndicator socketConnected={props.socketConnected} />
          )}
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
          {props.player ? (
            <span id="player-logout" className="subnav">
              <Link id="player-btn" className="nav-btn" to="/users/settings">
                <img src="/player-icon.svg" id="player-icon" alt="p-icon" />
                {props.player.username}
              </Link>
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
      {!props.socketConnected && props.player && (
        <div id="connection-lost">
          Connection lost...{" "}
          <button
            id="reconnect-btn"
            className="btn"
            onClick={props.clearSocket}
          >
            Try to reconnect
          </button>
        </div>
      )}
    </header>
  );
};

export default withRouter(TopBar);
