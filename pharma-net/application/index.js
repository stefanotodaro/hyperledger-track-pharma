const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');


const dotenv = require('dotenv');

// get config vars
dotenv.config();

const port = process.env.port;

// Import all function modules

const addToWallet = require('./1_addToWallet');
const registerCompany = require('./2_registerCompany');
const addDrug = require('./3_addDrug');
const createPO = require('./4_createPO');
const createShipment = require('./5_createShipment');
const updateShipment = require('./6_updateShipment');
const retailDrugDecommissioning = require('./7_retailDrugDecommissioning');
const viewHistory = require('./8_viewHistory');
const viewDrugCurrentState = require('./9_viewDrugCurrentState');
const UserClass = require('./User');
const JWTClass = require('./jwt');

const User = (new UserClass());
const JWT = (new JWTClass());

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'App');

app.get('/', (req, res) => res.send('Service UP'));

// Route to register a new user
app.post('/auth/register', async (req, res) => {
    try {
      // Check if the email already exists, use db for production
      const existingUser = await User.exist(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
  
      // Create a new user
      const newUser = new User.register(
        req.body.username,
        hashedPassword
      );

      if(newUser)
        res.status(201).json({ message: 'User registered successfully' });
      else
        res.status(500).json({ error: 'Internal server error' });

    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Route to authenticate and log in a user
app.post('/auth/login', async (req, res) => {
    try {
      // Check if exists
      const existingUser = await User.login(req.body.username,req.body.password);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      const token = JWT.generateAccessToken(req.body.username);
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.post('/addToWallet',JWT.authenticateToken, (req, res) => {
    addToWallet.execute(req.body.certificatePath, req.body.privateKeyPath,req.body.orgRole).then (() => {
        console.log('Organisation added to wallet successfully');
        const result = {
            status: 'success',
            message: 'Organisation added to wallet successfully'
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed to organisation into wallet',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/registerCompany',JWT.authenticateToken, (req, res) => {
    console.log("Register company start");
    registerCompany.execute(req.body.companyCRN, req.body.companyName, req.body.location, req.body.orgRole).then ((company) => {
        console.log('Company Registered successfully');
        const result = {
            status: 'success',
            message: 'Company registered successfully',
            company: company
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed to register company',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/addDrug',JWT.authenticateToken, (req, res) => {
    console.log("Drug Addition start");
    addDrug.execute(req.body.drugName, 
                    req.body.uniqueCode, 
                    req.body.serialNo, 
                    req.body.lotNumber, 
                    req.body.mfgDate, 
                    req.body.expDate, 
                    req.body.companyCRN,
                    req.body.orgRole).then ((drug) => {
        console.log('Drug Added successfully');
        const result = {
            status: 'success',
            message: 'Drug added successfully',
            drug: drug
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed to add drug',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/createPO',JWT.authenticateToken, (req, res) => {
    console.log("Create Purchase Order start");
    createPO.execute(req.body.buyerCRN, req.body.sellerCRN, req.body.drugName, req.body.quantity, req.body.orgRole).then ((PO) => {
        console.log('PO Added successfully');
        const result = {
            status: 'success',
            message: 'Purchase Order added successfully',
            PO: PO
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed to add purchase order',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/createShipment',JWT.authenticateToken, (req, res) => {
    console.log("Create Shipment for PO - Start");
    createShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.listOfAssets,req.body.transporterCRN, req.body.orgRole).then ((shipment) => {
        console.log('Shipment Added successfully');
        const result = {
            status: 'success',
            message: 'Shipment added successfully',
            shipment: shipment
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed to add shipment',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/updateShipment',JWT.authenticateToken, (req, res) => {
    console.log("Update Shipment for PO - Start");
    updateShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.transporterCRN, req.body.orgRole).then ((drugStatus) => {
        console.log('Drug updated successfully'+drugStatus.toString() );
        const result = {
            status: 'success',
            message: 'Drug updated successfully',
            drugStatus: drugStatus
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed to update shipment status of drug',
            error: e
        };
        res.status(500).send(result);
    });
});


app.post('/retailDrugDecommissioning',JWT.authenticateToken, (req, res) => {
    console.log("Update Shipment for PO - Start");
    retailDrugDecommissioning.execute(req.body.drugName, req.body.serialNo,req.body.retailerCRN, req.body.customerAadhar, req.body.orgRole).then ((drugStatus) => {
        console.log('Drug Sold successfully');
        const result = {
            status: 'success',
            message: 'Drug sold  successfully',
            drugStatus: drugStatus
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed to sell drug',
            error: e
        };
        res.status(500).send(result);
    });
});
 


app.post('/viewHistory',JWT.authenticateToken, (req, res) => {
    console.log("Update Shipment for PO - Start");
    viewHistory.execute(req.body.drugName, req.body.serialNo,req.body.orgRole).then ((drugHistory) => {
        console.log('Drug History');
        const result = {
            status: 'success',
            message: 'Drug history successfully',
            drugHistory: drugHistory
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed to sell drug',
            error: e
        };
        res.status(500).send(result);
    });
});


app.post('/viewDrugCurrentState',JWT.authenticateToken, (req, res) => {
    console.log("View current state of drug");
    viewDrugCurrentState.execute(req.body.drugName, req.body.serialNo,req.body.orgRole).then ((drugStatus) => {
        console.log('Drug Current Status');
        const result = {
            status: 'success',
            message: 'Drug Status fetched successfully',
            drugStatus: drugStatus
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed to retrieve  drug status',
            error: e
        };
        res.status(500).send(result);
    });
});



app.listen(port, () => console.log(`Distributed Pharma App listening on port ${port}!`));
