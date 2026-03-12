import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Store role and plan in localStorage to persist across auth flows
    const [userRole, setUserRoleState] = useState(() => localStorage.getItem('vc_role') || 'driver');
    const [userPlan, setUserPlanState] = useState(() => localStorage.getItem('vc_plan') || 'free');

    const setUserRole = async (role) => {
        localStorage.setItem('vc_role', role);
        setUserRoleState(role);
        if (user) {
            try {
                await setDoc(doc(db, 'users', user.uid), { role }, { merge: true });
            } catch (e) {
                console.error("Failed to sync role to Firestore", e);
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
                console.error("Failed to sync plan to Firestore", e);
            }
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Fetch from Firestore
                try {
                    const userRef = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(userRef);
                    
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.role) {
                            setUserRoleState(data.role);
                            localStorage.setItem('vc_role', data.role);
                        }
                        if (data.subscription_plan) {
                            setUserPlanState(data.subscription_plan);
                            localStorage.setItem('vc_plan', data.subscription_plan);
                        }
                    } else {
                        // First time login - create doc with current local defaults
                        await setDoc(userRef, {
                            email: currentUser.email,
                            role: userRole,
                            subscription_plan: userPlan,
                            created_at: new Date().toISOString()
                        });
                    }
                } catch (e) {
                    console.error("Error fetching user data from Firestore", e);
                }
            }
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, [userRole, userPlan]);

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
