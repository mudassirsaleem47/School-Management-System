import React from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '@/config/api';
import { Link } from 'react-router-dom';
import { School } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

const SidebarLogo = () => {
  const { currentUser } = useAuth();
  const { state } = useSidebar ? useSidebar() : { state: 'expanded' };
  const [logoError, setLogoError] = React.useState(false);
  const [faviconError, setFaviconError] = React.useState(false);

  // Reset error states if sources change
  React.useEffect(() => {
    setLogoError(false);
  }, [currentUser?.schoolLogo]);

  React.useEffect(() => {
    setFaviconError(false);
  }, [currentUser?.favicon]);

  const logoSrc = currentUser?.schoolLogo
    ? (currentUser.schoolLogo.startsWith('http') ? currentUser.schoolLogo : `${API_URL}/${currentUser.schoolLogo}`)
    : null;

  const faviconSrc = currentUser?.favicon
    ? (currentUser.favicon.startsWith('http') ? currentUser.favicon : `${API_URL}/${currentUser.favicon}`)
    : null;

  const isCollapsed = state === "collapsed";

  return (
    <div>
      <Link to={`/admin/dashboard`} className="flex items-center gap-2">
        {isCollapsed ? (
          faviconSrc && !faviconError ? (
            <img 
              className='w-8 h-8 object-contain mx-auto' 
              src={faviconSrc} 
              alt="Favicon" 
              onError={() => setFaviconError(true)}
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary mx-auto">
              <School className="h-5 w-5" />
            </div>
          )
        ) : (
          logoSrc && !logoError ? (
            <img 
              className='w-[93%] h-[40px] object-contain object-left' 
              src={logoSrc} 
              alt="School Logo" 
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="flex items-center gap-3 w-full">
              <div className="flex h-10 w-10 min-w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <School className="h-6 w-6" />
              </div>
              <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis">Add logo in setting</span>
            </div>
          )
        )}
      </Link>
    </div>
  );
}

export default SidebarLogo;