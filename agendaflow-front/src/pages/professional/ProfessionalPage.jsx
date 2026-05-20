import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import api from '../../services/api';
import styles from './ProfessionalPage.module.css';
import { ownerLinks } from './ownerLinks';

const statusConfig = {
  pending:   { label: 'Pendente',   color: 'warning' },
  confirmed: { label: 'Confirmado', color: 'info'    },
  completed: { label: 'Concluído',  color: 'success' },
  cancelled: { label: 'Cancelado',  color: 'danger'  },
};

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export default function ProfessionalPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [professionals, setProfessionals] = useState([]);
  const [selectedProf, setSelectedProf]  = useState(null);
  const [appointments, setAppointments]  = useState([]);
  const [establishment, setEstablishment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/establishments/me/list');
        const est = data.establishments?.[0];
        if (!est) return;
        setEstablishment(est);
        const { data: profData } = await api.get(`/professionals/establishment/${est.id}`);
        const profs = profData.professionals || [];
        setProfessionals(profs);
        if (profs.length > 0) setSelectedProf(profs[0]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedProf) return;
    setAppointments([]);
    api.get(`/appointments/professional/${selectedProf.id}?limit=50`)
      .then(({ data }) => {
        const dateStr = formatDate(currentDate);
        const filtered = (data.appointments || []).filter((a) =>
          a.starts_at?.startsWith(dateStr)
        );
        setAppointments(filtered);
      });
  }, [selectedProf, currentDate]);

  async function changeStatus(id, status) {
    await api.patch(`/appointments/${id}/status`, { status });
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  }

  const dateLabel = currentDate.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const isToday = formatDate(currentDate) === formatDate(new Date());

  const total     = appointments.length;
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;
  const revenue   = appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + Number(a.price || 0), 0);

  return (
    <div className={styles.layout}>
      <Sidebar links={ownerLinks} />
      <main className={styles.main}>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {establishment?.name || 'Agenda'}
            </h1>
            <p className={styles.subtitle} style={{ textTransform: 'capitalize' }}>
              {dateLabel}
              {isToday && <span className={styles.todayBadge}>Hoje</span>}
            </p>
          </div>
          <div className={styles.dateNav}>
            <button className={styles.navBtn} onClick={() => setCurrentDate((d) => addDays(d, -1))}>
              <ChevronLeft size={18} />
            </button>
            <button
              className={styles.navBtn}
              onClick={() => setCurrentDate(new Date())}
              style={{ fontSize: 12, padding: '0 12px', color: isToday ? 'var(--green-700)' : 'var(--gray-600)' }}
            >
              Hoje
            </button>
            <button className={styles.navBtn} onClick={() => setCurrentDate((d) => addDays(d, 1))}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Carregando...</div>
        ) : (
          <>
            <div className={styles.metrics}>
              {[
                { label: 'Agendamentos', value: total,      color: 'blue'   },
                { label: 'Confirmados',  value: confirmed,  color: 'green'  },
                { label: 'Concluídos',   value: completed,  color: 'purple' },
                { label: 'Receita',      value: `R$ ${revenue.toFixed(2)}`, color: 'amber' },
              ].map(({ label, value, color }) => (
                <Card key={label} className={`${styles.metric} ${styles[color]}`}>
                  <div className={styles.metricValue}>{value}</div>
                  <div className={styles.metricLabel}>{label}</div>
                </Card>
              ))}
            </div>

            <div className={styles.content}>
              {professionals.length > 1 && (
                <div className={styles.profList}>
                  <h3 className={styles.profListTitle}>Profissionais</h3>
                  {professionals.map((prof) => (
                    <button
                      key={prof.id}
                      className={`${styles.profItem} ${selectedProf?.id === prof.id ? styles.profActive : ''}`}
                      onClick={() => setSelectedProf(prof)}
                    >
                      <div className={styles.profAvatar}>{prof.name.charAt(0)}</div>
                      <span className={styles.profName}>{prof.name}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className={styles.agenda}>
                {appointments.length === 0 ? (
                  <Card className={styles.empty}>
                    <Calendar size={36} strokeWidth={1.5} />
                    <p>Nenhum agendamento para este dia.</p>
                  </Card>
                ) : (
                  appointments
                    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
                    .map((apt) => {
                      const cfg     = statusConfig[apt.status] || statusConfig.pending;
                      const time    = new Date(apt.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                      const timeEnd = new Date(apt.ends_at).toLocaleTimeString('pt-BR',   { hour: '2-digit', minute: '2-digit' });
                      return (
                        <Card key={apt.id} className={styles.aptCard}>
                          <div className={styles.aptTime}>
                            <div className={styles.aptTimeStart}>{time}</div>
                            <div className={styles.aptTimeLine} />
                            <div className={styles.aptTimeEnd}>{timeEnd}</div>
                          </div>
                          <div className={styles.aptBody}>
                            <div className={styles.aptService}>{apt.service_name}</div>
                            <div className={styles.aptClient}>
                              <Users size={12} /> {apt.client_name}
                            </div>
                            <div className={styles.aptMeta}>
                              <Clock size={12} /> {apt.duration_min} min
                              {apt.price && (
                                <span className={styles.aptPrice}>R$ {Number(apt.price).toFixed(2)}</span>
                              )}
                            </div>
                            {apt.notes && (
                              <div className={styles.aptNotes}>"{apt.notes}"</div>
                            )}
                          </div>
                          <div className={styles.aptActions}>
                            <span className={`${styles.badge} ${styles[cfg.color]}`}>
                              {cfg.label}
                            </span>
                            <div className={styles.actions}>
                              {apt.status === 'pending' && (
                                <Button size="sm" onClick={() => changeStatus(apt.id, 'confirmed')}>
                                  <CheckCircle size={13} /> Confirmar
                                </Button>
                              )}
                              {apt.status === 'confirmed' && (
                                <Button size="sm" onClick={() => changeStatus(apt.id, 'completed')}>
                                  <CheckCircle size={13} /> Concluir
                                </Button>
                              )}
                              {(apt.status === 'pending' || apt.status === 'confirmed') && (
                                <Button size="sm" variant="danger" onClick={() => changeStatus(apt.id, 'cancelled')}>
                                  <XCircle size={13} /> Cancelar
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}