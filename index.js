require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')
const morgan = require('morgan')

const Person = require('./models/person')
const app = express()

// --- Middleware ---
app.use(express.json())

if (process.env.NODE_ENV !== 'production') {
  app.use(cors())
  console.log('CORS habilitado (modo desarrollo)')
}

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

// --- Rutas ---
// GET all
app.get(['/api/persons', '/persons'], (req, res, next) => {
  Person.find({})
    .then(result => res.json(result))
    .catch(next)
})

// Info
app.get('/info', async (req, res, next) => {
  try {
    const total = await Person.countDocuments({})
    res.send(`
      <p>Phonebook has info for ${total} people</p>
      <p>${new Date()}</p>
    `)
  } catch (err) {
    next(err)
  }
})

// GET by ID
app.get(['/api/persons/:id', '/persons/:id'], (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).json({ error: 'Person not found' })
      }
    })
    .catch(next)
})

// DELETE
app.delete(['/api/persons/:id', '/persons/:id'], (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch(next)
})

// POST
app.post(['/api/persons', '/persons'], (req, res, next) => {
  const { name, number } = req.body

  const person = new Person({ name, number })

  person.save()
    .then(saved => res.json(saved))
    .catch(next)
})

// PUT (update)
app.put(['/api/persons/:id', '/persons/:id'], (req, res, next) => {
  const { name, number } = req.body

  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true }
  )
    .then(updated => res.json(updated))
    .catch(next)
})

// --- Middleware 404 ---
app.use((req, res) => {
  res.status(404).json({ error: 'Unknown endpoint' })
})

// --- Manejo de errores ---
app.use((error, req, res, next) => {
  console.error('ERROR:', error.message)

  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' })
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
})

// --- Servir frontend ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  })
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})
