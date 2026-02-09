//zimra service endpoints
//Each request must contain these HTTP headers:
//DeviceModelName Yes Device model name as registered in ZIMRA
//DeviceModelVersionNo Yes Device model version number as registered in ZIMR
const { networkPost, networkGet } = require("./networkService")

/*zmirasettings
  operationID
  fiscalDayNumber
  configdata
  lasttransaction
  receiptcounterday
  receiptGlobalNo

*/


const baseUrl = `https://zimra-device-api-qa.etronika.net/Public/v1/126/RegisterDevice`;

const registerDevice = async (deviceID, activationKey, certificateRequest ) => {
    //returns operationID and certificate
    const result = await networkPost({deviceID, activationKey,certificateRequest}, './');
    return result
}

const  issueCertificate = (deviceID, certificateRequest ) => {
    //returns operationID and certificate
    return null
}

const getConfig = (deviceID) => {
    //returns config data
    return null
}

const getStatus = (deviceID) => {
    //returns operationID and certificate
    return null
}

const openDay = (deviceID, fiscalDayOpened, fiscalNo) => {
    //returns opertionID and fiscalDayNumber
    return null
}

const submitReceipt = (deviceID, receipt) => {
  return null
}

const closeDay = ()=> {
    return null
}

const getServerCertificate = (thumbprint) => {

}

module.exports = {
    registerDevice,
    issueCertificate,
    getConfig,
    getStatus,
    openDay,
    submitReceipt,
    closeDay,
    getServerCertificate
}