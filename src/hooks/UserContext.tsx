import React, { createContext, useState, useContext, ReactNode } from "react";

// Define la forma del contexto
interface UserRoleContextType {
  role: string;
  setRole: (role: string) => void;
}

// Crear el contexto
const UserRoleContext = createContext<UserRoleContextType>({
  role: "beneficiary", // valor por defecto
  setRole: () => {},
});

// Provider para envolver la app
export const UserRoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState("beneficiary");

  return (
    <UserRoleContext.Provider value={{ role, setRole }}>
      {children}
    </UserRoleContext.Provider>
  );
};

// Hook para usar el contexto fácilmente
export const useUserRole = () => useContext(UserRoleContext);
