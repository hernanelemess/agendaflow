import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Sidebar.module.css';
import { LogOut, Stethoscope } from 'lucide-react';

export default function Sidebar({ links }) {
  const { user, logout } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}><Stethoscope size={20} /></div>
        <div>
          <div className={styles.logoName}>MedFlow</div>
          <div className={styles.logoSub}>Clínica Médica</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [styles.link, isActive ? styles.active : ''].join(' ')
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className={styles.userName}>{user?.name}</div>
            <div className={styles.userRole}>{user?.role}</div>
          </div>
        </div>
        <button className={styles.logout} onClick={logout}>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}