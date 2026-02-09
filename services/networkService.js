const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // (NOTE: this will disable client verification)
    cert: fs.readFileSync("../certificate.crt"),
    key: fs.readFileSync("../priv.key"),
    passphrase: "password"
  })

const networkPost  = async ( data, endpoint) => {
    try {
        const response = await axios.post(endpoint, data, httpsAgent);
        console.log(response);
        return response;
    } catch (error) {
        console.error(error);
        return null
    }
}

const networkGet = async ( endpoint ) => {
    try {
        const response = await axios.get(endpoint, httpsAgent);
        return response;
    } catch (error) {
        console.error(error);
        return null
    }
}

module.exports = {
    networkPost,
    networkGet
}