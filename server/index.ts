import express, { Express } from 'express'
import cors, { CorsOptions } from 'cors'

const app: Express = express()
const isDev = process.env.NODE_ENV !== 'production'
const frontendUrl = process.env.FRONTEND_URL || 'http://115.190.255.89:5173'

// CORS 配置
const corsOptions: CorsOptions = {
    origin: isDev ? true : frontendUrl, // 开发环境允许任意 origin，生产环境限制为 FRONTEND_URL 或默认值
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 预检请求缓存 24 小时
}

app.use(cors(corsOptions))

// 中间件
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

export default app