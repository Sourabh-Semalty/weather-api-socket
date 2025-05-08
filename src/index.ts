import express from 'express';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { Server } from 'socket.io';
import { errorHandler } from './middlewares/errorMiddleware';
import { fetchWeather } from './modules/weatherApi';

// Get __dirname equivalent in ESM

const app = express();
app.use(express.json())
app.use(errorHandler)
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

const UPDATE_INTERVAL = 10000; // 10 seconds
const connectedUsers = new Map();

// Function to emit weather updates to all connected clients
async function emitWeatherUpdate(city: string) {
  try {
    const weatherData = await fetchWeather(city);
    if (weatherData) {
      io.emit('weatherUpdate', {
        city: weatherData.name,
        temperature: weatherData.main.temp,
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        icon: weatherData.weather[0].icon,
        timestamp: new Date().toISOString()
      });
      console.log(`Weather update sent for ${city}`);
    }
  } catch (error) {
    console.error('Failed to emit weather update:', error);
  }
}

io.on('connection', async (socket) => {
  console.log('Client connected:', socket.id);
  connectedUsers.set(socket.id, { 
    connectedAt: new Date().toISOString(),
    city: 'London' // default city
  });
  
  // Send initial weather update for default city
  const userInfo = connectedUsers.get(socket.id);
  await emitWeatherUpdate(userInfo.city);
  
  // Set up interval for this specific client
  let updateInterval = setInterval(() => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo) {
      emitWeatherUpdate(userInfo.city);
    }
  }, UPDATE_INTERVAL);

  socket.on('setCity', async (newCity) => {
    if (!newCity) return;
    
    // Update user's city preference
    connectedUsers.set(socket.id, { 
      ...connectedUsers.get(socket.id),
      city: newCity
    });
    
    // Send immediate update for the new city
    await emitWeatherUpdate(newCity);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(updateInterval);
    connectedUsers.delete(socket.id);
  });
});

server.listen(4000, () => {
  console.log('server running at http://localhost:4000');
});