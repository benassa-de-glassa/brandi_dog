import React, { useState } from "react";
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
    <div className="container user-container">
      <div className="form-container">
        {state.error && <div className="error"> {state.error}</div>}
        {props.player ? (
          <div className="success">Login successful.</div>
        ) : (
          <form className="user-form" onSubmit={handleSubmit}>
            <label><h3>Log in</h3></label>
            <input
              name="username"
              title="USERNAME"
              type="text"
              value={state.username}
              onChange={handleChange}
              placeholder="Username"
            />
            <input
              name="password"
              title="PASSWORD"
              type="password"
              value={state.password}
              onChange={handleChange}
              placeholder="Password"
            />
            <input type="submit" className="btn" value="Submit" />
          </form>
        )}
      </div>
    </div>
  );
}

export default UserLogin;
