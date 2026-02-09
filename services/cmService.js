const axios = require('axios');

const sendpayment = async ( Cellphone,Duration, Amount, VehicleReg, TransactionId, isArrear ) => {
    try{
        VehicleReg = await VehicleReg.toString().toUpperCase();

        const data = {VehicleReg, Cellphone, Duration, Amount, TransactionId};

        if(isArrear){
            data.ArrearPayment = true
        }

        const response = await axios.post(`http://192.168.1.12:8083/api/mobile/sendpayment`,data).catch((ex)=>{
        console.log(ex);
        });

        if(!response || !response.data){
        return null;
        }

        return response.data;
    }catch(ex){
        return null
    }
}

module.exports = {
    sendpayment
}