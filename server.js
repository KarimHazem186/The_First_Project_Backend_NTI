// console.log('Backend app');
const app = require('./app')
const connectDB = require('./config/connection/db')

const PORT = process.env.PORT


connectDB()

app.listen(PORT,()=>console.log(`Server running on port ${PORT}`))