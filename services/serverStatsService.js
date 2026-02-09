const sss = require('simple-stats-server');

const getServerStats = () => {
    return sss();
} 

module.exports = {
    getServerStats
}