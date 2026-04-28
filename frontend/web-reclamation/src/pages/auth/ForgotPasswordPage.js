import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { authAPI } from '../../api/auth';

const schema = yup.object({
  email: yup.string().email('Email invalide').required('Email requis'),
});

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authAPI.forgotPassword(data.email);
      if (response.success) {
        setSubmitted(true);
        toast.success('Email envoyé !');
      } else {
        toast.error(response.message || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h2>Email envoyé !</h2>
              <p>Un email de réinitialisation a été envoyé à votre adresse.</p>
            </div>
            <div className="login-footer">
              <Link to="/login">Retour à la connexion</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Mot de passe oublié ?</h2>
            <p>Saisissez votre email pour recevoir un lien de réinitialisation</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                {...register('email')}
                className={errors.email ? 'error' : ''}
                placeholder="votre@email.com"
              />
              {errors.email && <span className="error-message">{errors.email.message}</span>}
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Envoi...' : 'Envoyer'}
            </button>
          </form>

          <div className="login-footer">
            <Link to="/login">Retour à la connexion</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;