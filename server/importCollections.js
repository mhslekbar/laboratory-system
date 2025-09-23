const mongoose = require('mongoose');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dbName = "lab_system"

// MongoDB connection string
const mongoURI = `mongodb://127.0.0.1/${dbName}`;
// const mongoURI = `mongodb+srv://sniper:1212@cluster0.p4xc21i.mongodb.net/${dbName}?retryWrites=true&w=majority`;

// Input directory for import files
const importDir = `C:/Users/INFOTELEC/Desktop/mongodb_backup/${dbName}`; // Adjust the directory accordingly

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Wait for the Mongoose connection to be established
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');

  // Get all JSON files in the import directory
  function getAllJSONFiles() {
    return fs.readdirSync(importDir).filter(file => file.endsWith('.json'));
  }

  // Import all collections
  function importCollections() {
    const jsonFiles = getAllJSONFiles();

    for (const jsonFile of jsonFiles) {
      const collectionName = path.basename(jsonFile, '.json');
      const filePath = path.join(importDir, jsonFile);
      const command = `mongoimport --uri="${mongoURI}" --db=${mongoose.connection.name} --collection=${collectionName} --file=${filePath} --jsonArray`;

      try {
        execSync(command, { stdio: 'inherit' });
        console.log(`Imported ${collectionName} successfully`);
      } catch (error) {
        console.error(`Error importing ${collectionName}: ${error.message}`);
      }
    }

    console.log('All collections imported successfully.');
  }

  // Run the importCollections function
  importCollections();
});

mongoose.connection.on('error', (err) => {
  console.error('Error connecting to MongoDB:', err.message);
});
