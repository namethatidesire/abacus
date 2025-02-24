import Link from 'next/link';
import './style.css';

const Navbar = () => {
  return (
    <nav class='navbar'>
      <ul>
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link href="/calendar">Calendar</Link>
        </li>
        <li>
          <Link href="/coursePage">Courses</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;