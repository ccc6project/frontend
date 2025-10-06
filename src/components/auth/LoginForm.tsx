// LoginForm.tsx - VERSIÓN CONECTADA A API
import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext'; // ← Importar contexto

const LoginForm: React.FC = () => {
  const { login } = useAuth(); // ← Usar contexto
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login({ email, password }); // ← Llama a la API via contexto
      
      // ✅ Login exitoso - redirigir al dashboard
      navigate('/dashboard');
      
    } catch (err: any) {
      setError(err.message || 'Email o contraseña incorrectos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-200 text-center">Login AMEX</h2>
      
      {/* Mensaje de ERROR */}
      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">
          {error}
        </div>
      )}

      <Input
        type="email"
        label="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        label="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <Button 
        type="submit" 
        className="w-full mt-4"
        disabled={isLoading}
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>
      
      <p className="text-gray-400 text-sm text-center mt-4">
        ¿No tienes cuenta?{" "}
        <Link to="/register" className="text-blue-400 hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;