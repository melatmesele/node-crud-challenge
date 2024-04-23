const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const Joi = require('joi');
const uuid = require('uuid');



app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

let persons = [{
    id: '1',
    name: 'Sam',
    age: '26',
    hobbies: []
}] //This is your in memory database

app.set('db', persons)
//TODO: Implement crud of person

const personSchema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().integer().required(),
    hobbies: Joi.array().items(Joi.string()).required(),
});


// GET API to retrieve all persons 
app.get('/person', (req, res) => {
    return res.status(200).json(persons);

});

// GET API to retrieve  a specific person by ID
app.get('/person/:personId', (req, res) => {
    const { personId } = req.params;

    const person = persons.find(person => person.id === personId);
    if (!person) {
        return res.status(404).json({ message: 'Person not found' });
    }
    return res.status(200).json(person);

});


// POST API to create a new person
app.post('/person', (req, res) => {
    try {
        const { name, age, hobbies } = req.body;
        if (!name || !age || !hobbies) {
            return res.status(400).json({ message: 'Name , Age and Hobbies are required' });
        }
        const { error, value: personData } = personSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const id = uuid.v4();
        const newPerson = { id, ...personData };
        persons.push(newPerson);
        res.status(200).json(newPerson);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

});



// PUT API to update an existing person by ID
app.put('/person/:personId', async (req, res) => {
    try {
        const { personId } = req.params;

        const { error, value: personData } = personSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }


        const personIndex = persons.findIndex(person => person.id === personId);
        if (personIndex === -1) {
            return res.status(404).json({ message: 'Person not found' });
        }

        persons[personIndex] = { ...persons[personIndex], ...personData };

        res.status(200).json(persons[personIndex]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// DELETE API to delete a person by ID
app.delete('/person/:personId', async (req, res) => {
    try {
        const { personId } = req.params;


        const personIndex = persons.findIndex(person => person.id === personId);
        if (personIndex === -1) {
            return res.status(404).json({ message: 'Person not found' });
        }

        persons.splice(personIndex, 1);

        res.status(200).json({ message: 'Person deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Handle requests to non-existing endpoints
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Handle internal server errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

if (require.main === module) {
    app.listen(3000)
}
module.exports = app;