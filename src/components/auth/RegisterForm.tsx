// RegisterForm.tsx - VERSIÓN CON FEEDBACK
import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Link, useNavigate } from "react-router-dom"; // ← Agregar useNavigate
import { useAuth } from '../../contexts/AuthContext';

const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate(); // ← Para redirección
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    document_type: '',
    document_number: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false); // ← Estado para éxito

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      await register(formData);
      
      // ✅ ÉXITO: Mostrar mensaje y resetear formulario
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        password: '',
        document_type: '',
        document_number: '',
      });
      
      // Opcional: Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/login'); // ← Redirige al login
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Error en el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-200 text-center">Crear Cuenta</h2>
      
      {/* Mensaje de ERROR */}
      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Mensaje de ÉXITO */}
      {success && (
        <div className="bg-green-500 text-white p-3 rounded mb-4">
          ✅ ¡Registro exitoso! Redirigiendo al login...
        </div>
      )}

      <Input
        label="Nombre completo"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <Input
        type="email"
        label="Correo electrónico"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <Input
        type="password"
        label="Contraseña"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <div className="flex flex-col mb-4">
        <label className="mb-1 text-gray-300">Tipo de Documento</label>
        <select
          name="document_type"
          value={formData.document_type}
          onChange={handleChange}
          className="px-3 py-2 rounded-md bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          required
        >
          <option value="">Seleccione...</option>
          <option value="DPI">DPI</option>
          <option value="Pasaporte">Pasaporte</option>
        </select>
      </div>

      <Input
        label="Número de Documento"
        name="document_number"
        value={formData.document_number}
        onChange={handleChange}
        required
      />

      <Button 
        type="submit" 
        className="w-full mt-4"
        disabled={isLoading}
      >
        {isLoading ? 'Registrando...' : 'Registrarse'}
      </Button>
      
      <p className="text-gray-400 text-sm text-center mt-4">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="text-blue-400 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;