import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Save, PlusCircle } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api';
import { ownerLinks } from './ownerLinks';
import styles from './ManageEstablishment.module.css';

const schema = z.object({
  name:    z.string().min(2, 'Mínimo 2 caracteres'),
  slug:    z.string().min(2, 'Mínimo 2 caracteres')
             .regex(/^[a-z0-9-]+$/, 'Apenas letras minúsculas, números e hífens'),
  phone:   z.string().optional(),
  address: z.string().optional(),
});

export default function ManageEstablishment() {
  const [establishment, setEstablishment] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [success, setSuccess]   = useState('');
  const [error,   setError]     = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    api.get('/establishments/me/list')
      .then(({ data }) => {
        const est = data.establishments?.[0];
        if (est) {
          setEstablishment(est);
          reset({
            name:    est.name,
            slug:    est.slug,
            phone:   est.phone   || '',
            address: est.address || '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, [reset]);

  async function onSubmit(data) {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (establishment) {
        const { data: updated } = await api.put(`/establishments/${establishment.id}`, {
          name:    data.name,
          phone:   data.phone,
          address: data.address,
        });
        setEstablishment(updated.establishment);
        setSuccess('Estabelecimento atualizado com sucesso!');
      } else {
        const { data: created } = await api.post('/establishments', data);
        setEstablishment(created.establishment);
        setSuccess('Estabelecimento criado com sucesso!');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.layout}>
      <Sidebar links={ownerLinks} />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Meu estabelecimento</h1>
            <p className={styles.subtitle}>
              {establishment ? 'Edite as informações do seu estabelecimento' : 'Cadastre seu estabelecimento para começar a receber agendamentos'}
            </p>
          </div>
          <div className={styles.headerIcon}>
            <Building2 size={28} strokeWidth={1.5} />
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Carregando...</div>
        ) : (
          <Card className={styles.card}>
            {success && <div className={styles.alertSuccess}>{success}</div>}
            {error   && <div className={styles.alertError}>{error}</div>}

            {!establishment && (
              <div className={styles.emptyBanner}>
                <PlusCircle size={20} />
                <span>Você ainda não tem um estabelecimento cadastrado. Preencha o formulário abaixo para criar.</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.row}>
                <Input
                  label="Nome do estabelecimento"
                  placeholder="Ex: Clínica Médica São Lucas"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Slug (identificador único)"
                  placeholder="ex: clinica-sao-lucas"
                  hint="Apenas letras minúsculas, números e hífens"
                  error={errors.slug?.message}
                  disabled={!!establishment}
                  {...register('slug')}
                />
              </div>
              <div className={styles.row}>
                <Input
                  label="Telefone"
                  placeholder="(54) 99999-0000"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <Input
                  label="Endereço"
                  placeholder="Rua das Flores, 100 - Cidade/UF"
                  error={errors.address?.message}
                  {...register('address')}
                />
              </div>

              <div className={styles.actions}>
                <Button type="submit" loading={saving} size="lg">
                  <Save size={16} />
                  {establishment ? 'Salvar alterações' : 'Criar estabelecimento'}
                </Button>
              </div>
            </form>

            {establishment && (
              <div className={styles.info}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>ID</span>
                  <span className={styles.infoValue}>#{establishment.id}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Slug</span>
                  <span className={styles.infoValue}>{establishment.slug}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Status</span>
                  <span className={`${styles.badge} ${establishment.active ? styles.active : styles.inactive}`}>
                    {establishment.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}