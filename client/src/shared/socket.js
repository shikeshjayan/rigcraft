import { io } from 'socket.io-client'

const SERVER_ORIGIN = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/+$/, '')

export const socket = io(SERVER_ORIGIN, {
  withCredentials: true,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
})

export const connectSocket = () => {
  if (!socket.connected) socket.connect()
  return socket
}

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect()
}

export const joinSupportRoom = (ticketId) => {
  if (socket.connected && ticketId) socket.emit('support:join', ticketId)
}

export const leaveSupportRoom = (ticketId) => {
  if (socket.connected && ticketId) socket.emit('support:leave', ticketId)
}
