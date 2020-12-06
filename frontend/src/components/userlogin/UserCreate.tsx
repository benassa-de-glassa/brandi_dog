import React, { useState, Fragment } from "react";

import { Link } from "react-router-dom";
import { UserCreateProps, UserCreateState } from "../../models/user.model";

function UserCreate(props: UserCreateProps) {
  const [state, setState] = useState({
    username: "",
    password: "",
    success: false,
    error: "",
  } as UserCreateState);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // supply callback in case of error
    props.createUser(
      state.username,
      state.password,
      () => setState({ success: true } as UserCreateState), // success callback
      setError // error callback
    );
  };

  const setError = (message: string) => {
    setState({
      username: "",
      password: "",
      success: false,
      error: message,
    });
  };

  return (
    <div className="form-container">
      {state.success ? (
        <Fragment>
          <p>User creation successful. You can log in now.</p>
          <Link className="top-bar-link" to="/users/login">
            Login
          </Link>
        </Fragment>
      ) : (
        <Fragment>
          <p className={state.error ? "error" : ""}>{state.error}</p>
          <form className="ml-auto mr-2" onSubmit={handleSubmit}>
            <label className="mr-1">Create user account: </label>
            <input
              name="username"
              // label='USERNAME'
              type="text"
              className="mr-1"
              value={state.username}
              onChange={handleChange}
              placeholder="Username"
            />
            <input
              name="password"
              // label='PASSWORD'
              type="password"
              className="mr-1"
              value={state.password}
              onChange={handleChange}
              placeholder="Password"
            />
            <input type="submit" className="top-bar-link" value="Create user" />
          </form>
        </Fragment>
      )}
    </div>
  );
}

export default UserCreate;
