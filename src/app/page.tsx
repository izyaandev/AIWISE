import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import styles from './landing.module.css';

export default async function LandingPage() {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Empowering the Next Generation of AI Leaders
          </h1>
          <p className={styles.heroSubtitle}>
            The premier AI learning platform for GEMS Our Own High School, Al Warqa'a. Master artificial intelligence with ethics, safety, and rigor.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/student-login" style={{ width: '100%', maxWidth: '250px' }}>
              <Button variant="primary" size="lg" style={{ width: '100%', padding: '16px', fontSize: '1.2rem' }}>
                Start Learning Now
              </Button>
            </Link>
            <Link href="#courses" style={{ width: '100%', maxWidth: '250px' }}>
              <Button variant="secondary" size="lg" style={{ width: '100%', padding: '16px', fontSize: '1.2rem', backgroundColor: 'white', color: 'var(--color-ink)', border: '1px solid var(--color-hairline-strong)' }}>
                Explore Curriculum
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Why Learn With Us?</h2>
        <div className={styles.grid3}>
          <div className={styles.featureCard}>
            <div className={styles.featureNumber}>01</div>
            <h3 className={styles.featureTitle}>Cutting-Edge AI</h3>
            <p className={styles.featureText}>
              Master the fundamentals of Artificial Intelligence, from advanced prompt engineering to understanding large language models and neural networks.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureNumber}>02</div>
            <h3 className={styles.featureTitle}>Ethics & Safety</h3>
            <p className={styles.featureText}>
              Learn how to build, align, and deploy AI responsibly. We strongly emphasize AI safety, biases, and ethical guidelines in every module.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureNumber}>03</div>
            <h3 className={styles.featureTitle}>Verifiable Certificates</h3>
            <p className={styles.featureText}>
              Earn official, uniquely verifiable certificates generated instantly upon course completion to showcase your expertise and commitment.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <img 
            src="/new_logo.png" 
            onError={(e) => { (e.target as HTMLImageElement).src = "/al_warqaa_logo.png"; }}
            alt="OOW Al Warqa'a" 
            width={200} 
            height={200} 
            style={{ opacity: 0.9, objectFit: 'contain' }} 
          />
          <p className={styles.featureText} style={{ fontSize: '0.9rem', color: 'var(--color-slate)' }}>
            © {new Date().getFullYear()} AIWISE - GEMS Our Own High School, Al Warqa'a. All rights reserved.
          </p>
          <p className={styles.featureText} style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '8px' }}>
            made by mohammed izyaan
          </p>
        </div>
      </footer>
    </div>
  );
}
