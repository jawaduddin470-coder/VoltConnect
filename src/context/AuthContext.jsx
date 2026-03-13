import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
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
        let isMounted = true;
        console.log("AuthContext: Initializing...");

        const initializeAuth = async () => {
            try {
                // 1. Check persistence
                console.log("AuthContext: Setting persistence...");
                await setPersistence(auth, browserLocalPersistence);
                
                // 2. Check for redirect result
                console.log("AuthContext: Checking for redirect result...");
                const result = await getRedirectResult(auth);
                if (result) {
                    console.log("AuthContext: Found redirect result for:", result.user.email);
                    setUser(result.user); // Set immediately
                } else {
                    console.log("AuthContext: No redirect result found.");
                }
            } catch (error) {
                console.error("AuthContext: Initialization/Redirect error:", error.code, error.message);
                // alert("Login Error: " + error.message); // Emergency alert for mobile debugging
            }

            // 3. Listen for state changes
            console.log("AuthContext: Attaching onAuthStateChanged listener...");
            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                if (!isMounted) return;
                
                console.log("AuthContext: Auth state changed. User:", currentUser ? currentUser.email : "none");
                setUser(currentUser);
                setLoading(false);

                if (currentUser) {
                    try {
                        const userRef = doc(db, 'users', currentUser.uid);
                        const docSnap = await getDoc(userRef);
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            console.log("AuthContext: Profile loaded for:", currentUser.email);
                            if (data.role && data.role !== userRole) {
                                setUserRoleState(data.role);
                                localStorage.setItem('vc_role', data.role);
                            }
                        } else {
                            console.log("AuthContext: Creating new profile for:", currentUser.email);
                            await setDoc(userRef, {
                                email: currentUser.email,
                                role: localStorage.getItem('vc_role') || 'driver',
                                created_at: new Date().toISOString()
                            }, { merge: true });
                        }
                    } catch (e) {
                        console.warn("AuthContext: Background profile fetch error", e);
                    }
                }
            });

            return unsubscribe;
        };

        const cleanupPromise = initializeAuth();

        return () => {
            isMounted = false;
            cleanupPromise.then(unsubscribe => {
                if (unsubscribe) unsubscribe();
            });
        };
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
