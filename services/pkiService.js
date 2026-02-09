const forge = require('node-forge');

const pki = forge.pki;
const rsa = forge.pki.rsa;

const generateKeyPair = () => {

    const keypair = rsa.generateKeyPair({bits: 2048, e: 0x10001});
    const pubKeyPEM = pki.publicKeyToPem(keypair.publicKey);
    const privKeyPEM = pki.privateKeyToPem(keypair.privateKey);

    return { pubKeyPEM, privKeyPEM }
}

module.exports = { generateKeyPair }