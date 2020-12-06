// Export the API and socket URLs. The environment variable NODE_ENV is
// automatically set to 'production', 'test', or 'deployment'. For 'production' 
// the URLs are read from environment variables which are added on heroku. 

export const API_URL = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_API_URL : "http://localhost:8000/v1/"
export const SIO_URL = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_SIO_URL : "http://localhost:8000"