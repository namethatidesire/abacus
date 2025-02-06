import Link from 'next/link';
import styles from './style.css';

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <ul>
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link href="/calendar">Calendar</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;