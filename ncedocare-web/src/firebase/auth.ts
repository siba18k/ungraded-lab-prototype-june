import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
} from 'firebase/auth'
import { auth } from './firebase'

export const loginWithEmail = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password)

export const logout = () => signOut(auth)

export const onAuthChange = (callback: (user: User | null) => void) =>
    onAuthStateChanged(auth, callback)