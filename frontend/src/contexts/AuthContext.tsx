import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export type UserRole = "superadmin" | "manager" | "user";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string, name: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users
const mockUsers: User[] = [
  { id: "1", username: "admin", email: "admin@company.com", role: "superadmin", name: "Admin User" },
  { id: "2", username: "manager1", email: "manager@company.com", role: "manager", name: "John Manager" },
  { id: "3", username: "user1", email: "user1@company.com", role: "user", name: "Alice Developer" },
  { id: "4", username: "user2", email: "user2@company.com", role: "user", name: "Bob Developer" },
  { id: "5", username: "user3", email: "user3@company.com", role: "user", name: "Carol Developer" },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string) => {
    // Mock login - just check if username exists
    const foundUser = mockUsers.find((u) => u.username === username);
    if (foundUser && password === "password") {
      setUser(foundUser);
      localStorage.setItem("user", JSON.stringify(foundUser));
      
      // Navigate based on role
      if (foundUser.role === "superadmin") {
        navigate("/admin");
      } else if (foundUser.role === "manager") {
        navigate("/manager");
      } else {
        navigate("/dashboard");
      }
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  const register = async (username: string, email: string, password: string, name: string) => {
    // Mock register
    const newUser: User = {
      id: String(mockUsers.length + 1),
      username,
      email,
      role: "user",
      name,
    };
    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    navigate("/dashboard");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { mockUsers };
