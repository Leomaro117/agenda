require('dotenv').config()
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
console.log('Connecting to', url)

mongoose.connect(url)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting:', err.message))

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name required'],
    minlength: [3, 'Name must be at least 3 characters']
  },
  number: {
    type: String,
    required: [true, 'Number required'],
    minlength: [5, 'Number must be at least 5 characters']
  }
})

personSchema.set('toJSON', {
  transform: (doc, obj) => {
    obj.id = obj._id.toString()
    delete obj._id
    delete obj.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
