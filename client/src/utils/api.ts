const API_URL = import.meta.env.VITE_API_URL || 'http://115.190.255.89:3000'

export const apiCall = async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    })

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
}

// 使用示例
export const getExams = () => apiCall('/exams')
