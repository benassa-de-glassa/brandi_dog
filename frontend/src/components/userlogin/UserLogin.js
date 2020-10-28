import React, { useState, Fragment } from 'react'

function UserLogin(props) {
    const [state, setState] = useState(
        {
            username: '',
            password: '',
            error: ''
        }
    )
    const handleChange = event => {
        setState({ ...state, [event.target.name]: event.target.value })
    }

    const handleSubmit = async event => {
        event.preventDefault();
        // supply callback in case of error
        props.login(
            state.username,
            state.password,
            setError    // error callback   
        )
    }

    const setError = (message) => {
        setState({ 
            username: '', 
            password: '', 
            error: message
        })
    }

    return (
        <div className='form-container'>
                { props.playerLoggedIn
                    ?
                    <p>Login successful.</p>
                    :
                    <Fragment>
                        <p className='error'>{state.errorMessage}</p>
                        <form className='ml-auto mr-2' onSubmit={handleSubmit}>
                            <label className='mr-1'>
                                Log in: </label>
                            <input
                                name='username'
                                label='USERNAME'
                                type='text'
                                className='mr-1'
                                value={state.username}
                                onChange={handleChange}
                                placeholder='Username'
                            />
                            <input
                                name='password'
                                label='PASSWORD'
                                type='password'
                                className='mr-1'
                                value={state.password}
                                onChange={handleChange}
                                placeholder='Password'
                            />
                            <input type='submit' className='top-bar-link' value='Submit' />
                        </form>
                    </Fragment>
                }
            </div>
    )

}


export default UserLogin