import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendReset = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/api/auth/forgot-password", { email });
      toast.success("Reset link sent to your email");
      setEmail(""); // Clear input after successful send
    } catch (error) {
      toast.error("Error sending reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <h3>Forgot Password</h3>
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
      />
      <button onClick={handleSendReset} disabled={isLoading}>
        {isLoading ? "Sending..." : "Send Reset Link"}
      </button>
    </div>
  );
}
