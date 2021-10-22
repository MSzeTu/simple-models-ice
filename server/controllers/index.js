// pull in our models. This will automatically load the index.js from that folder
const models = require('../models');

const Cat = models.Cat.CatModel;
const Dog = models.Dog.DogModel;
// default fake data so that we have something to work with until we make a real Cat
const defaultData = {
  name: 'unknown',
  bedsOwned: 0,
};

// Default fake dog so we can work with it
const defaultDog = {
  name: 'unknown',
  breed: 'unknown',
  age: 0,
};

let lastAdded = new Cat(defaultData);
let lastAddedDog = new Dog(defaultDog);

const hostIndex = (req, res) => {
  res.render('index', {
    currentName: lastAdded.name,
    title: 'Home',
    pageName: 'Home Page',
  });
};

const readAllCats = (req, res, callback) => { // Find all cats
  Cat.find(callback).lean();
};

const readAllDogs = (req, res, callback) => { // Find all dogs
  Dog.find(callback).lean();
};

const readCat = (req, res) => {
  const { name } = req.query;

  const callback = (err, doc) => {
    if (err) {
      return res.status(500).json({ err });
    }
    return res.json(doc);
  };

  Cat.findByName(name, callback);
};

const readDog = (req, res) => { // Find a specific dog
  const { name } = req.query;

  const callback = (err, doc) => {
    if (err) {
      return res.status(500).json({ err });
    }
    return res.json(doc);
  };
  Dog.findByName(name, callback);
};

const hostPage1 = (req, res) => {
  const callback = (err, doc) => {
    if (err) {
      return res.status(500).json({ err });
    }

    return res.render('page1', { cats: doc });
  };
  readAllCats(req, res, callback);
};

const hostPage2 = (req, res) => {
  res.render('page2');
};

const hostPage3 = (req, res) => {
  res.render('page3');
};

const hostPage4 = (req, res) => { //Hosts the Dog List
  const callback = (err, doc) => {
    if (err) {
      return res.status(500).json({ err });
    }

    return res.render('page4', { dogs: doc });
  };
  readAllDogs(req, res, callback);
};

const getName = (req, res) => {
  res.json({ name: lastAdded.name });
};

const getNameDog = (req, res) => { // get request for Dog Name
  res.json({ name: lastAddedDog.name });
};

const setName = (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
    return res.status(400).json({ error: 'firstname,lastname and beds are all required' });
  }

  const name = `${req.body.firstname} ${req.body.lastname}`;

  const catData = {
    name,
    bedsOwned: req.body.beds,
  };

  const newCat = new Cat(catData);
  const savePromise = newCat.save();

  savePromise.then(() => {
    lastAdded = newCat;
    res.json({
      name: lastAdded.name,
      beds: lastAdded.beds,
    });
  });

  savePromise.catch((err) => res.status(500).json({ err }));

  return res;
};

const setNameDog = (req, res) => { // Sets name of dog
  if (!req.body.name || !req.body.breed || !req.body.age) {
    return res.status(400).json({ error: 'name, breed, and age all required' });
  }

  const name = `${req.body.name}`;
  Dog.findByName(req.body.name, (err, doc) => {
    if (err) {
      return res.status(500).json({ err });
    }
    if (doc) { //only checks for existing if there is actually something to check
      if (doc.name === name) {
        return res.status(400).json({ error: 'Dog already exists' }); //aborts if it exists
      }
    }
    return res;
  });
  const dogData = {
    name,
    age: req.body.age,
    breed: req.body.breed,
  };

  const newDog = new Dog(dogData);
  const savePromise = newDog.save();

  savePromise.then(() => { //save the new dog
    lastAddedDog = newDog;
    res.json({
      name: lastAddedDog.name,
      age: lastAddedDog.age,
      breed: lastAddedDog.breed,
    });
  });

  savePromise.catch((err) => res.status(500).json({ err }));
  return res;
};

const searchName = (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  return Cat.findByName(req.query.name, (err, doc) => {
    if (err) {
      return res.status(500).json({ err });
    }
    if (!doc) {
      return res.status(404).json({ error: 'No cats found' });
    }

    return res.json({
      name: doc.name,
      beds: doc.bedsOwned,
    });
  });
};

const searchNameDog = (req, res) => { //Searchs for a Dog by name
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  return Dog.findByName(req.query.name, (err, doc) => {
    if (err) {
      return res.status(500).json({ err });
    }
    if (!doc) {
      return res.status(404).json({ error: 'No dog found' });
    }
    const newDog = doc; //Make new object so we can increment name
    newDog.age++;
    const savePromise = newDog.save();
    savePromise.then(() => res.json({
      name: newDog.name,
      age: newDog.age,
      breed: newDog.breed,
    }));

    savePromise.catch(() => {
      res.status(500).json({ err });
    });

    return res;
  });
};

const updateLast = (req, res) => {
  lastAdded.bedsOwned++;

  const savePromise = lastAdded.save();
  savePromise.then(() => res.json({
    name: lastAdded.name,
    beds: lastAdded.bedsOwned,
  }));
  savePromise.catch((err) => {
    res.status(500).json({ err });
  });
};

const notFound = (req, res) => { //Not found
  res.status(404).render('notFound', {
    page: req.url,
  });
};

module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  page4: hostPage4,
  readCat,
  readDog,
  getName,
  getNameDog,
  setName,
  setNameDog,
  updateLast,
  searchName,
  searchNameDog,
  notFound,
};
