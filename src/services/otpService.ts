import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
export * from './emailAuthService';

export const generateAndStoreOtp = async (email: string): Promise<string> => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Timestamp.fromMillis(Date.now() + 5 * 60 * 1000); // 5 minutes

  try {
    if (db) {
      await setDoc(doc(db, 'otps', email.toLowerCase()), {
        email: email.toLowerCase(),
        code,
        expiresAt
      }).catch((e) => console.warn('Firestore OTP write skipped:', e));
    }
  } catch (err) {
    console.warn('Firestore OTP save notice:', err);
  }
  
  // Call server-side API to send email
  try {
    const response = await fetch('/api/auth/send-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });

    if (!response.ok) {
      console.warn('Server send-email-otp returned non-ok status');
    }
  } catch (fetchErr) {
    console.warn('Fetch send-email-otp notice:', fetchErr);
  }

  // Also store in sessionStorage as client fallback
  try {
    sessionStorage.setItem(`ss_otp_${email.toLowerCase()}`, JSON.stringify({
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
    }));
  } catch {}

  return code;
};

export const verifyOtp = async (email: string, code: string): Promise<boolean> => {
  try {
    if (db) {
      const docRef = doc(db, 'otps', email.toLowerCase());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.code === code && data.expiresAt.toMillis() > Date.now()) {
          return true;
        }
      }
    }
  } catch (err) {
    console.warn('Firestore verifyOtp notice:', err);
  }

  // Fallback to server verification
  try {
    const res = await fetch('/api/auth/verify-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.valid) return true;
    }
  } catch {}

  // Fallback to sessionStorage
  try {
    const stored = sessionStorage.getItem(`ss_otp_${email.toLowerCase()}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.code === code && Date.now() < parsed.expiresAt) {
        return true;
      }
    }
  } catch {}

  return false;
};
