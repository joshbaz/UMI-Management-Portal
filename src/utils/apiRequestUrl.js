import {queryClient} from './tanstack'
import axios from 'axios'
export const BASE_API_URL = 'http://localhost:5000/api/v1';

export const socketUrl = "localhost:5000"

const apiRequest = axios.create({
    baseURL: BASE_API_URL,
    withCredentials: true,
})

apiRequest.interceptors.request.use((config) => {
    const token = localStorage.getItem('umi_auth_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    config.headers["Content-Type"] = "application/json"
    return config
})

apiRequest.interceptors.response.use((response)=> response, (error)=> {
    if(error.response.status === 401){
        localStorage.removeItem("token")
        localStorage.removeItem("role")
        localStorage.removeItem("umi_auth_token")
        localStorage.removeItem("umi_auth_state")
        window.location.href = "/login"
    }
    return Promise.reject(error)
})

export default apiRequest

