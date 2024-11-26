
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "../styles/settings.css";
import { toast } from "react-toastify";

export default function Settings() {
    const [userInfo, setUserInfo] = useState({
        userName: "",
        email: "",
        password: "*********"
    });
    const [password, setPassword] = useState("********");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [editedValue, setEditedValue] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); 

    useEffect(() => {
        fetchUserInfo();
    }, []);

    // Fetch user information
    const fetchUserInfo = () => {
        const token = Cookies.get("token");
        axios
            .get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/settings/getInfo`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                setUserInfo(response.data.data.user);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching user info:", err);
                setError("Failed to load user information.");
                setLoading(false);
            });
    };

    // Handle initiating the edit
    const handleEdit = (field) => {
        setEditingField(field);
        setEditedValue(userInfo[field]); // Pre-fill with the current value
        if (field === "password") setConfirmPassword(""); // Reset confirm password
    };

    const handleSave = async () => {
        setError(''); // Reset error message before new submission
    
        // Validate confirm password for password field
        if (editingField === "password" && editedValue !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
    
        try {
            const token = Cookies.get("token");
    
            // Construct the request body
            const requestBody =
                editingField === "password"
                    ? { password: editedValue, confirmPassword }
                    : { [editingField]: editedValue };
    
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/settings/updateInfo`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(requestBody),
                }
            );
    
            const data = await response.json();
    
            if (response.ok && data.status === "success") {
                // Update the userInfo state with the updated user data
                setUserInfo((prev) => ({
                    ...prev,
                    [editingField]: editingField === "password" ? "********" : editedValue,
                }));
                // Clear edit state
                setEditingField(null);
                setEditedValue('');
                setConfirmPassword('');
                toast.success("Account info has been updated");
            } else {
                // Set server error message
                setError(data.message || "Failed to update user information.");
                toast.error("Failed to update account information.")
            }
        } catch (error) {
            // Handle unexpected errors
            setError("An unexpected error occurred. Please try again.");
        }
    };

    // Handle canceling the edit
    const handleCancel = () => {
        setEditingField(null);
        setEditedValue("");
        setError(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
            <div className="settings-container">
                <div className="account-info">
                    <h2>Account Information</h2>
                    <div className="info-item">
                        <label>User Name</label>
                        {editingField === "userName" ? (
                            <div>
                                <input
                                    type="text"
                                    value={editedValue}
                                    onChange={(e) => setEditedValue(e.target.value)}
                                />
                                <button onClick={handleSave}>Save</button>
                                <button onClick={handleCancel}>Cancel</button>
                            </div>
                        ) : (
                            <>
                                <span>{userInfo.userName}</span>
                                <button onClick={() => handleEdit("userName")}>Edit</button>
                            </>
                        )}
                    </div>
                    <div className="info-item">
                        <label>Email Address</label>
                        {editingField === "email" ? (
                            <div>
                                <input
                                    type="email"
                                    value={editedValue}
                                    onChange={(e) => setEditedValue(e.target.value)}
                                />
                                <button onClick={handleSave}>Save</button>
                                <button onClick={handleCancel}>Cancel</button>
                            </div>
                        ) : (
                            <>
                                <span>{userInfo.email}</span>
                                <button onClick={() => handleEdit("email")}>Edit</button>
                            </>
                        )}
                    </div>
                    <div className="info-item">
                        <label>Password</label>
                        {editingField === "password" ? (
                            <div>
                                <input
                                    type="password"
                                    value={editedValue}
                                    onChange={(e) => setEditedValue(e.target.value)}
                                    placeholder="New Password"
                                />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm Password"
                                />
                                <button onClick={handleSave}>Save</button>
                                <button onClick={handleCancel}>Cancel</button>
                            </div>
                        ) : (
                            <>
                                <span>{password}</span>
                                <button onClick={() => handleEdit("password")}>Edit</button>
                            </>
                        )}
                    </div>
                </div>
                {error && <div className="error-message">{error}</div>}
            </div>
    );
}