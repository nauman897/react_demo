import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Accordion, Toast } from 'react-bootstrap';
import { listAllPrompts, updatePrompt, addPrompt, deletePrompt } from '../../api/prompts';
import { toast } from 'react-toastify';
import Loader from '../../components/spinner';
import { TrackResponse } from '../../api/posthogAPIMonitoring';
import './index.css';

interface Prompt {
  type: string;
  id: string;
  title: string;
  prompt: string;
}

const L1Prompts: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompts, setSelectedPrompts] = useState<{ [key: string]: boolean }>({});
  const [customPromptName, setCustomPromptName] = useState<string>('');
  const [customPromptValue, setCustomPromptValue] = useState<string>('');
  const [editValue, setEditValue] = useState<{ [key: string]: string }>({});
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsSubmitting(true);
        const response = await listAllPrompts();
        
        TrackResponse(response, `get/prompts`, undefined);
        const data: Prompt[] = response.data.prompts;
        console.log("response prompts:", data);
        setPrompts(data);
        
        const initialSelectedPrompts: { [key: string]: boolean } = {};
        const initialEditValues: { [key: string]: string } = {};
        
        data.forEach(prompt => {
          initialSelectedPrompts[prompt.id] = true;
          initialEditValues[prompt.id] = prompt.prompt;
        });
        
        setSelectedPrompts(initialSelectedPrompts);
        setEditValue(initialEditValues);

      } catch (error: any) {
        console.error('Error fetching prompts from API', error);
      } finally {
        setIsSubmitting(false);
      }
    };
    fetchData();
  }, []);

  const putPrompts = async (updatedPrompts: Prompt[]) => {
    try {
      setIsSubmitting(true);

      for (const prompt of updatedPrompts) {
        const id = prompt.id;
        const requestData = {
          prompt: prompt.prompt,
          title: prompt.title,
          type: prompt.type,
        };
        console.log("Putting prompt to API:", requestData);

        const response = await updatePrompt(id, requestData);

        TrackResponse(response, `post/prompts/${prompt.id}`, requestData);
        
        console.log("Response from API:", response.data);
      }

      setShowToast(true);

    } catch (error: any) {
      console.error("Error putting prompts to API", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const postPrompts = async (newPrompt: Prompt) => {
    try {
        setIsSubmitting(true);
        console.log("Putting prompt to API:", newPrompt);
        const response = await addPrompt(newPrompt);
        TrackResponse(response, `post/prompts/`, newPrompt);
        console.log("Response from API:", response.data);
      
      setShowToast(true);

    } catch (error: any) {
      console.error("Error putting prompts to API", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCustomPrompt = async () => {
    if (customPromptName && customPromptValue) {
      const newPrompt: Prompt = { type: "L1", id: customPromptName, title: customPromptName, prompt: customPromptValue };
      const updatedPrompts = [...prompts, newPrompt];
      setPrompts(updatedPrompts);
      setSelectedPrompts({ ...selectedPrompts, [customPromptName]: true });
      setCustomPromptName('');
      setCustomPromptValue('');
      setEditValue({ ...editValue, [newPrompt.id]: customPromptValue });
      await postPrompts(newPrompt); 
    }
  };

  const handleSave = (id: string) => {
    const updatedPrompts = prompts.map((prompt) => 
      prompt.id === id ? { ...prompt, prompt: editValue[id] as string } : prompt
    );
    setPrompts(updatedPrompts);
    putPrompts(updatedPrompts); // Post updated prompts to backend
    toast.success(`${updatedPrompts.find(p => p.id === id)?.title} updated successfully`);
  };

  const handleRemove = async (id: string) => {
    const updatedPrompts = prompts.filter(prompt => prompt.id !== id);
    const updatedSelectedPrompts = { ...selectedPrompts };
    delete updatedSelectedPrompts[id];
    const updatedEditValue = { ...editValue };
    delete updatedEditValue[id];
    setPrompts(updatedPrompts);
    setSelectedPrompts(updatedSelectedPrompts);
    setEditValue(updatedEditValue);
    
    await deletePrompt(id);
  };

  const handleEditChange = (id: string, value: string) => {
    setEditValue({ ...editValue, [id]: value });
  };

  return (
    <Container>
      <h1>Video Analysis Prompts</h1>
      <Accordion alwaysOpen>
        {prompts.map((prompt) => (
          <Accordion.Item eventKey={prompt.id} key={prompt.id}>
            <Accordion.Header>{prompt.title}</Accordion.Header>
            <Accordion.Body>
              <Row>
                <Form.Control
                  className='existing-prompts-form-control'
                  as="textarea"
                  rows={4}
                  value={editValue[prompt.id] || prompt.prompt}
                  onChange={(e) => handleEditChange(prompt.id, e.target.value)}
                />
              </Row>
              <Row>
                <Col xs={12} md="auto" className="mb-2 mb-md-0">
                  <Button variant="primary" onClick={() => handleSave(prompt.id)}>Save</Button>
                </Col>
                <Col xs={12} md="auto" className="mb-2 mb-md-0">
                  <Button variant="outline-danger" className="ml-lg-2 mt-2 mt-lg-0" onClick={() => handleRemove(prompt.id)}>Remove</Button>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
      
      <h2 className="mt-4">Add Custom Prompt</h2>
      <Form>
        <Form.Group controlId="customPromptName">
          <Form.Label>Enter custom prompt name</Form.Label>
          <Form.Control className='new-prompts-form-control'
            type="text" 
            value={customPromptName}
            onChange={(e) => setCustomPromptName(e.target.value)}
            placeholder="Enter custom prompt name"
          />
        </Form.Group>
        <Form.Group controlId="customPromptValue">
          <Form.Label>Enter custom prompt value</Form.Label>
          <Form.Control className='new-prompts-form-control'
            as="textarea" 
            rows={3}
            value={customPromptValue}
            onChange={(e) => setCustomPromptValue(e.target.value)}
            placeholder="Enter custom prompt value"
          />
        </Form.Group>
        <Row className="justify-content-left mt-4">
          <Col xs={12} md="auto" className="mb-2 mb-md-0">
            <Button variant="primary" className="w-100" onClick={addCustomPrompt}>
              Add Custom Prompt
            </Button>
          </Col>
        </Row>
      </Form>
      {isSubmitting && (
        <Loader />
      )}
    </Container>
  );
};

export default L1Prompts;
