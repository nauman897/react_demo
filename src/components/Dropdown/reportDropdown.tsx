import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { MarkdownDropdownProps, Template } from '../Interfaces';


// Has no use in the current version , retained only if needed in future
const TemplatesDropdown: React.FC<MarkdownDropdownProps> = ({ onSelect, selectedTemplate, templates, fetchTemplates }) => {
  const handleSelect = (eventKey: string | null) => {
    if (eventKey) {
      const selectTemplate = JSON.parse(eventKey) as Template;
      onSelect(selectTemplate);
    } else {
      onSelect(null);
    }
  };

  return (
    <DropdownButton
      id="dropdown-basic-button"
      title={selectedTemplate ? selectedTemplate : "Select template"}
      variant="primary"
      onSelect={handleSelect}
    >
      <div className='dropdown-list'>
        {templates.map((template) => (
          <Dropdown.Item
            eventKey={JSON.stringify({ id: template.id, title: template.title })}
            key={template.id}
            style={{ marginLeft: 0 }}
          >
            {template.title}
          </Dropdown.Item>
          ))}
      </div>
    </DropdownButton>
  );
};

export default TemplatesDropdown;
