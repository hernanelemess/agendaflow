import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';

const testimonials = [
  {
    name: 'Dra. Fernanda Rocha',
    role: 'Clínica de Dermatologia — Porto Alegre, RS',
    avatar: 'F',
    text: 'Antes perdíamos em média 8 consultas por semana por faltas sem aviso. Com o MedFlow, esse número caiu para menos de 1. A agenda digitalizada transformou completamente nossa operação.',
  },
  {
    name: 'Dr. Marcelo Santana',
    role: 'Clínica Ortopédica — Caxias do Sul, RS',
    avatar: 'M',
    text: 'A visibilidade que tenho hoje da agenda dos meus médicos é incrível. Consigo ver em tempo real quem está atendendo, o tempo de cada consulta e a receita do dia. Isso era impensável antes.',
  },
  {
    name: 'Dra. Camila Torres',
    role: 'Clínica de Pediatria — Gramado, RS',
    avatar: 'C',
    text: 'Meus pacientes adoram poder escolher o horário online. A taxa de satisfação subiu muito e a recepcionista parou de ficar no telefone o dia inteiro. Vale cada centavo.',
  },
  {
    name: 'Dr. Rafael Mendes',
    role: 'Centro Médico — Florianópolis, SC',
    avatar: 'R',
    text: 'Implantamos o MedFlow em 3 clínicas diferentes. A padronização do atendimento e a facilidade de gerenciar múltiplas equipes num só lugar foi o que me convenceu definitivamente.',
  },
  {
    name: 'Dra. Patrícia Alves',
    role: 'Clínica de Cardiologia — Curitiba, PR',
    avatar: 'P',
    text: 'O que mais me surpreendeu foi a simplicidade. Em menos de uma hora estávamos operando normalmente com o novo sistema. Sem treinamentos longos, sem complicações.',
  },
  {
    name: 'Dr. Bruno Carvalho',
    role: 'Clínica Geral — Belo Horizonte, MG',
    avatar: 'B',
    text: 'Reduzi em 40% o tempo que minha equipe administrativa passava gerenciando agendas manualmente. Agora focamos no que realmente importa: o cuidado com o paciente.',
  },
];

const features = [
  {
    icon: '📅',
    title: 'Agenda inteligente',
    desc: 'Visualize todos os atendimentos do dia em tempo real. Navegue entre datas, profissionais e status com um clique.',
  },
  {
    icon: '⏱️',
    title: 'Sem conflitos de horário',
    desc: 'O sistema detecta automaticamente sobreposições e bloqueia horários já ocupados antes mesmo do cliente tentar agendar.',
  },
  {
    icon: '👥',
    title: 'Múltiplos profissionais',
    desc: 'Gerencie toda a equipe num só lugar. Cada profissional tem sua própria grade de horários, serviços e disponibilidade.',
  },
  {
    icon: '📊',
    title: 'Métricas em tempo real',
    desc: 'Acompanhe agendamentos confirmados, concluídos e receita do dia no painel administrativo.',
  },
  {
    icon: '🔒',
    title: 'Acesso por perfil',
    desc: 'Cada usuário acessa apenas o que precisa. Administrador, dono de clínica e paciente têm experiências distintas e seguras.',
  },
  {
    icon: '📱',
    title: 'Agendamento online',
    desc: 'O paciente escolhe o profissional, o serviço, a data e o horário disponível — tudo sem precisar ligar para a clínica.',
  },
];

const stats = [
  { value: '98%', label: 'de satisfação dos pacientes' },
  { value: '40%', label: 'menos trabalho administrativo' },
  { value: '8x',  label: 'redução de faltas sem aviso'  },
  { value: '5min',label: 'para configurar sua clínica'  },
];

export default function LandingPage() {
  const navigate    = useNavigate();
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    document.querySelectorAll(`.${styles.reveal}`).forEach((el) => {
      observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className={styles.page}>

      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2v16M2 10h16M6 6l8 8M14 6l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className={styles.logoText}>MedFlow</span>
          </div>
          <div className={styles.navActions}>
            <button className={styles.navLogin}    onClick={() => navigate('/login')}>Entrar</button>
            <button className={styles.navRegister} onClick={() => navigate('/register')}>Começar grátis</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
          <div className={styles.heroGrid} />
        </div>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Gestão médica moderna
          </div>
          <h1 className={styles.heroTitle}>
            Sua clínica organizada.<br />
            <span className={styles.heroAccent}>Seus pacientes satisfeitos.</span>
          </h1>
          <p className={styles.heroSub}>
            O MedFlow centraliza toda a gestão de agendamentos da sua clínica numa plataforma
            simples, inteligente e acessível de qualquer lugar.
          </p>
          <div className={styles.heroButtons}>
            <button className={styles.heroCta}      onClick={() => navigate('/register')}>
              Criar conta gratuita
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className={styles.heroSecondary} onClick={() => navigate('/login')}>
              Já tenho conta
            </button>
          </div>
          <div className={styles.heroStats}>
            {stats.map(({ value, label }) => (
              <div key={label} className={styles.heroStat}>
                <div className={styles.heroStatValue}>{value}</div>
                <div className={styles.heroStatLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features}>
        <div className={styles.sectionInner}>
          <div className={`${styles.sectionHeader} ${styles.reveal}`}>
            <span className={styles.sectionTag}>Funcionalidades</span>
            <h2 className={styles.sectionTitle}>Tudo que sua clínica precisa</h2>
            <p className={styles.sectionSub}>
              Do agendamento online ao painel administrativo completo — numa única plataforma.
            </p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`${styles.featureCard} ${styles.reveal}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionInner}>
          <div className={`${styles.sectionHeader} ${styles.reveal}`}>
            <span className={styles.sectionTag}>Como funciona</span>
            <h2 className={styles.sectionTitle}>Configurado em minutos</h2>
          </div>
          <div className={styles.steps}>
            {[
              { n: '01', title: 'Crie sua conta',         desc: 'Cadastre sua clínica em menos de 5 minutos. Sem cartão de crédito.' },
              { n: '02', title: 'Adicione sua equipe',     desc: 'Cadastre os profissionais, defina os horários e os serviços de cada um.' },
              { n: '03', title: 'Receba agendamentos',     desc: 'Seus pacientes agendam online e você acompanha tudo no painel em tempo real.' },
            ].map((s, i) => (
              <div key={s.n} className={`${styles.step} ${styles.reveal}`} style={{ transitionDelay: `${i * 120}ms` }}>
                <div className={styles.stepNumber}>{s.n}</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
                {i < 2 && <div className={styles.stepArrow}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={styles.testimonials}>
        <div className={styles.sectionInner}>
          <div className={`${styles.sectionHeader} ${styles.reveal}`}>
            <span className={styles.sectionTag}>Depoimentos</span>
            <h2 className={styles.sectionTitle}>Quem usa, aprova</h2>
            <p className={styles.sectionSub}>
              Clínicas de todo o Brasil já transformaram sua gestão com o MedFlow.
            </p>
          </div>
          <div className={styles.testimonialsGrid}>
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`${styles.testimonialCard} ${styles.reveal}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className={styles.testimonialQuote}>"</div>
                <p className={styles.testimonialText}>{t.text}</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{t.avatar}</div>
                  <div>
                    <div className={styles.testimonialName}>{t.name}</div>
                    <div className={styles.testimonialRole}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <div className={`${styles.ctaContent} ${styles.reveal}`}>
            <h2 className={styles.ctaTitle}>Pronto para transformar sua clínica?</h2>
            <p className={styles.ctaSub}>
              Junte-se a centenas de clínicas que já simplificaram sua gestão com o MedFlow.
            </p>
            <div className={styles.ctaButtons}>
              <button className={styles.heroCta}       onClick={() => navigate('/register')}>
                Criar conta gratuita
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className={styles.ctaLogin} onClick={() => navigate('/login')}>
                Já tenho uma conta
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 2v16M2 10h16M6 6l8 8M14 6l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className={styles.logoText}>MedFlow</span>
          </div>
          <p className={styles.footerText}>© 2025 MedFlow. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
}