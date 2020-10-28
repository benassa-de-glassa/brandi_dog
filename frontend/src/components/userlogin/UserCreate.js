import React, { useState, Fragment } from 'react'

import { Link } from 'react-router-dom'

function UserCreate(props) {
    const [state, setState] = useState(
        {
            username: '',
            password: '',
            success: false,
            error: ''
        }
    )
    const handleChange = event => {
        setState({ ...state, [event.target.name]: event.target.value })
    }

    const handleSubmit = async event => {
        event.preventDefault();
        // supply callback in case of error
        props.createUser(
            state.username,
            state.password,
            () => setState({ success: true }),  // success callback
            setError    // error callback   
        )
    }

    const setError = (message) => {
        setState({ 
            username: '', 
            password: '', 
            success: false,
            error: message
        })
    }

    return (
        <div className='form-container'>
        { state.success 
            ?
            <Fragment>
                <p>User creation successful. You can log in now.</p>
                <Link className='top-bar-link' to='/users/login'>Login</Link>
            </Fragment>
            :
            <Fragment>
                <p className={state.error ? 'error' : ''}>{state.error}</p>
                <form className='ml-auto mr-2' onSubmit={handleSubmit}>
                    <label className='mr-1'>
                        Create user account: </label>
                    <input
                        name='username'
                        // label='USERNAME'
                        type='text'
                        className='mr-1'
                        value={state.username}
                        onChange={handleChange}
                        placeholder='Username'
                    />
                    <input
                        name='password'
                        // label='PASSWORD'
                        type='password'
                        className='mr-1'
                        value={state.password}
                        onChange={handleChange}
                        placeholder='Password'
                    />
                    <input type='submit' className='top-bar-link' value='Create user' />
                </form>
            </Fragment>
            }
        </div>
    )

}


export default UserCreate