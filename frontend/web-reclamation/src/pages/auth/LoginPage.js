import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';
import './LoginPage.css';

const loginSchema = yup.object({
  email:    yup.string().email('Email invalide').required('Email requis'),
  password: yup.string().required('Mot de passe requis'),
});

const registerSchema = yup.object({
  nom:              yup.string().required('Nom requis'),
  prenom:           yup.string().required('Prénom requis'),
  email:            yup.string().email('Email invalide').required('Email requis'),
  typeUtilisateur:  yup.string().required('Veuillez choisir un rôle'),
  service:          yup.string().required('Service requis'),
  zoneGeographique: yup.string().when('typeUtilisateur', {
    is: 'AgentMunicipal',
    then: (s) => s.required('Zone géographique requise'),
    otherwise: (s) => s.optional(),
  }),
  password:         yup.string().min(6, 'Minimum 6 caractères').required('Mot de passe requis'),
  confirmPassword:  yup.string()
    .oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('Confirmation requise'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const {
    register: registerLogin,
    handleSubmit: handleLogin,
    formState: { errors: loginErrors }
  } = useForm({ resolver: yupResolver(loginSchema) });

  const {
    register: registerSignup,
    handleSubmit: handleSignup,
    formState: { errors: signupErrors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: { typeUtilisateur: '' }
  });

  const watchRole = watch('typeUtilisateur');

  const onLogin = async (data) => {
    setLoading(true);
    const result = await login(data.email, data.password);
    setLoading(false);

    if (result.success) {
      toast.success('Connexion réussie');
      const user = JSON.parse(localStorage.getItem('@user_data'));
      if (user?.typeUtilisateur === 'AgentMunicipal') {
        navigate('/agent/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast.error(result.error || 'Erreur de connexion');
    }
  };

  const onRegister = async (data) => {
    setLoading(true);
    try {
      // ✅ Map password -> motDePasse (backend expects motDePasse)
      const payload = {
        nom:              data.nom,
        prenom:           data.prenom,
        email:            data.email,
        motDePasse:       data.password,
        typeUtilisateur:  data.typeUtilisateur,
        service:          data.service          || '',
        zoneGeographique: data.zoneGeographique || '',
      };

      console.log('📤 Payload envoyé:', payload);

      const response = await authAPI.register(payload);

      if (response.success) {
        toast.success('Compte créé avec succès ! Vous pouvez vous connecter.');
        setActiveTab('login');
      } else {
        toast.error(response.message || 'Erreur lors de la création du compte');
      }
    } catch (error) {
      console.error('❌ Erreur register:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">

          {/* Logo */}
          <div className="login-logo">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <h2>Gestion des Réclamations</h2>
            <p>Connectez-vous à votre espace</p>
          </div>

          {/* Tabs */}
          <div className="login-tabs">
            <button
              className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Se connecter
            </button>
            <button
              className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Créer un compte
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin(onLogin)} className="login-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  {...registerLogin('email')}
                  className={loginErrors.email ? 'error' : ''}
                  placeholder="exemple@email.com"
                />
                {loginErrors.email && <span className="error-message">{loginErrors.email.message}</span>}
              </div>

              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  {...registerLogin('password')}
                  className={loginErrors.password ? 'error' : ''}
                  placeholder="••••••••"
                />
                {loginErrors.password && <span className="error-message">{loginErrors.password.message}</span>}
              </div>

              <div className="form-options">
                <Link to="/forgot-password">Mot de passe oublié ?</Link>
              </div>

              <button type="submit" className="btn-primary-full" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>

              <p className="login-footer-text">
                Accès réservé aux administrateurs et agents municipaux
              </p>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleSignup(onRegister)} className="login-form">

              <div className="form-row">
                <div className="form-group">
                  <label>Nom</label>
                  <input
                    type="text"
                    {...registerSignup('nom')}
                    className={signupErrors.nom ? 'error' : ''}
                    placeholder="Votre nom"
                  />
                  {signupErrors.nom && <span className="error-message">{signupErrors.nom.message}</span>}
                </div>
                <div className="form-group">
                  <label>Prénom</label>
                  <input
                    type="text"
                    {...registerSignup('prenom')}
                    className={signupErrors.prenom ? 'error' : ''}
                    placeholder="Votre prénom"
                  />
                  {signupErrors.prenom && <span className="error-message">{signupErrors.prenom.message}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  {...registerSignup('email')}
                  className={signupErrors.email ? 'error' : ''}
                  placeholder="exemple@email.com"
                />
                {signupErrors.email && <span className="error-message">{signupErrors.email.message}</span>}
              </div>

              {/* Role selector */}
              <div className="form-group">
                <label>Rôle</label>
                <div className="role-selector">
                  <div
                    className={`role-card ${watchRole === 'Administrateur' ? 'role-active' : ''}`}
                    onClick={() => setValue('typeUtilisateur', 'Administrateur', { shouldValidate: true })}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <span>Administrateur</span>
                  </div>
                  <div
                    className={`role-card ${watchRole === 'AgentMunicipal' ? 'role-active' : ''}`}
                    onClick={() => setValue('typeUtilisateur', 'AgentMunicipal', { shouldValidate: true })}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>Agent Municipal</span>
                  </div>
                </div>
                {signupErrors.typeUtilisateur && (
                  <span className="error-message">{signupErrors.typeUtilisateur.message}</span>
                )}
              </div>

              {/* Service - both roles */}
              {watchRole && (
                <div className="form-group">
                  <label>Service</label>
                  <input
                    type="text"
                    {...registerSignup('service')}
                    className={signupErrors.service ? 'error' : ''}
                    placeholder={watchRole === 'Administrateur' ? 'Ex: Administration, Informatique...' : 'Ex: Voirie, Éclairage...'}
                  />
                  {signupErrors.service && <span className="error-message">{signupErrors.service.message}</span>}
                </div>
              )}

              {/* Zone géographique - agent only */}
              {watchRole === 'AgentMunicipal' && (
                <div className="form-group">
                  <label>Zone géographique</label>
                  <input
                    type="text"
                    {...registerSignup('zoneGeographique')}
                    className={signupErrors.zoneGeographique ? 'error' : ''}
                    placeholder="Ex: Tunis Nord, Sfax Centre..."
                  />
                  {signupErrors.zoneGeographique && <span className="error-message">{signupErrors.zoneGeographique.message}</span>}
                </div>
              )}

              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  {...registerSignup('password')}
                  className={signupErrors.password ? 'error' : ''}
                  placeholder="Minimum 6 caractères"
                />
                {signupErrors.password && <span className="error-message">{signupErrors.password.message}</span>}
              </div>

              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input
                  type="password"
                  {...registerSignup('confirmPassword')}
                  className={signupErrors.confirmPassword ? 'error' : ''}
                  placeholder="••••••••"
                />
                {signupErrors.confirmPassword && <span className="error-message">{signupErrors.confirmPassword.message}</span>}
              </div>

              <button type="submit" className="btn-primary-full" disabled={loading}>
                {loading ? 'Création en cours...' : 'Créer mon compte'}
              </button>

              <p className="login-footer-text">
                En créant un compte, vous acceptez nos conditions d'utilisation
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;