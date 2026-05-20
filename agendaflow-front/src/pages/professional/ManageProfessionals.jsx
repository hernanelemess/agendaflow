import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, PlusCircle, Trash2, Edit2, X, Check } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api';
import { ownerLinks } from './ownerLinks';
import styles from './ManageProfessionals.module.css';

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  bio:  z.string().optional(),
});

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function ManageProfessionals() {
  const [establishment, setEstablishment] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [error,     setError]     = useState('');
  const [scheduleProf, setScheduleProf] = useState(null);
  const [schedules,    setSchedules]    = useState({});

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  async function loadData() {
    const { data } = await api.get('/establishments/me/list');
    const est = data.establishments?.[0];
    if (!est) { setLoading(false); return; }
    setEstablishment(est);
    const { data: profData } = await api.get(`/professionals/establishment/${est.id}`);
    setProfessionals(profData.professionals || []);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  function openCreate() {
    setEditing(null);
    reset({ name: '', bio: '' });
    setShowForm(true);
    setScheduleProf(null);
  }

  function openEdit(prof) {
    setEditing(prof);
    reset({ name: prof.name, bio: prof.bio || '' });
    setShowForm(true);
    setScheduleProf(null);
  }

  async function onSubmit(data) {
    try {
      setError('');

      if (editing) {
        // Edição — só atualiza e fecha o form
        await api.put(`/professionals/${editing.id}`, data);
        setShowForm(false);
        loadData();
      } else {
        // Criação — abre automaticamente o painel de horários
        const { data: created } = await api.post('/professionals', {
          ...data,
          establishment_id: establishment.id,
        });

        setShowForm(false);
        await loadData();

        // Abre o painel de horários já no profissional recém-criado
        const newProf = created.professional;
        setScheduleProf(newProf);
        setSchedules({});
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar.');
    }
  }

  async function remove(id) {
    if (!confirm('Remover este profissional?')) return;
    await api.delete(`/professionals/${id}`);
    setProfessionals((prev) => prev.filter((p) => p.id !== id));
    if (scheduleProf?.id === id) setScheduleProf(null);
  }

  async function openSchedule(prof) {
    setScheduleProf(prof);
    const { data } = await api.get(`/schedules/professional/${prof.id}`);
    const map = {};
    (data.schedules || []).forEach((s) => { map[s.id] = s; });
    setSchedules(map);
  }

  return (
    <div className={styles.layout}>
      <Sidebar links={ownerLinks} />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Profissionais</h1>
            <p className={styles.subtitle}>Gerencie a equipe do seu estabelecimento</p>
          </div>
          {establishment && (
            <Button onClick={openCreate}>
              <PlusCircle size={16} /> Novo profissional
            </Button>
          )}
        </div>

        {!establishment && !loading && (
          <Card className={styles.warn}>
            Você precisa cadastrar seu estabelecimento primeiro antes de adicionar profissionais.
          </Card>
        )}

        {loading ? (
          <div className={styles.loading}>Carregando...</div>
        ) : (
          <>
            {/* Formulário de criação/edição */}
            {showForm && (
              <Card className={styles.formCard}>
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>
                    {editing ? 'Editar profissional' : 'Novo profissional'}
                  </h2>
                  <button className={styles.closeBtn} onClick={() => setShowForm(false)}>
                    <X size={18} />
                  </button>
                </div>

                {!editing && (
                  <div className={styles.formHint}>
                    Após criar o profissional, você já poderá cadastrar os horários de atendimento dele.
                  </div>
                )}

                {error && <div className={styles.alertError}>{error}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                  <Input
                    label="Nome completo"
                    placeholder="Dra. Ana Souza"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <div>
                    <label className={styles.textareaLabel}>Especialidade / Bio (opcional)</label>
                    <textarea
                      className={styles.textarea}
                      placeholder="Ex: Cardiologista com 10 anos de experiência..."
                      rows={3}
                      {...register('bio')}
                    />
                  </div>
                  <div className={styles.formActions}>
                    <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" loading={isSubmitting}>
                      <Check size={16} />
                      {editing ? 'Salvar alterações' : 'Criar e definir horários →'}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Lista de profissionais */}
            <div className={styles.list}>
              {professionals.length === 0 && !showForm ? (
                <Card className={styles.empty}>
                  <Users size={36} strokeWidth={1.5} />
                  <p>Nenhum profissional cadastrado ainda.</p>
                  <Button size="sm" onClick={openCreate}>
                    <PlusCircle size={14} /> Adicionar profissional
                  </Button>
                </Card>
              ) : (
                professionals.map((prof) => (
                  <Card
                    key={prof.id}
                    className={`${styles.profCard} ${scheduleProf?.id === prof.id ? styles.profCardActive : ''}`}
                  >
                    <div className={styles.profAvatar}>{prof.name.charAt(0)}</div>
                    <div className={styles.profInfo}>
                      <div className={styles.profName}>{prof.name}</div>
                      {prof.bio && <div className={styles.profBio}>{prof.bio}</div>}
                    </div>
                    <div className={styles.profActions}>
                      <Button
                        size="sm"
                        variant={scheduleProf?.id === prof.id ? 'primary' : 'secondary'}
                        onClick={() => scheduleProf?.id === prof.id ? setScheduleProf(null) : openSchedule(prof)}
                      >
                        {scheduleProf?.id === prof.id ? 'Fechar horários' : 'Horários'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(prof)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => remove(prof.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Painel de horários */}
            {scheduleProf && (
              <Card className={styles.schedulePanel}>
                <div className={styles.scheduleHeader}>
                  <div>
                    <h2 className={styles.scheduleTitle}>Horários — {scheduleProf.name}</h2>
                    <p className={styles.scheduleSubtitle}>
                      Adicione os intervalos de atendimento para cada dia da semana
                    </p>
                  </div>
                  <button className={styles.closeBtn} onClick={() => setScheduleProf(null)}>
                    <X size={18} />
                  </button>
                </div>

                {Object.keys(schedules).length === 0 && (
                  <div className={styles.scheduleEmpty}>
                    Nenhum horário cadastrado ainda. Adicione pelo menos um intervalo abaixo.
                  </div>
                )}

                <div className={styles.scheduleGrid}>
                  {WEEKDAYS.map((day, i) => {
                    const daySchedules = Object.values(schedules).filter((s) => s.weekday === i);
                    return (
                      <div key={i} className={styles.scheduleDay}>
                        <span className={`${styles.weekday} ${daySchedules.length > 0 ? styles.weekdayActive : ''}`}>
                          {day}
                        </span>
                        <div className={styles.dayIntervals}>
                          {daySchedules.map((sched) => (
                            <div key={sched.id} className={styles.intervalRow}>
                              <span className={styles.intervalLabel}>
                                {sched.start_time.slice(0, 5)} – {sched.end_time.slice(0, 5)}
                                {sched.label && ` (${sched.label})`}
                              </span>
                              <button
                                className={styles.removeInterval}
                                onClick={async () => {
                                  await api.delete(`/schedules/${sched.id}?professional_id=${scheduleProf.id}`);
                                  setSchedules((prev) => {
                                    const n = { ...prev };
                                    delete n[sched.id];
                                    return n;
                                  });
                                }}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}

                          <div className={styles.addInterval}>
                            <input type="time" className={styles.timeInput} id={`start-${i}`} />
                            <span className={styles.timeSep}>até</span>
                            <input type="time" className={styles.timeInput} id={`end-${i}`} />
                            <input
                              type="text"
                              className={styles.labelInput}
                              placeholder="ex: manhã"
                              id={`label-${i}`}
                            />
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={async () => {
                                const start = document.getElementById(`start-${i}`).value;
                                const end   = document.getElementById(`end-${i}`).value;
                                const label = document.getElementById(`label-${i}`).value;
                                if (!start || !end) return;
                                const { data } = await api.post('/schedules', {
                                  professional_id: scheduleProf.id,
                                  weekday: i,
                                  start_time: start,
                                  end_time: end,
                                  label,
                                });
                                const newSched = data.schedules[data.schedules.length - 1];
                                setSchedules((prev) => ({ ...prev, [newSched.id]: newSched }));
                                document.getElementById(`start-${i}`).value = '';
                                document.getElementById(`end-${i}`).value   = '';
                                document.getElementById(`label-${i}`).value = '';
                              }}
                            >
                              <Check size={13} /> Adicionar
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}