const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan'); // 👈 Middleware para registrar peticiones
const app = express();

// --- Middleware ---
app.use(express.json());

// CORS solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use(cors());
  console.log('✅ CORS habilitado (modo desarrollo)');
}

// Morgan muestra en consola cada petición HTTP
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// --- Datos iniciales ---
let persons = [
  { id: 1, name: 'Arto Hellas', number: '040-123456' },
  { id: 2, name: 'Ada Lovelace', number: '39-44-5323523' },
  { id: 3, name: 'Dan Abramov', number: '12-43-234345' },
  { id: 4, name: 'Mary Poppendieck', number: '39-23-6423122' }
];

// --- Rutas de la API ---
app.get(['/api/persons', '/persons'], (req, res) => {
  res.json(persons);
});

app.get('/info', (req, res) => {
  const totalPersons = persons.length;
  const date = new Date();
  res.send(`
    <p>Phonebook has info for ${totalPersons} people</p>
    <p>${date}</p>
  `);
});

app.get(['/api/persons/:id', '/persons/:id'], (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(p => p.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).json({ error: 'Person not found' });
  }
});

app.delete(['/api/persons/:id', '/persons/:id'], (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(p => p.id !== id);
  res.status(204).end();
});

app.post(['/api/persons', '/persons'], (req, res) => {
  const body = req.body;

  if (!body.name) return res.status(400).json({ error: 'Name is missing' });
  if (!body.number) return res.status(400).json({ error: 'Number is missing' });

  const nameExists = persons.find(p => p.name.toLowerCase() === body.name.toLowerCase());
  if (nameExists) {
    return res.status(400).json({ error: 'Name must be unique' });
  }

  const newPerson = {
    id: Math.floor(Math.random() * 1000000),
    name: body.name,
    number: body.number
  };

  persons = persons.concat(newPerson);
  res.json(newPerson);
});

// --- Servir frontend en producción ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// --- Servidor ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
