import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Store role and plan in localStorage to persist across auth flows
    const [userRole, setUserRoleState] = useState(() => localStorage.getItem('vc_role') || 'driver');
    const [userPlan, setUserPlanState] = useState(() => localStorage.getItem('vc_plan') || 'free');

    const setUserRole = (role) => {
        localStorage.setItem('vc_role', role);
        setUserRoleState(role);
    };

    const setUserPlan = (plan) => {
        localStorage.setItem('vc_plan', plan);
        setUserPlanState(plan);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = (email, password) =>
        signInWithEmailAndPassword(auth, email, password);

    const signup = (email, password) =>
        createUserWithEmailAndPassword(auth, email, password);

    const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{
            user, loading, login, signup, loginWithGoogle, logout,
            userRole, setUserRole, userPlan, setUserPlan
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
