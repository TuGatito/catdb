const fs = require('fs');
const path = require('path');

class CatDB {
  // We get the main path for all of our DBS //
  constructor(pathForDbs) {
    this.pathForDbs = pathForDbs;
    // Making the data for out master Db to rule them all //
    this.master = JSON.stringify({
      dbs: [],
      count: 0
    });
    
    // Cheking if the master file exists //
    if (fs.existsSync(path.join(__dirname, `${this.pathForDbs}/Master.json`))) {
      console.log("The master already exists!");
    } else {
      // Finally we create our master file //
      fs.writeFile(path.join(__dirname, `${this.pathForDbs}/Master.json`), this.master, err => {
        if (err) {
          console.error(err);
        } else {
          console.log("CatDB Master Created!");
          console.log("¡Start Creating yours DBs!")
        }
      });
    }
  }

  //// Create new database function ////
  // Needs a name and if you want groups that the Database // 
  // its part of //
  newDB(name, groups = []) {
    // Creating id and data for the new database //
    const id = uuidv4();
    const data = JSON.stringify({
      id: id,
      groups: groups,
      data: []
    });

    // Cheking if the newDb already exists //
    if (fs.existsSync(`${this.pathForDbs}/${name}.json`)) {
      console.log(`${this.name}, already exists!`);
    } else {
      console.log(`Creating ${this.name}...`);
    
      // Creating the file wirh the main path adding the name and data//
      fs.writeFile(`${this.pathForDbs}/${name}.json`, data, err => {
        if (err) {
          throw err;
        } else {
          console.log(`New database created!`);
          console.log(`Name: ${name}, ID: ${id}`);
          console.log(`Adding to master....`);
          // Getting Master db to add your new db to it //
          // First we get the data and modify it //
          fs.readFile(`${this.pathForDbs}/Master.json`, (err, d) => {
            if (err) throw err;
            let master = JSON.parse(d);
            master.count += 1;
            master.dbs.push({id: id, name: name, path: `${this.pathForDbs}/${name}.json`, groups: groups});
            let newData = JSON.stringify(master);
            // Now we rewrite the master file to add the new db to list //
            fs.writeFile(`${this.pathForDbs}/Master.json`, newData, err => {
              if (err) throw err;
              console.log(`Done!`)
              console.log(`Added to master!`);
            })
          }); 
        }
      });
      
    }
    
  }
  
  ////////////////////////////
  //// ADD Data Functions //// 
  ////////////////////////////
  // Function to add data to selected db //
  // We need just the name and the data //
  addData(name, data) {
    // We simply use the filePath variable //
    // To get the file first and edit its data //
    console.log("Getting the DB...");
    fs.readFile(`${this.pathForDbs}/${name}.json`, (err, d) => {
      if (err) {
        throw err;
      } else {
        console.log("Got it!")
        let originalData = JSON.parse(d);
        originalData.data.push({id: uuidv4(), data});
        const newData = JSON.stringify(originalData);
        console.log("Trying to add the new Data");
        // Now rewrite the db adding the new data //
        fs.writeFile(`${this.pathForDbs}/${name}.json`, newData, err => {
          if (err) {
            throw err;
          } else {
            console.log("Done!");
          }
        });
      }
    });
  }
  
  // We need just the name of the group and data //
  // Here we use the Master db to do this //
  addDataToGroup(group, data) {
    // Creating the model of the new data //
    const newData = {
      id: uuidv4(),
      data
    };
    console.log("Trying to get the group...");
    fs.readFile(`${this.pathForDbs}/Master.json`, (err, d) => {
      if (err) {
        throw err;
      } else {
        let master = JSON.parse(d);
        console.log("Got it!");
        console.log(master.dbs)
        master.dbs.forEach(db => {
          db.groups.forEach(g => {
            if (g === group) {
              console.log("Got One!");
              console.log("Adding...");
              // we read the file firts to add the data //
              // and not erase the previous data //
              fs.readFile(db.path, (err, d2) => {
                if (err) {
                  throw err;
                } else {
                  let previous = JSON.parse(d2);
                  previous.data.push(newData);
                  const newest = JSON.stringify(previous);
                  // now rewrite the file with the old and new data //
                  fs.writeFile(db.path, newest, err => {
                    if (err) throw err;
                    console.log(`New data added to ${db.name}`);
                  });
                }
              });
            }
          }) 
        });
      }
    });
    console.log("Done!");
  }
  
  // We just need a array of the groups and the data //
  addDataToMultipleGroups(groups, data) {
    // Creating the model for the new data //
    const newData = {
      id: uuidv4(),
      data
    };
    
    // Searching multiple groups //
    groups.forEach(actualGroup => {
      fs.readFile(`${this.pathForDbs}/Master.json`, (err, d) => {
        const master = JSON.parse(d);
        master.dbs.forEach(db => {
          db.groups.forEach(group => {
            if (group === actualGroup) {
              fs.readFile(db.path, (err, d2) => {
                if (err) {
                  throw err;
                } else {
                  let previous = JSON.parse(d2);
                  previous.data.push(newData);
                  const newest = JSON.stringify(previous);
                  fs.writeFile(db.path, newest, err => {
                    if (err) throw err;
                    console.log("New data added..");
                  });
                }
              });
            }
          });
        });
      });
    });
  }
  ////////////////////////////
  ////////////////////////////
  

}

//////////////////////////
//// Helper Functions ////
//////////////////////////
// Uuidv4 maker //
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
//////////////////////////
