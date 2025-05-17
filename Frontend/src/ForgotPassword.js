import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState("");

  const handleSendReset = async () => {
    try {
      await axios.post("/api/auth/forgot-password", { email });
      toast.success("Reset link sent to your email");
      onClose();
    } catch (error) {
      toast.error("Error sending reset link");
    }
  };

  return (
    <div className="modal">
      <h3>Forgot Password</h3>
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSendReset}>Send Reset Link</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
