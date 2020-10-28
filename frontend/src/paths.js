// to run it from local API
export const API_URL = "http://localhost:8000/v1/"

// export const API_URL_WITHOUT_V1 = "http://localtest.me:8000/"
export const API_URL_WITHOUT_V1 = 'http://localhost:8000'
export const SIO_URL = "http://localhost:8000"

// export const WS_URL = "ws://localhost:8000/"

export var postData = async function(relURL = '', data = {}) {
    let url = new URL(relURL, API_URL)
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify(data)
    })
    if (response.status !== 200) {
        console.warn(response.status, ' for POST ', relURL)
    }
    return response
}

export var get = async function(relURL = '') {
    let url = new URL(relURL, API_URL)
    const response = await fetch(url)
    if (response.status !== 200) {
        console.warn(response.status, ' for GET ', relURL)
    }
    return response
}

// function for debug purposes

export var postDataWithoutV1 = async function(relURL = '', data = {}) {
    let url = new URL(relURL, API_URL_WITHOUT_V1)
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: JSON.stringify(data)
    })
    if (response.status !== 200) {
        console.warn(response.status, ' for POST ', relURL)
    }
    return response
}

