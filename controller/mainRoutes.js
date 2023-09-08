import express from 'express'
import axios from "axios"
import NodeCache from "node-cache";
import user from '../model/user.js';
const app = express();

app.get('/user_weather', async (req, res) => {
    try {
        console.log(req.query)
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${req.query.lat}&lon=${req.query.lon}&units=metric&appid=${process.env.APPID}`);
        res.send(response.data);
    } catch (error) {
        console.log(error)
        throw new Error('Failed to fetch weather data');
    }
})

app.get('/weather', checkCache, async (req, res) => {
    const { city } = req.query;
    try {
        const weatherData = await fetchWeatherData(city);
        cache.set(city, weatherData);
        res.json(weatherData);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
})

app.get('/userStatus', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.send({ success: true, isAuthenticated: false });
    }
    else {
        console.log(req.user)
        res.send({ success: true, isAuthenticated: true, ...req.user });
    }
})

app.get('/update', async (req, res) => {
    if (req.isAuthenticated()) {
        let data = await user.findByIdAndUpdate(req.user._id, { city: req.query.city }, { $new: true });
        res.send({ success: true, isAuthenticated: true, ...data._doc });
    }
    else res.send({ success: true, isAuthenticated: false, })
})


const cache = new NodeCache({ stdTTL: 600 });
async function fetchWeatherData(city) {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&APPID=${process.env.APPID}`);
        return response.data;
    } catch (error) {
        console.log(error)
        throw new Error('Failed to fetch weather data');
    }
}

function checkCache(req, res, next) {
    const { city } = req.query;
    const cachedData = cache.get(city);
    if (cachedData) {
        res.json(cachedData);
    } else {
        next();
    }
}

export default app;