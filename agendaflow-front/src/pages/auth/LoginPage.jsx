import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Stethoscope } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import styles from './Auth.module.css';

const schema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

export default function LoginPage() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data) {
    try {
      setError('');
      const user = await login(data.email, data.password);
      if (user.role === 'admin')  navigate('/admin');
      else if (user.role === 'owner') navigate('/professional');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao entrar. Verifique suas credenciais.');
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
          <h1 className={styles.headline}>Cuidando de você com tecnologia e humanidade</h1>
          <p className={styles.sub}>Agende consultas, acompanhe seu histórico e tenha acesso aos melhores profissionais.</p>
          <div className={styles.stats}>
            {[['12+', 'Especialidades'], ['98%', 'Satisfação'], ['5min', 'Agendamento']].map(([n, l]) => (
              <div key={l} className={styles.stat}>
                <div className={styles.statNum}>{n}</div>
                <div className={styles.statLabel}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.form}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Bem-vindo de volta</h2>
            <p className={styles.formSub}>Acesse sua conta para continuar</p>
          </div>

          {error && <div className={styles.alert}>{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.fields}>
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
              Entrar
            </Button>
          </form>

          <p className={styles.switchText}>
            Não tem conta?{' '}
            <Link to="/register" className={styles.switchLink}>Cadastre-se grátis</Link>
          </p>

          <div className={styles.demo}>
            <p className={styles.demoTitle}>Contas de demonstração</p>
            <div className={styles.demoList}>
              <div className={styles.demoItem}><span className={styles.demoBadge}>Admin</span> admin@agendaflow.com · Admin@123</div>
              <div className={styles.demoItem}><span className={styles.demoBadge} style={{background:'var(--info-light)',color:'var(--info)'}}>Dono</span> joao@barbearia.com · Senha@123</div>
              <div className={styles.demoItem}><span className={styles.demoBadge} style={{background:'var(--green-50)',color:'var(--green-700)'}}>Cliente</span> maria@email.com · Senha@123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}