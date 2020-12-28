import React, { useState } from "react";

import { UserCreateProps, UserCreateState } from "../../models/user.model";

function UserCreate(props: UserCreateProps) {
  const [state, setState] = useState({
    username: "",
    password: "",
    success: false,
    error: "",
  } as UserCreateState);

  const [avatar, setAvatar] = useState("lama.png")

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // supply callback in case of error
    props.createUser(
      state.username,
      state.password,
      avatar,
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
    <div className="container user-container">
      <div className="form-container">
        {state.success ? (
          <div className="success">
            User creation successful. You can log in now.
          </div>
        ) : (
          <div>
            {state.error && <div className="error"> {state.error}</div>}
            <form className="user-form" onSubmit={handleSubmit}>
              <label>Create user account: </label>
              <input
                name="username"
                // label='USERNAME'
                type="text"
                value={state.username}
                onChange={handleChange}
                placeholder="Username"
              />
              <input
                name="password"
                // label='PASSWORD'
                type="password"
                value={state.password}
                onChange={handleChange}
                placeholder="Password"
              />
              <input type="submit" className="btn" value="Create user" />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserCreate;
