import { create } from 'zustand'
import { User } from 'firebase/auth'
import { UserRole } from '@/types/ncedocare'

interface AuthState {
    user: User | null
    role: UserRole | null
    facilityId: string | null
    loading: boolean
    setUser: (user: User | null) => void
    setRole: (role: UserRole | null) => void
    setFacilityId: (id: string | null) => void
    setLoading: (loading: boolean) => void
    clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    role: null,
    facilityId: null,
    loading: true,
    setUser: (user) => set({ user }),
    setRole: (role) => set({ role }),
    setFacilityId: (facilityId) => set({ facilityId }),
    setLoading: (loading) => set({ loading }),
    clear: () => set({ user: null, role: null, facilityId: null, loading: false }),
}))