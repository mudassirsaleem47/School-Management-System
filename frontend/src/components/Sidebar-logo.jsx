import React from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '@/config/api';
import { Link } from 'react-router-dom';
import { School } from 'lucide-react';

const SidebarLogo = () => {
  const { currentUser } = useAuth();
  const [imageError, setImageError] = React.useState(false);

  // Reset error state if logoSrc changes
  React.useEffect(() => {
    setImageError(false);
  }, [currentUser?.schoolLogo]);

  const logoSrc = currentUser?.schoolLogo
    ? (currentUser.schoolLogo.startsWith('http') ? currentUser.schoolLogo : `${API_URL}/${currentUser.schoolLogo}`)
    : null;

  return (
    <div>
      <Link to={`/admin/dashboard`} className="flex items-center gap-2">
        {logoSrc && !imageError ? (
          <img 
            className='w-[93%] h-[40px] object-contain object-left' 
            src={logoSrc} 
            alt="School Logo" 
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center gap-3 w-full">
            <div className="flex h-10 w-10 min-w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <School className="h-6 w-6" />
            </div>
            <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis">Add logo in setting</span>
          </div>
        )}
      </Link>
    </div>
  );
}

export default SidebarLogo;