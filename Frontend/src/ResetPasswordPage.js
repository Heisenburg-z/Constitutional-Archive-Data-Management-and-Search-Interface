import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (newPassword.length < 6) {
      toast.error("Password should be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/reset-password/${token}`, {
        newPassword,
      });
      toast.success("Password reset successful");
      navigate("/admin/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error resetting password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <h2>Reset Password</h2>
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        disabled={isLoading}
      />
      <button onClick={handleReset} disabled={isLoading}>
        {isLoading ? "Resetting..." : "Reset Password"}
      </button>
    </div>
  );
}
