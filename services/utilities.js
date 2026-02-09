const moment = require('moment');
const axios = require('axios');

const response= (res, data, status) =>{
    res.json({
        status,
        data
    })
}

const dd = () => moment().format('DD/MM/YYYY-HH:mm:ss');

const nearestParkade = async ( currentLat, currentlong )=> {
    const parkades = [
        { name:'Julius Nyerere Parkade', lat:-17.829891182885483, long:31.04650997538374, site:'https://www.google.com/maps/place/Rezende+Parkade/@-17.8301893,31.0421202,17z/data=!4m9!1m2!2m1!1sparkade!3m5!1s0x1931a4e4ec72c005:0x61597c87188f4b4f!8m2!3d-17.8301896!4d31.0464976!15sCgdwYXJrYWRlWgkiB3BhcmthZGWSARRwdWJsaWNfcGFya2luZ19zcGFjZZoBJENoZERTVWhOTUc5blMwVkpRMEZuU1VOdkxVdHFXSHAzUlJBQuABAA?hl=en' },
        { name:'Samora Machel Parkade', lat:-17.826234702506763, long:31.049857372047295, site:'https://www.google.com/maps/place/Samora+Machel+Packade/@-17.8301893,31.0421202,17z/data=!4m9!1m2!2m1!1sparkade!3m5!1s0x1931a5ee1a894d09:0xc18075493c425ac0!8m2!3d-17.8275738!4d31.050411!15sCgdwYXJrYWRlkgELcGFya2luZ19sb3TgAQA?hl=en' },
        { name:'Fourth Street Parking', lat:-17.830536924942926, long:31.053190775409362, site:'https://www.google.com/maps/place/Car+Park/@-17.826819,31.0520268,16.61z/data=!4m9!1m2!2m1!1sharare+parking!3m5!1s0x1931a4e6496e01ab:0x15de7fd0518a9ae2!8m2!3d-17.8307517!4d31.0531515!15sCg5oYXJhcmUgcGFya2luZ5IBC3BhcmtpbmdfbG904AEA?hl=en' }
    ]
    
    const locations = [];
    
    await parkades.forEach(loc => {
        const {lat,long} = loc;
        const d = distance(currentLat,currentlong, lat,long);
    
        loc.distance = d;
        locations.push(loc);
    
    });
    
    const closest = await getSmallest(locations)
    
    return closest;
    
}
    
const getSmallest = async(locations) => {
    let smallest = { name:'error', lat:0, long:0, site:'',distance:10000000000000000000 };

    for (const loc of locations) {
        const {distance} = loc;
        
        if(distance < smallest.distance){
        smallest = loc;
        }
    }

    return smallest;
}
    
function distance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}
    
function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

async function sendText(phoneNumber, Message){
    let newPhoneNumber =  phoneNumber.slice(-9);
    newPhoneNumber = `${0}${newPhoneNumber}`;
    const response = await axios.post(`https://www.txt.co.zw/Remote/Sendmessage?username=cityparking_remote&recipients=${newPhoneNumber}&body=${Message}`).catch((ex)=>{
        return false;
    });
        
    if(response.status !== 200){
     return true;
    }      
}

module.exports = {
    sendText,
    response,
    dd
}