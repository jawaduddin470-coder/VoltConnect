import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
// Keep all imports; signInWithRedirect is used as a popup fallback
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [userRole, setUserRoleState] = useState(() => localStorage.getItem('vc_role') || 'driver');
    const [userPlan, setUserPlanState] = useState(() => localStorage.getItem('vc_plan') || 'free');

    // Prevent infinite loading if Firebase hangs
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (loading) {
                console.warn("Firebase Auth timeout: forcing load completion");
                setLoading(false);
            }
        }, 8000); // 8 second max wait
        return () => clearTimeout(timeout);
    }, [loading]);

    const setUserRole = async (role) => {
        localStorage.setItem('vc_role', role);
        setUserRoleState(role);
        if (user) {
            try {
                await setDoc(doc(db, 'users', user.uid), { role }, { merge: true });
            } catch (e) {
                console.error("AuthContext: Role sync error", e);
            }
        }
    };

    const setUserPlan = async (plan) => {
        localStorage.setItem('vc_plan', plan);
        setUserPlanState(plan);
        if (user) {
            try {
                await setDoc(doc(db, 'users', user.uid), { subscription_plan: plan }, { merge: true });
            } catch (e) {
                console.error("AuthContext: Plan sync error", e);
            }
        }
    };

    useEffect(() => {
        // Handle redirect result (for Google Sign-in)
        const checkRedirect = async () => {
            try {
                // This is crucial for returning from a Google redirect
                const result = await getRedirectResult(auth);
                if (result) {
                    console.log("AuthContext: Successfully logged in via redirect", result.user.email);
                }
            } catch (error) {
                console.error("AuthContext: Redirect result error", error);
            }
        };
        checkRedirect();

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            // Set user immediately and stop blocking the UI
            setUser(currentUser);
            setLoading(false);

            if (currentUser) {
                // Fetch profile data in the background
                try {
                    const userRef = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(userRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.role && data.role !== userRole) {
                            setUserRoleState(data.role);
                            localStorage.setItem('vc_role', data.role);
                        }
                        if (data.subscription_plan && data.subscription_plan !== userPlan) {
                            setUserPlanState(data.subscription_plan);
                            localStorage.setItem('vc_plan', data.subscription_plan);
                        }
                    } else {
                        // Create default profile if missing
                        await setDoc(userRef, {
                            email: currentUser.email,
                            role: localStorage.getItem('vc_role') || 'driver',
                            subscription_plan: localStorage.getItem('vc_plan') || 'free',
                            created_at: new Date().toISOString()
                        }, { merge: true });
                    }
                } catch (e) {
                    console.warn("AuthContext: Background profile fetch error", e);
                }
            }
        });
        return unsubscribe;
    }, []);

    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
    const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
    
    const loginWithGoogle = async () => {
        try {
            // Use redirect as primary for better PWA/Mobile compatibility
            await signInWithRedirect(auth, googleProvider);
            // Page will redirect away; control never reaches here on success
        } catch (error) {
            console.error("AuthContext: Google sign-in start error", error);
            throw error;
        }
    };

    const logout = () => signOut(auth);

    const value = {
        user, loading, login, signup, loginWithGoogle, logout,
        userRole, setUserRole, userPlan, setUserPlan
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #2979FF, #00B4D8)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, animation: 'pulse 2s infinite' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontSize: 18, fontWeight: 600, letterSpacing: 1 }}>Initializing VoltConnect...</div>
                <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(0.95); } }`}</style>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
