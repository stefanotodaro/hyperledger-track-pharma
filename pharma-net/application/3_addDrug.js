'use strict';

/**
 * This is a Node.JS application to add new drug on the Network
 */

const helper = require('./contractHelper');

/**
 * @description Module to add new drug on the network as requested by manufacturer. 
 * @param {*} drugName Name of the drug
 * @param {*} uniqueCode identifier code of the drug
 * @param {*} serialNo Unique serial of the drug
 * @param {*} lotNumber lot number of the drug
 * @param {*} mfgDate  Manufactured date
 * @param {*} expDate expire date
 * @param {*} companyCRN Manufacturer company registration number who manufactures and add it in the network for selling
 * @param {*} organisationRole Organisation role received from client app. If any other organisation other than manufacturer is sent, error will be thrown. 
 */
async function main(drugName, uniqueCode, serialNo, lotNumber, mfgDate, expDate, companyCRN,organisationRole) {

	try {
		const pharmanetContract = await helper.getContractInstance(organisationRole);

		console.log('.....Requesting to create a New drug on the Network');
		const newDrugBuffer = await pharmanetContract.submitTransaction('addDrug', drugName, uniqueCode, serialNo, lotNumber, mfgDate, expDate, companyCRN,organisationRole);

		// process response
		console.log('.....Processing Approve New Drug Transaction Response \n\n');
		let newUser = JSON.parse(newDrugBuffer.toString());
		console.log(newDrugBuffer.toString());
		return newUser;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		helper.disconnect();

	}
}

module.exports.execute = main;
