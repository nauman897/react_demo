import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ReleaseModalProps {
    showReleaseModal: boolean;
    setShowReleaseModal : (key : boolean) => void
    handleCloseReleaseModal: () => void;
    handleRelease: () => void;
    template_title : string | undefined;
}

// const ReleaseModal: React.FC<ReleaseModalProps> = ({ showReleaseModal, setShowReleaseModal, handleRelease, template_title }) => {
//     return (
//         <Modal show={showReleaseModal} onHide={() => setShowReleaseModal(key)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Release</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           Are you sure you want to publish the template <strong>{templateToRelease?.title}</strong>?
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowReleaseModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={handleReleaseTemplate}>
//             Publish
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     );
// };

// export default ReleaseModal;
