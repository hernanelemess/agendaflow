import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import api from '../../services/api';
import styles from './BookingPage.module.css';

const links = [
  { to: '/dashboard', icon: Calendar, label: 'Meus agendamentos' },
  { to: '/booking',   icon: Clock,    label: 'Novo agendamento'  },
];

const STEPS = ['Estabelecimento', 'Serviço', 'Profissional & Data', 'Confirmação'];

export default function BookingPage() {
  const navigate = useNavigate();
  const [step, setStep]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const [establishments, setEstablishments] = useState([]);
  const [services,       setServices]       = useState([]);
  const [professionals,  setProfessionals]  = useState([]);
  const [slots,          setSlots]          = useState([]);

  const [selected, setSelected] = useState({
    establishment: null,
    service:       null,
    professional:  null,
    date:          '',
    slot:          '',
    notes:         '',
  });

  useEffect(() => {
    api.get('/establishments').then(({ data }) => setEstablishments(data.rows || []));
  }, []);

  useEffect(() => {
    if (!selected.establishment) return;
    setServices([]);
    api.get(`/services/establishment/${selected.establishment.id}`)
      .then(({ data }) => setServices(data.services || []));
  }, [selected.establishment]);

  useEffect(() => {
    if (!selected.establishment) return;
    setProfessionals([]);
    api.get(`/professionals/establishment/${selected.establishment.id}`)
      .then(({ data }) => setProfessionals(data.professionals || []));
  }, [selected.establishment]);

  useEffect(() => {
    if (!selected.professional || !selected.date || !selected.service) return;
    setSlots([]);
    api.get('/appointments/availability', {
      params: {
        professional_id: selected.professional.id,
        service_id:      selected.service.id,
        date:            selected.date,
      },
    }).then(({ data }) => setSlots(data.slots || []));
  }, [selected.professional, selected.date, selected.service]);

  function pick(key, value) {
    setSelected((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'establishment' ? { service: null, professional: null, date: '', slot: '' } : {}),
      ...(key === 'professional'  ? { slot: '' } : {}),
      ...(key === 'date'          ? { slot: '' } : {}),
    }));
  }

  function canAdvance() {
    if (step === 0) return !!selected.establishment;
    if (step === 1) return !!selected.service;
    if (step === 2) return !!selected.professional && !!selected.date && !!selected.slot;
    return true;
  }

  async function confirm() {
    try {
      setLoading(true);
      setError('');
      const dateTime = `${selected.date}T${selected.slot}:00`;
      await api.post('/appointments', {
        professional_id: selected.professional.id,
        service_id:      selected.service.id,
        starts_at:       dateTime,
        notes:           selected.notes,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar agendamento.');
    } finally {
      setLoading(false);
    }
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className={styles.layout}>
      <Sidebar links={links} />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Novo agendamento</h1>
          <p className={styles.subtitle}>Siga os passos para reservar sua consulta</p>
        </div>

        <div className={styles.stepper}>
          {STEPS.map((label, i) => (
            <div key={i} className={styles.stepItem}>
              <div className={`${styles.stepCircle} ${i < step ? styles.done : ''} ${i === step ? styles.current : ''}`}>
                {i < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span className={`${styles.stepLabel} ${i === step ? styles.currentLabel : ''}`}>{label}</span>
              {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < step ? styles.doneLine : ''}`} />}
            </div>
          ))}
        </div>

        <Card className={styles.card}>
          {error && <div className={styles.alert}>{error}</div>}

          {step === 0 && (
            <div>
              <h2 className={styles.stepTitle}>Escolha o estabelecimento</h2>
              <div className={styles.grid}>
                {establishments.map((est) => (
                  <button
                    key={est.id}
                    className={`${styles.optionCard} ${selected.establishment?.id === est.id ? styles.optionSelected : ''}`}
                    onClick={() => pick('establishment', est)}
                  >
                    <div className={styles.optionIcon}><User size={20} /></div>
                    <div className={styles.optionName}>{est.name}</div>
                    {est.address && <div className={styles.optionSub}>{est.address}</div>}
                  </button>
                ))}
                {establishments.length === 0 && <p className={styles.empty}>Nenhum estabelecimento disponível.</p>}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className={styles.stepTitle}>Escolha o serviço</h2>
              <div className={styles.grid}>
                {services.map((svc) => (
                  <button
                    key={svc.id}
                    className={`${styles.optionCard} ${selected.service?.id === svc.id ? styles.optionSelected : ''}`}
                    onClick={() => pick('service', svc)}
                  >
                    <div className={styles.optionName}>{svc.name}</div>
                    {svc.description && <div className={styles.optionSub}>{svc.description}</div>}
                    <div className={styles.optionMeta}>
                      <span><Clock size={12} /> {svc.duration_min} min</span>
                      <span className={styles.price}>R$ {Number(svc.price).toFixed(2)}</span>
                    </div>
                  </button>
                ))}
                {services.length === 0 && <p className={styles.empty}>Nenhum serviço disponível.</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.step2}>
              <div>
                <h2 className={styles.stepTitle}>Escolha o profissional</h2>
                <div className={styles.profGrid}>
                  {professionals.map((prof) => (
                    <button
                      key={prof.id}
                      className={`${styles.profCard} ${selected.professional?.id === prof.id ? styles.optionSelected : ''}`}
                      onClick={() => pick('professional', prof)}
                    >
                      <div className={styles.profAvatar}>{prof.name.charAt(0)}</div>
                      <div>
                        <div className={styles.profName}>{prof.name}</div>
                        {prof.bio && <div className={styles.profBio}>{prof.bio}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className={styles.stepTitle}>Escolha a data</h2>
                <input
                  type="date"
                  className={styles.dateInput}
                  min={minDateStr}
                  value={selected.date}
                  onChange={(e) => pick('date', e.target.value)}
                />
              </div>

              {selected.professional && selected.date && (
                <div>
                  <h2 className={styles.stepTitle}>Horários disponíveis</h2>
                  {slots.length === 0 ? (
                    <p className={styles.empty}>Nenhum horário disponível nesta data.</p>
                  ) : (
                    <div className={styles.slots}>
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          disabled={!slot.available}
                          className={[
                            styles.slot,
                            selected.slot === slot.time ? styles.slotSelected : '',
                            !slot.available ? styles.slotBusy : '',
                          ].join(' ')}
                          onClick={() => slot.available && pick('slot', slot.time)}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className={styles.notesLabel}>Observações (opcional)</label>
                <textarea
                  className={styles.notes}
                  placeholder="Ex: prefiro atendimento no começo do horário..."
                  value={selected.notes}
                  onChange={(e) => setSelected((p) => ({ ...p, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.confirm}>
              <div className={styles.confirmIcon}><CheckCircle size={40} /></div>
              <h2 className={styles.confirmTitle}>Confirme seu agendamento</h2>
              <div className={styles.summary}>
                {[
                  ['Estabelecimento', selected.establishment?.name],
                  ['Serviço',         selected.service?.name],
                  ['Profissional',    selected.professional?.name],
                  ['Data',            selected.date ? new Date(selected.date + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : ''],
                  ['Horário',         selected.slot],
                  ['Duração',         `${selected.service?.duration_min} min`],
                  ['Valor',           `R$ ${Number(selected.service?.price).toFixed(2)}`],
                ].map(([label, value]) => (
                  <div key={label} className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>{label}</span>
                    <span className={styles.summaryValue}>{value}</span>
                  </div>
                ))}
                {selected.notes && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Observações</span>
                    <span className={styles.summaryValue}>{selected.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={styles.nav}>
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                <ChevronLeft size={16} /> Voltar
              </Button>
            )}
            <div style={{ flex: 1 }} />
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
                Próximo <ChevronRight size={16} />
              </Button>
            ) : (
              <Button onClick={confirm} loading={loading}>
                <CheckCircle size={16} /> Confirmar agendamento
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}