import React from 'react';
import { Form } from 'react-bootstrap';
import { PromptCheckboxProps } from '../Interfaces';

// Checkbox to select-deselect prompts on /process-channel

const PromptCheckbox: React.FC<PromptCheckboxProps> = ({ prompt, prompt_id, checked, onSelectDeselectPrompt }) => {
  return (
    <Form.Check
      type="checkbox"
      label={prompt}
      checked={checked}
      onChange={() => onSelectDeselectPrompt(prompt_id)}
    />
  );
};

export default PromptCheckbox;
