import Link from 'next/link';
import './style.css';

const Navbar = () => {
  return (
    <nav className='navbar'>
      <ul>
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link href="/calendar">Calendar</Link>
        </li>
        <li>
          <Link href="/login">Sign Out</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;