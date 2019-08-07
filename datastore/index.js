const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

Promise.promisifyAll(fs);

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    items[id] = text;
    fs.writeFile(`${exports.dataDir}/${id}.txt`, `${text}`, (err) => {
      callback(err, {id, text});
    });
  });
};

exports.readAll = (callback) => {
  return fs.readdirAsync(exports.dataDir)
    .then((array) => {
      let files = [];
      for (let i = 0; i < array.length; i++) {
        files.push((fs.readFileAsync(`${exports.dataDir}/${array[i]}`, 'utf8')
          .then((text) => { return text; })));
      }
      return Promise.all(files)
        .then((arrays) => {
          return (_.map(arrays, (file, index) => {
            return { id: array[index].split('.')[0], text: file };
          }));
        })
        .then((array) => {
          callback(null, array);
        })
        .catch((err) => {
          callback(err);
        });
    });
};

exports.readOne = (id, callback) => {
  fs.readFile(`${exports.dataDir}/${id}.txt`, (err, todo) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fileData = todo.toString();
      callback(err, {id, text: (todo.toString())});
    }
  });

};

exports.update = (id, text, callback) => {
  fs.readFile(`${exports.dataDir}/${id}.txt`, (err, todo) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(`${exports.dataDir}/${id}.txt`, text, (err, todo) => {
        if (err) {
          throw err;
        } else {
          callback(null, {id, text});
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  fs.readFile(`${exports.dataDir}/${id}.txt`, (err, todo) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.unlink(`${exports.dataDir}/${id}.txt`, (err) => {
        if (err) {
          throw err;
        } else {
          callback();
        }
      });
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
