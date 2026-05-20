import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Stethoscope } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import styles from './Auth.module.css';

const schema = z.object({
  name:     z.string().min(2, 'Mínimo 2 caracteres'),
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role:     z.enum(['client', 'owner']),
});

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'client' },
  });

  async function onSubmit(data) {
    try {
      setError('');
      await registerUser(data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta.');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}><Stethoscope size={28} /></div>
            <div>
              <div className={styles.brandName}>MedFlow</div>
              <div className={styles.brandSub}>Clínica Médica</div>
            </div>
          </div>
          <h1 className={styles.headline}>Sua saúde em primeiro lugar</h1>
          <p className={styles.sub}>Crie sua conta e tenha acesso a consultas rápidas, lembretes automáticos e histórico completo de atendimentos.</p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.form}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Criar conta</h2>
            <p className={styles.formSub}>Preencha os dados abaixo para começar</p>
          </div>

          {error && <div className={styles.alert}>{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.fields}>
            <Input label="Nome completo" placeholder="Dr. João Silva" icon={User} error={errors.name?.message} {...register('name')} />
            <Input label="E-mail" type="email" placeholder="seu@email.com" icon={Mail} error={errors.email?.message} {...register('email')} />
            <Input label="Senha" type="password" placeholder="Mínimo 6 caracteres" icon={Lock} error={errors.password?.message} hint="Use letras, números e símbolos para mais segurança" {...register('password')} />

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', display: 'block', marginBottom: 8 }}>Tipo de conta</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[['client', 'Paciente'], ['owner', 'Clínica / Profissional']].map(([val, label]) => (
                  <label key={val} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                    <input type="radio" value={val} {...register('role')} style={{ accentColor: 'var(--green-600)' }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
              Criar conta
            </Button>
          </form>

          <p className={styles.switchText}>
            Já tem conta?{' '}
            <Link to="/login" className={styles.switchLink}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}