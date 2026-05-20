import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Building2, BarChart3 } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import api from '../../services/api';
import styles from './AdminDashboard.module.css';

const links = [
  { to: '/admin',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Usuários' },
  { to: '/admin/establishments', icon: Building2, label: 'Estabelecimentos' },
];

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [ests,  setEsts]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, u, e] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users?limit=5'),
          api.get('/admin/establishments?limit=5'),
        ]);
        setStats(s.data.stats);
        setUsers(u.data.rows);
        setEsts(e.data.rows);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = stats ? [
    { label: 'Usuários',         value: stats.total_users,          color: 'blue'  },
    { label: 'Estabelecimentos', value: stats.total_establishments,  color: 'green' },
    { label: 'Agendamentos',     value: stats.total_appointments,    color: 'amber' },
    { label: 'Receita total',    value: `R$ ${Number(stats.total_revenue).toFixed(2)}`, color: 'purple' },
  ] : [];

  return (
    <div className={styles.layout}>
      <Sidebar links={links} />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Visão geral do sistema</p>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Carregando...</div>
        ) : (
          <>
            <div className={styles.statsGrid}>
              {statCards.map(({ label, value, color }) => (
                <Card key={label} className={styles.statCard}>
                  <div className={`${styles.statIcon} ${styles[color]}`}>
                    <BarChart3 size={20} />
                  </div>
                  <div className={styles.statValue}>{value}</div>
                  <div className={styles.statLabel}>{label}</div>
                </Card>
              ))}
            </div>

            <div className={styles.tables}>
              <Card>
                <h2 className={styles.tableTitle}>Últimos usuários</h2>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td className={styles.muted}>{u.email}</td>
                        <td><span className={`${styles.badge} ${styles[u.role]}`}>{u.role}</span></td>
                        <td><span className={`${styles.badge} ${u.active ? styles.active : styles.inactive}`}>{u.active ? 'Ativo' : 'Inativo'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <Card>
                <h2 className={styles.tableTitle}>Últimos estabelecimentos</h2>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nome</th><th>Dono</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ests.map((e) => (
                      <tr key={e.id}>
                        <td>{e.name}</td>
                        <td className={styles.muted}>{e.owner_name}</td>
                        <td><span className={`${styles.badge} ${e.active ? styles.active : styles.inactive}`}>{e.active ? 'Ativo' : 'Inativo'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}