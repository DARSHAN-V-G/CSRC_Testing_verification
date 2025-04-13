import axios from 'axios';

const API = axios.create({
    baseURL:'http://localhost:4000',
    timeout:30000,
})

