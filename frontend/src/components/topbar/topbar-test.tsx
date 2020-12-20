import React, { Fragment } from "react";

import "./topbar.css";

import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { TopBarProps } from "../../models/topbar.model";

import { ConnectionIndicator } from "./ConnectionIndicator";

const TopBar: React.FunctionComponent<TopBarProps & RouteComponentProps> = (
  props: TopBarProps
) => {
  return (
    <header>
      <ConnectionIndicator socketConnected={props.socketConnected} />
      {!props.socketConnected && props.playerLoggedIn && (
        <input
          type="button"
          className="top-bar-link ml-2 white"
          value="Try to reconnect"
          onClick={props.clearSocket}
        />
        
      )}
      <div id="topbar">
        <Link id="title" className="top-bar-link ml-2 mr-2" to="/">
          Boomer Dog{"\u2122"}
        </Link>
        <div id="navbar">
          <Link className="top-bar-link ml-2" to="/about">
            About
          </Link>
          {props.location.pathname === "/" ? (
            <input
              type="button"
              className="top-bar-link ml-2 mr-2"
              value={props.showMenu ? "Hide Menu" : "Menu"}
              onClick={props.toggleMenu}
            />
          ) : (
            <Link className="top-bar-link ml-2" to="/">
              Home
            </Link>
          )}

          {props.playerLoggedIn ? (
            <span className="ml-auto mr-2">
              Playing as{" "}
              <span className="bold">
                {props.player.username} (#{props.player.uid})
              </span>
              <input
                type="button"
                className="top-bar-link ml-2 mr-2 mt-1 mb-1"
                value="Logout"
                onClick={props.logout}
              />
            </span>
          ) : (
            <Fragment>
              <Link className="top-bar-link mr-2 ml-auto" to="/users/login">
                Login
              </Link>
              <Link className="top-bar-link mr-2" to="/users/create">
                Create User
              </Link>
            </Fragment>
          )}
        </div>
        <button id="hamburger-button">hello</button>
      </div>
    </header>
  );
};

export default withRouter(TopBar);
