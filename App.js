const express = require('express');
const app = express();
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'test',
    database: 'alfa-laval'
  }
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());


// ////kontroll vid start ////////////
app.get('/', (req, res) => {
  res.send('ok');
})


/////////LOGGA IN /////////////////
app.post('/signin', (req, res) => {
  db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', req.body.email)
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json('unable to get user'))
      } else {
        res.status(400).json('wrong credentials')
      }
    })
    .catch(err => res.status(400).json('wrong credentials'))
})

///////////REGISTISTRERA NY ANVÄNDARE //////////
app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email,
    })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0].email,
            name: name,
          })
          .then(user => {
            res.json(user[0]);
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
  })
    .catch(err => res.status(400).json("already registred"))
})


/////////INFOBOARD SMALL MEDIUM///////////

app.post('/infoboardsmallmedium', (req, res) => {
  db('infoboardsmallmedium').insert({
    name: req.body.name,
    message: req.body.message,
    joined: new Date()
  })
    .then(function () {
      db.select().from('infoboardsmallmedium')
        .then(allMessage => {
          res.json(allMessage)
        })
    })
})


app.get('/infoboardsmallmedium', (req, res) => {
  db.raw('select * from infoboardsmallmedium')
    .then(allInfo => {
      res.send(allInfo.rows)
    })
})

app.delete('/infoboardsmallmedium/:id', (req, res) => {
  db('infoboardsmallmedium')
    .where('id', req.params.id)
    .del()
    .then(x => {
      res.json({ succsess: true })
    })
})





/////////INFOBOARD ALFA NOVA///////////

app.post('/infoboardalfanova', (req, res) => {
  db('infoboardalfanova').insert({
    name: req.body.name,
    message: req.body.message,
    joined: new Date()
  })
    .then(function () {
      db.select().from('infoboardalfanova')
        .then(allMessage => {
          res.json(allMessage)
        })
    })
})


app.get('/infoboardalfanova', (req, res) => {
  db.raw('select * from infoboardalfanova')
    .then(allInfo => {
      res.send(allInfo.rows)
    })
})

app.delete('/infoboardalfanova/:id', (req, res) => {
  db('infoboardalfanova')
    .where('id', req.params.id)
    .del()
    .then(x => {
      res.json({ succsess: true })
    })
})




/////////PLANERING JAKOB GÖRANSSON///////////

app.get('/planeringjakobgoransson/:id', (req, res) => {
  db.raw('select * from planeringjakobgoransson')
    .then(allInfo => {
      res.send(allInfo.rows)
    })
})


app.post('/planeringjakobgoransson', (req, res) => {
  db('planeringjakobgoransson').insert({
    maskin: req.body.maskin,
    beskrivning: req.body.beskrivning,
    prio: req.body.prio,
    när: req.body.när,
    email: req.body.email
  })
    .then(function () {
      db.select().from('planeringjakobgoransson')
        .then(allMessage => {
          res.json(allMessage)
        })
    })
})

////HÄMTA DEN PERSONEN SOM ÄR INLOGGADS PLANERING///////
app.put('/planeringjakobgoransson', (req, res) => {
  const email = req.params
  db.select('*').from('planeringjakobgoransson').orderBy('prio')
    .where('email', req.body.email)
    .then(allInfo => {
      res.json(allInfo)
    })
})


app.delete('/planeringjakobgoransson/:id', (req, res) => {
  db('planeringjakobgoransson')
    .where('id', req.params.id)
    .del()
    .then(x => {
      res.json({ succsess: true })
    })
})

app.put('/planeringjakobgoransson/:id', (req, res) => {
  db('planeringjakobgoransson')
    .where('id', req.params.id)
    .update({
      beskrivning: req.body.beskrivning,
      maskin: req.body.maskin,
      prio: req.body.prio,
      när: req.body.när,
      klart: req.body.klart,
      extraInfoText: req.body.extraInfoText
    })
    .then(x => {
      res.json({ succsess: true })
    })
})



// app.listen(4000, () => {
//   console.log('working');
// })

// Establishing the port
const PORT = process.env.PORT || 4000;

// Executing the server on given port number
app.listen(PORT, console.log(
  `Server started on port ${PORT}`));

