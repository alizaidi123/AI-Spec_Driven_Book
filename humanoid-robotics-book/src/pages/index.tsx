import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const CHAPTERS = [
  {
    number: 1,
    title: 'Introduction to Physical AI and Humanoid Robotics',
    description: 'Historical context and core concepts of physical AI and embodiment.',
    docId: 'introduction',
  },
  {
    number: 2,
    title: 'Embodiment and Mechanical Design',
    description: 'Principles of humanoid mechanical design and structural considerations.',
    docId: 'embodiment',
  },
  {
    number: 3,
    title: 'Sensing and Actuation Systems',
    description: 'Types of sensors, actuators, and integration with control systems.',
    docId: 'sensing-and-actuation',
  },
  {
    number: 4,
    title: 'Locomotion and Balance Control',
    description: 'Bipedal locomotion principles and balance stability control.',
    docId: 'locomotion-and-balance',
  },
  {
    number: 5,
    title: 'Manipulation and Hand Control',
    description: 'Kinematics, grasp planning, and multi-fingered hand control.',
    docId: 'manipulation-and-hands',
  },
  {
    number: 6,
    title: 'Control Architectures for Humanoid Robots',
    description: 'Classical and modern control architectures for humanoid robots.',
    docId: 'control-architectures',
  },
  {
    number: 7,
    title: 'Perception and State Estimation',
    description: 'Perception pipelines, 3D understanding, and state estimation.',
    docId: 'perception-and-state-estimation',
  },
  {
    number: 8,
    title: 'Learning for Physical AI',
    description: 'Learning, adaptation, and reinforcement learning for embodied agents.',
    docId: 'learning-for-physical-ai',
  },
  {
    number: 9,
    title: 'Safety and Ethics in Humanoid Robotics',
    description: 'Safety-by-design, risk analysis, and ethical considerations.',
    docId: 'safety-and-ethics',
  },
  {
    number: 10,
    title: 'Deployment and Tooling for Humanoid Robotics',
    description: 'Simulation, tooling, and real-world deployment workflows.',
    docId: 'deployment-and-tooling',
  },
];

function HomepageHeader() {
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <p className={styles.heroKicker}>Spec-driven technical book</p>
        <h1 className={styles.heroTitle}>Physical AI & Humanoid Robotics</h1>
        <p className={styles.heroSubtitle}>
          A comprehensive guide to embodied artificial intelligence and humanoid robot systems.
        </p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/introduction">
            Start Reading
          </Link>
          <Link className="button button--outline button--lg" to="/docs">
            View Outline
          </Link>
        </div>
      </div>
    </header>
  );
}

function ChapterCard({ chapter }) {
  return (
    <article className={styles.chapterCard}>
      <div className={styles.chapterInner}>
        <div className={styles.chapterMeta}>
          <span className={styles.chapterNumber}>Chapter {chapter.number}</span>
        </div>
        <h3 className={styles.chapterTitle}>{chapter.title}</h3>
        <p className={styles.chapterDescription}>{chapter.description}</p>
      </div>
      <div className={styles.chapterActions}>
        <Link className={styles.chapterLink} to={`/docs/${chapter.docId}`}>
          Read Chapter
        </Link>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <Layout
      title="Physical AI & Humanoid Robotics"
      description="A comprehensive guide to embodied artificial intelligence and humanoid robot systems."
    >
      <HomepageHeader />
      <main>
        <section className={styles.chaptersSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Book Chapters</h2>
              <p className={styles.sectionSubtitle}>
                The book progresses from foundational principles to full humanoid deployment workflows.
              </p>
            </div>
            <div className={styles.sectionDivider} />
            <div className={styles.chaptersGrid}>
              {CHAPTERS.map((chapter) => (
                <ChapterCard key={chapter.number} chapter={chapter} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
