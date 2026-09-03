import { getToken } from './auth/token'

const SERVER_ORIGIN =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')
    .replace(/\/api\/v1\/?$/, '')
    .replace(/\/+$/, '') ||
  window.location.origin

let socket = null
let ioPromise = null

// socket.io-client (~41KB) is loaded lazily on first connect so it is not
// paid on every page load. Only NotificationContext (logged-in users) and the
// support screens actually use a live socket.
const getIO = () => {
  if (!ioPromise) {
    ioPromise = import('socket.io-client').then((mod) => mod.io)
  }
  return ioPromise
}

export const connectSocket = async () => {
  if (socket) {
    socket.auth = { token: getToken() }
    if (!socket.connected) socket.connect()
    return socket
  }
  try {
    const io = await getIO()
    socket = io(SERVER_ORIGIN, {
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })
    socket.auth = { token: getToken() }
    if (!socket.connected) socket.connect()
  } catch (error) {
    console.error('Failed to load socket client', error)
  }
  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect()
}

export const joinSupportRoom = (ticketId) => {
  if (socket?.connected && ticketId) socket.emit('support:join', ticketId)
}

export const leaveSupportRoom = (ticketId) => {
  if (socket?.connected && ticketId) socket.emit('support:leave', ticketId)
}
