import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { DeleteModalProps } from '../Interfaces';

/*
  Modal Launched when user clicks on delete a template
  Provides option to delete the template from channel as well by using deleteFromChannels which is passed to handler on main.tsx
*/

const DeleteModal: React.FC<DeleteModalProps> = ({
  showDeleteModal,
  handleCloseDeleteModal,
  handleDelete,
  template_title,
}) => {
  const [deleteFromChannels, setDeleteFromChannels] = useState(false);

  const handleCheckboxChange = () => {
    setDeleteFromChannels(!deleteFromChannels);
  };

  return (
    <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete the template <strong>{template_title}</strong>?
        <Form.Check
          type="checkbox"
          label="Delete from channels as well"
          checked={deleteFromChannels}
          onChange={handleCheckboxChange}
          className="mt-3"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseDeleteModal}>
          Cancel
        </Button>
        <Button variant="danger" onClick={() => handleDelete(deleteFromChannels)}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteModal;
