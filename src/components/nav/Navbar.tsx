import useBoolean from '../../hooks/useBoolean';
import CustomNavLink from './CustomNavLink';
import styles from './Navbar.module.css';
import HamburgerButton from './HamburgerButton';

interface PropTypes {
  drawerDelay?: number;
}

const Navbar = ({ drawerDelay = 250 }: PropTypes) => {
  const { value: isHamburgerOpen, toggle, setFalse } = useBoolean(false);

  // Adds a short delay before closing the navbar
  async function closeHamburgerDrawer() {
    if (isHamburgerOpen) {
      setTimeout(() => {
        setFalse();
      }, drawerDelay);
    }
  }

  return (
    <nav>
      <HamburgerButton className={styles.hamburger} isOpen={isHamburgerOpen} onToggle={toggle} />
      <ul>
        <CustomNavLink to="/" label="Home" onClick={closeHamburgerDrawer} />
        <CustomNavLink to="/portfolio" label="Portfolio" onClick={closeHamburgerDrawer} />
        <CustomNavLink to="/about" label="About" onClick={closeHamburgerDrawer} />
        <CustomNavLink to="/about#contact" label="Contact" onClick={closeHamburgerDrawer} />
        <CustomNavLink to="/blog" label="Blog" onClick={closeHamburgerDrawer} />
      </ul>
      <div className={styles.shadow} />
    </nav>
  );
}

export default Navbar;