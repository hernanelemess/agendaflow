import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import styles from './ClientDashboard.module.css';

const links = [
  { to: '/dashboard', icon: Calendar,    label: 'Meus agendamentos' },
  { to: '/booking',   icon: CalendarPlus, label: 'Novo agendamento'  },
];

const statusConfig = {
  pending:   { label: 'Pendente',   icon: AlertCircle,  color: 'warning'  },
  confirmed: { label: 'Confirmado', icon: CheckCircle,  color: 'success'  },
  cancelled: { label: 'Cancelado',  icon: XCircle,      color: 'danger'   },
  completed: { label: 'Concluído',  icon: CheckCircle,  color: 'neutral'  },
};

export default function ClientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments/me')
      .then(({ data }) => setAppointments(data.appointments))
      .finally(() => setLoading(false));
  }, []);

  async function cancel(id) {
    if (!confirm('Cancelar este agendamento?')) return;
    await api.patch(`/appointments/${id}/status`, { status: 'cancelled' });
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar links={links} />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Olá, {user?.name?.split(' ')[0]}</h1>
            <p className={styles.subtitle}>Veja e gerencie seus agendamentos</p>
          </div>
          <Link to="/booking">
            <Button>
              <CalendarPlus size={16} />
              Novo agendamento
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className={styles.loading}>Carregando...</div>
        ) : appointments.length === 0 ? (
          <Card className={styles.empty}>
            <Calendar size={40} strokeWidth={1.5} />
            <p>Você ainda não tem agendamentos.</p>
            <Link to="/booking"><Button size="sm">Agendar agora</Button></Link>
          </Card>
        ) : (
          <div className={styles.list}>
            {appointments.map((apt) => {
              const cfg    = statusConfig[apt.status] || statusConfig.pending;
              const StatusIcon = cfg.icon;
              const date   = new Date(apt.starts_at);
              return (
                <Card key={apt.id} className={styles.card}>
                  <div className={styles.cardLeft}>
                    <div className={styles.dateBox}>
                      <div className={styles.dateDay}>{date.getDate()}</div>
                      <div className={styles.dateMon}>{date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}</div>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.service}>{apt.service_name}</div>
                    <div className={styles.professional}>com {apt.professional_name}</div>
                    <div className={styles.time}>
                      <Clock size={13} />
                      {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      {' · '}{apt.duration_min} min
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <span className={`${styles.badge} ${styles[cfg.color]}`}>
                      <StatusIcon size={12} />
                      {cfg.label}
                    </span>
                    {apt.status === 'pending' || apt.status === 'confirmed' ? (
                      <button className={styles.cancelBtn} onClick={() => cancel(apt.id)}>
                        Cancelar
                      </button>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}