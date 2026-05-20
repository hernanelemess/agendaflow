import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Scissors, PlusCircle, Trash2, Edit2, X, Check, Clock, DollarSign } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api';
import { ownerLinks } from './ownerLinks';
import styles from './ManageServices.module.css';

const schema = z.object({
  name:         z.string().min(2, 'Mínimo 2 caracteres'),
  description:  z.string().optional(),
  duration_min: z.coerce.number().min(5, 'Mínimo 5 minutos').max(480, 'Máximo 480 minutos'),
  price:        z.coerce.number().min(0, 'Valor inválido'),
});

export default function ManageServices() {
  const [establishment, setEstablishment] = useState(null);
  const [services,  setServices]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  async function loadData() {
    const { data } = await api.get('/establishments/me/list');
    const est = data.establishments?.[0];
    if (!est) { setLoading(false); return; }
    setEstablishment(est);
    const { data: svcData } = await api.get(`/services/establishment/${est.id}`);
    setServices(svcData.services || []);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  function openCreate() {
    setEditing(null);
    reset({ name: '', description: '', duration_min: 30, price: 0 });
    setShowForm(true);
    setError('');
  }

  function openEdit(svc) {
    setEditing(svc);
    reset({
      name:         svc.name,
      description:  svc.description || '',
      duration_min: svc.duration_min,
      price:        svc.price,
    });
    setShowForm(true);
    setError('');
  }

  async function onSubmit(data) {
    try {
      setError('');
      if (editing) {
        const { data: updated } = await api.put(`/services/${editing.id}`, data);
        setServices((prev) => prev.map((s) => s.id === editing.id ? updated.service : s));
        setSuccess('Serviço atualizado!');
      } else {
        await api.post('/services', { ...data, establishment_id: establishment.id });
        loadData();
        setSuccess('Serviço criado!');
      }
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar.');
    }
  }

  async function remove(id) {
    if (!confirm('Remover este serviço?')) return;
    await api.delete(`/services/${id}`);
    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  async function toggleActive(svc) {
    await api.put(`/services/${svc.id}`, { active: !svc.active });
    setServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, active: !s.active } : s));
  }

  return (
    <div className={styles.layout}>
      <Sidebar links={ownerLinks} />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Serviços</h1>
            <p className={styles.subtitle}>Gerencie os serviços oferecidos pelo seu estabelecimento</p>
          </div>
          {establishment && (
            <Button onClick={openCreate}>
              <PlusCircle size={16} /> Novo serviço
            </Button>
          )}
        </div>

        {!establishment && !loading && (
          <Card className={styles.warn}>
            Você precisa cadastrar seu estabelecimento primeiro.
          </Card>
        )}

        {success && <div className={styles.alertSuccess}>{success}</div>}

        {loading ? (
          <div className={styles.loading}>Carregando...</div>
        ) : (
          <>
            {showForm && (
              <Card className={styles.formCard}>
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>{editing ? 'Editar serviço' : 'Novo serviço'}</h2>
                  <button className={styles.closeBtn} onClick={() => setShowForm(false)}><X size={18} /></button>
                </div>
                {error && <div className={styles.alertError}>{error}</div>}
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                  <Input label="Nome do serviço" placeholder="Ex: Consulta geral" error={errors.name?.message} {...register('name')} />
                  <div>
                    <label className={styles.textareaLabel}>Descrição (opcional)</label>
                    <textarea className={styles.textarea} placeholder="Detalhes sobre o serviço..." rows={2} {...register('description')} />
                  </div>
                  <div className={styles.row}>
                    <Input
                      label="Duração (minutos)"
                      type="number"
                      placeholder="30"
                      error={errors.duration_min?.message}
                      {...register('duration_min')}
                    />
                    <Input
                      label="Valor (R$)"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      error={errors.price?.message}
                      {...register('price')}
                    />
                  </div>
                  <div className={styles.formActions}>
                    <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
                    <Button type="submit" loading={isSubmitting}>
                      <Check size={16} /> {editing ? 'Salvar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <div className={styles.list}>
              {services.length === 0 ? (
                <Card className={styles.empty}>
                  <Scissors size={36} strokeWidth={1.5} />
                  <p>Nenhum serviço cadastrado ainda.</p>
                  <Button size="sm" onClick={openCreate}><PlusCircle size={14} /> Adicionar</Button>
                </Card>
              ) : (
                services.map((svc) => (
                  <Card key={svc.id} className={`${styles.svcCard} ${!svc.active ? styles.inactive : ''}`}>
                    <div className={styles.svcInfo}>
                      <div className={styles.svcName}>{svc.name}</div>
                      {svc.description && <div className={styles.svcDesc}>{svc.description}</div>}
                      <div className={styles.svcMeta}>
                        <span><Clock size={12} /> {svc.duration_min} min</span>
                        <span><DollarSign size={12} /> R$ {Number(svc.price).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className={styles.svcActions}>
                      <button
                        className={`${styles.toggleBtn} ${svc.active ? styles.toggleOn : styles.toggleOff}`}
                        onClick={() => toggleActive(svc)}
                      >
                        {svc.active ? 'Ativo' : 'Inativo'}
                      </button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(svc)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => remove(svc.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}