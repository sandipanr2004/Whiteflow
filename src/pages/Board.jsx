import { useLocation, useParams } from 'react-router-dom';
import { Whiteboard } from '../components/Whiteboard';
import { PageLoader } from '../components/PageLoader';

export const Board = () => {
  const location = useLocation();
  const { roomId } = useParams();
  
  const projectId = roomId || location.state?.projectId || 'default-board';
  const projectName = location.state?.projectName || (roomId ? `Room ${roomId}` : 'Untitled Board');
  
  return (
    <div className="flex-1 w-full h-screen relative flex flex-col">
      {location.state?.showLoader && <PageLoader />}
      <Whiteboard persistenceKey={projectId} projectName={projectName} />
    </div>
  );
};
