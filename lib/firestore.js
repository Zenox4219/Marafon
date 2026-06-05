import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Users ──────────────────────────────────────────────
export async function createOrUpdateUser(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      displayName: user.displayName || "Участник",
      email: user.email,
      photoURL: user.photoURL || null,
      totalKm: 0,
      finishedMarathons: 0,
      createdAt: serverTimestamp(),
    });
  }
  return (await getDoc(ref)).data();
}

export async function getUser(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteUser(uid) {
  await deleteDoc(doc(db, "users", uid));
}

export async function updateUserStats(uid, km) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    await updateDoc(ref, {
      totalKm: (data.totalKm || 0) + km,
      finishedMarathons: (data.finishedMarathons || 0) + 1,
    });
  }
}

// ── Marathons ──────────────────────────────────────────
export async function getMarathons() {
  const snap = await getDocs(collection(db, "marathons"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addMarathon(data) {
  return await addDoc(collection(db, "marathons"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateMarathon(id, data) {
  await updateDoc(doc(db, "marathons", id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteMarathon(id) {
  await deleteDoc(doc(db, "marathons", id));
}

// ── Leaderboard ────────────────────────────────────────
export async function getLeaderboard(n = 20) {
  const q = query(collection(db, "users"), orderBy("totalKm", "desc"), limit(n));
  const snap = await getDocs(q);
  return snap.docs.map((d, i) => ({ rank: i + 1, ...d.data() }));
}
