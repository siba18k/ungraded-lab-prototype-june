import { initializeApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key)

if (missing.length > 0) {
    throw new Error(
        `Missing Firebase env vars: ${missing.join(', ')}. Check ncedocare-web/.env.local and restart the dev server.`
    )
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app, 'us-central1')
export const storage = getStorage(app)

export default app

declare global {
    // eslint-disable-next-line no-var
    var __FIREBASE_EMULATORS_CONNECTED__: boolean | undefined
}

const useEmulator =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_USE_EMULATOR === 'true'

if (useEmulator && !globalThis.__FIREBASE_EMULATORS_CONNECTED__) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
    connectFunctionsEmulator(functions, '127.0.0.1', 5001)
    connectStorageEmulator(storage, '127.0.0.1', 9199)

    globalThis.__FIREBASE_EMULATORS_CONNECTED__ = true
    console.warn('🔥 Running in EMULATOR mode — not touching production Firebase.')
}