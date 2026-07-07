import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
} from 'firebase/auth'
import { auth } from './firebase'

export const loginWithEmail = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password)

export const signUpWithEmail = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password)

export const logout = () => signOut(auth)