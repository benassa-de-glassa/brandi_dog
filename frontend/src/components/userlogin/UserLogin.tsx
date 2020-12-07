import React, { useState, Fragment } from "react";
import { UserLoginProps } from "../../models/user.model";

function UserLogin(props: UserLoginProps) {
  const [state, setState] = useState({
    username: "",
    password: "",
    error: "",
  });
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // hide error, when the entries change
    setState({ ...state, [event.target.name]: event.target.value, error: "" });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // supply callback in case of error
    props.login(
      state.username,
      state.password,
      setError // error callback
    );
  };

  const setError = (message: string) => {
    setState({
      username: "",
      password: "",
      error: message,
    });
  };

  return (
    <div className="form-container">
      {props.playerLoggedIn ? (
        <p>Login successful.</p>
      ) : (
        <Fragment>
          <p className="error">{state.error}</p>
          <form className="ml-auto mr-2" onSubmit={handleSubmit}>
            <label className="mr-1">Log in: </label>
            <input
              name="username"
              title="USERNAME"
              type="text"
              className="mr-1"
              value={state.username}
              onChange={handleChange}
              placeholder="Username"
            />
            <input
              name="password"
              title="PASSWORD"
              type="password"
              className="mr-1"
              value={state.password}
              onChange={handleChange}
              placeholder="Password"
            />
            <input type="submit" className="top-bar-link" value="Submit" />
          </form>
        </Fragment>
      )}
    </div>
  );
}

export default UserLogin;
