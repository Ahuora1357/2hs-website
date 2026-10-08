import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import MobileNav from './MobileNav.jsx';
import { loadJSON, saveJSON } from '../../lib/id.js';

const COLLAPSE_KEY = '2hs.ui.sidebar';

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(() => Boolean(loadJSON(COLLAPSE_KEY, false)));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      saveJSON(COLLAPSE_KEY, !prev);
      return !prev;
    });
  };

  return (
    <div className={`shell ${collapsed ? 'is-collapsed' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {drawerOpen ? (
        <div className="scrim" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      ) : null}

      <div className="main">
        <Topbar onOpenMenu={() => setDrawerOpen(true)} />
        <main className="content">
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
