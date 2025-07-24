import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  criado_em: string;
  cpf?: string; 
};

type AuthContextProps = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const tokenStorage = await AsyncStorage.getItem("token");
        const id = await AsyncStorage.getItem("id");
        const nome = await AsyncStorage.getItem("nome");
        const email = await AsyncStorage.getItem("email");
        const telefone = await AsyncStorage.getItem("telefone");
        const criado_em = await AsyncStorage.getItem("criado_em");
        const cpf = await AsyncStorage.getItem("cpf");

        if (tokenStorage && id && nome && email) {
          setToken(tokenStorage);
          setUser({
            id: Number(id),
            nome,
            email,
            telefone: telefone ?? "",
            criado_em: criado_em ?? "",
            cpf: cpf ?? ""
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const login = async (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);

    await AsyncStorage.setItem("token", authToken);
    await AsyncStorage.setItem("id", userData.id.toString());
    await AsyncStorage.setItem("nome", userData.nome);
    await AsyncStorage.setItem("email", userData.email);
    await AsyncStorage.setItem("telefone", userData.telefone);
    await AsyncStorage.setItem("criado_em", userData.criado_em);
    if (userData.cpf) {
      await AsyncStorage.setItem("cpf", userData.cpf);
    } else {
      await AsyncStorage.removeItem("cpf");
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
