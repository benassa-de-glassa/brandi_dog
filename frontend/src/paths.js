// to run it from local API


// export var postData = async function(relURL = '', data = {}) {
//     let url = new URL(relURL, API_URL)
//     const response = await fetch(url, {
//         method: 'POST',
//         mode: 'cors',
//         headers: { 'Content-Type': 'application/json'},
//         credentials: 'include',
//         body: JSON.stringify(data)
//     })
//     if (response.status !== 200) {
//         console.warn(response.status, ' for POST ', relURL)
//     }
//     return response
// }

// export var get = async function(relURL = '') {
//     let url = new URL(relURL, API_URL)
//     const response = await fetch(url)
//     if (response.status !== 200) {
//         console.warn(response.status, ' for GET ', relURL)
//     }
//     return response
// }


