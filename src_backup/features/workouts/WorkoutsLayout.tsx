import { Outlet, useLocation, useParams } from 'react-router-dom';

export default function WorkoutsLayout() {
  const location = useLocation();
  const params = useParams();
  
  // Debug logging temporarily
  console.log('[WorkoutsLayout] Route:', { pathname: location.pathname, params });

  return <Outlet />;
}